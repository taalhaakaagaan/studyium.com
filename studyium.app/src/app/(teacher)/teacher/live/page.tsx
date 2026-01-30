"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Circle, PhoneOff, ExternalLink } from "lucide-react";
import Script from "next/script";

function LiveRoomContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "student";
    const topic = searchParams.get("topic") || "Live Class";
    // We expect 'link' param for Google Meet
    const link = searchParams.get("link") || "";

    // Recording State
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    useEffect(() => {
        if (!link) {
            alert("No meeting link provided.");
            router.back();
        }
    }, [link]);

    const handleLeave = () => {
        if (recording) stopRecording();
        router.push(role === 'teacher' ? '/teacher/dashboard' : '/dashboard');
    };

    // Recording Logic - Captures SCREEN (including the webview)
    const startRecording = async () => {
        try {
            // Confirm with user
            if (!confirm("Start recording this session?")) return;

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks(prev => [...prev, event.data]);
                }
            };

            recorder.onstop = () => {
                saveRecording();
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            // Ignore if user cancelled
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        setRecording(false);
    };

    const saveRecording = () => {
        if (recordedChunks.length === 0) return;

        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        const filename = `Studyium-Lesson-${topic}-${new Date().toISOString().slice(0, 10)}.webm`;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        alert(`Recording saved: ${filename}`);
        setRecordedChunks([]);
    };

    // Webview component (Electron specific)
    const WebView: any = "webview";

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold text-lg">{topic} (Google Meet)</h1>
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        Live
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Link fallback */}
                    <button
                        onClick={() => window.open(link, '_blank')}
                        className="md:hidden p-2 bg-zinc-800 rounded"
                        title="Open in Browser"
                    >
                        <ExternalLink size={16} />
                    </button>

                    {/* Recording Control */}
                    {!recording ? (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors border border-zinc-700"
                        >
                            <Circle size={14} className="fill-red-500 text-red-500" />
                            Record (Screen)
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors animate-pulse"
                        >
                            <Circle size={14} className="fill-white text-white" />
                            Stop Rec
                        </button>
                    )}

                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                    >
                        <PhoneOff size={16} />
                        Leave
                    </button>
                </div>
            </div>

            {/* Google Meet Webview */}
            <div className="flex-1 relative bg-white">
                {link && (
                    <WebView
                        src={link}
                        className="w-full h-full"
                        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        allowpopups="true"
                    />
                )}
            </div>
        </div>
    );
}

export default function LiveRoomPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-white">Loading...</div>}>
            <LiveRoomContent />
        </Suspense>
    );
}
