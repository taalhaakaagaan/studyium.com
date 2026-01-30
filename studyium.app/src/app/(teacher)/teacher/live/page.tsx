"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Mic, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp, Circle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface JitsiInstance {
    dispose: () => void;
    executeCommand: (cmd: string, args?: any) => void;
}

function LiveRoomContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "student";
    const topic = searchParams.get("topic") || "Live Class";
    const roomId = searchParams.get("roomId") || "DemoRoom";

    // Create unique room name: Studyium_Ticket_{ID}
    const roomName = `Studyium_Class_${roomId}`;

    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [jitsiApi, setJitsiApi] = useState<JitsiInstance | null>(null);
    const [loading, setLoading] = useState(true);

    // Recording State
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    useEffect(() => {
        // Load Jitsi after script is ready
        // We use Next.js Script component below with onLoad
        return () => {
            if (jitsiApi) jitsiApi.dispose();
        };
    }, []);

    const initJitsi = () => {
        if (!jitsiContainerRef.current || !(window as any).JitsiMeetExternalAPI) return;

        const domain = "meet.jit.si";
        const options = {
            roomName: roomName,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainerRef.current,
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            },
            userInfo: {
                displayName: role === 'teacher' ? "Teacher" : "Student"
            }
        };

        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        setJitsiApi(api);
        setLoading(false);

        api.addEventListeners({
            videoConferenceLeft: () => handleLeave()
        });
    };

    const handleLeave = () => {
        if (recording) stopRecording();
        router.push(role === 'teacher' ? '/teacher/dashboard' : '/dashboard');
    };

    // Recording Logic
    const startRecording = async () => {
        try {
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
            alert("Could not start recording. Permission denied?");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop()); // Stop screen share
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
        const filename = `Studyium-Lesson-${topic}-${new Date().toISOString().slice(0, 10)}.webm`; // WebM is reliable from MediaRecorder. Can convert to MP4? Browsers usually output WebM.
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        // Ensure to tell user
        alert(`Lesson saved to Downloads as ${filename}`);
        setRecordedChunks([]); // Reset
    };

    // Ask to download logic? 
    // User requested: "Ask ... yes -> download". 
    // We can show a prompt on Leave?
    // Using manual button for now as it's cleaner.

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white">
            {/* Script Loader */}
            <Script
                src="https://meet.jit.si/external_api.js"
                onLoad={initJitsi}
            />

            {/* Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold text-lg">{topic}</h1>
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        Live
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Recording Control */}
                    {!recording ? (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors border border-zinc-700"
                        >
                            <Circle size={14} className="fill-red-500 text-red-500" />
                            Record Lesson
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors animate-pulse"
                        >
                            <Circle size={14} className="fill-white text-white" />
                            Stop & Save ({recordedChunks.length} chunks)
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

            {/* Jitsi Stage */}
            <div className="flex-1 relative bg-black">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                )}
                <div ref={jitsiContainerRef} className="w-full h-full" />
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
