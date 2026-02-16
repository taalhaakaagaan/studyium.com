
export class ScreenRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];

    async start() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 30 },
                audio: true
            });

            // Try to capture mic audio too if possible, and merge? 
            // navigator.mediaDevices.getUserMedia({ audio: true }) ...
            // For simplicity, DisplayMedia usually captures system audio. 

            this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            return true;
        } catch (err) {
            console.error("Error starting recording:", err);
            return false;
        }
    }

    stop(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                return reject("No recorder");
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                this.recordedChunks = [];
                resolve(blob);
            };

            this.mediaRecorder.stop();
            // Stop tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }

    isRecording() {
        return this.mediaRecorder?.state === 'recording';
    }
}

export const recorderAPI = {
    saveRecording: async (blob: Blob, defaultName: string) => {
        // @ts-ignore
        if (window.require) {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');

            // 1. Ask user where to save
            const { filePath } = await ipcRenderer.invoke('app:show-save-dialog', {
                defaultPath: defaultName
            });

            if (!filePath) return { success: false, cancelled: true };

            // 2. Convert Blob to ArrayBuffer to send over IPC
            const arrayBuffer = await blob.arrayBuffer();

            // 3. Save
            return await ipcRenderer.invoke('app:save-file', {
                filePath,
                buffer: arrayBuffer
            });
        }

        // Fallback for web: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        a.click();
        return { success: true };
    }
};
