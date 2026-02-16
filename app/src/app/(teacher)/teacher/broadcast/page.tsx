"use client";

import { Mic, Video, MonitorPlay, CheckCircle, Disc, UserPlus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { authAPI, useAuthStore, chatAPI } from "@/lib/auth";
import { ScreenRecorder, recorderAPI } from "@/lib/recorder";

export default function BroadcastPage() {
    const { user } = useAuthStore();
    const [broadcasting, setBroadcasting] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recorder, setRecorder] = useState<any>(null);
    const [link, setLink] = useState("");

    // Students selection
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    useEffect(() => {
        const loadStudents = async () => {
            // Fetch all students for now (or connected students)
            // Using getUsers('user') from authAPI (aliased in chatAPI?)
            // authAPI.getUsers exists.
            const res = await authAPI.getUsers('user');
            if (res.success) {
                setStudents(res.users || []);
            }
            setLoadingStudents(false);
        };
        loadStudents();
    }, []);

    const toggleStudent = (id: number) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleStartBroadcast = async () => {
        if (!user) return;

        const roomName = `Studyium-Live-${user.id}-${Date.now().toString().slice(-4)}`;
        const generatedLink = `https://meet.jit.si/${roomName}`;

        // Select all if none selected? Or force selection?
        // Let's assume if none selected, it's public/all? Or require 1.
        // User implied selection.
        const participants = selectedStudents.length > 0 ? selectedStudents : students.map(s => s.id);

        const res = await chatAPI.createLiveSession({
            teacherId: user.id,
            topic: "Live Class Session",
            participants,
            link: generatedLink
        });

        if (res.success) {
            setBroadcasting(true);
            setLink(generatedLink);
            window.open(generatedLink, '_blank');
        }
    };

    // Recording logic... (Keep existing)
    const toggleRecording = async () => {
        if (recording && recorder) {
            const blob = await recorder.stop();
            setRecording(false);
            const fileName = `Lesson-${new Date().toISOString().replace(/:/g, '-')}.webm`;
            await recorderAPI.saveRecording(blob, fileName);
            setRecorder(null);
        } else {
            const newRecorder = new ScreenRecorder();
            const started = await newRecorder.start();
            if (started) {
                setRecorder(newRecorder);
                setRecording(true);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Broadcast</h1>
                <p className="text-muted-foreground">Start a live session with your students.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Controls */}
                <div className="lg:col-span-2 rounded-xl border bg-card p-12 text-center space-y-6">
                    <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center animate-pulse ${broadcasting ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                        {broadcasting ? <CheckCircle className="h-12 w-12 text-green-600" /> : <MonitorPlay className="h-12 w-12 text-red-600 dark:text-red-400" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{broadcasting ? "You are Live!" : "Ready to go live?"}</h2>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            {broadcasting
                                ? "Selected students have been notified."
                                : "Select students on the right and start broadcasting."}
                        </p>
                    </div>

                    {!broadcasting && (
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleStartBroadcast}
                                disabled={loadingStudents}
                                className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                            >
                                Start Broadcast
                            </button>
                        </div>
                    )}

                    {broadcasting && (
                        <div className="flex flex-col items-center gap-4">
                            <button onClick={() => window.open(link, '_blank')} className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow">
                                Re-join Meeting
                            </button>
                            <button onClick={() => setBroadcasting(false)} className="text-sm text-red-500 hover:underline">End Session</button>
                        </div>
                    )}
                </div>

                {/* Student Selector */}
                <div className="border bg-card rounded-xl flex flex-col h-[500px]">
                    <div className="p-4 border-b bg-muted/20">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" /> Select Students
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loadingStudents ? <div className="p-4 text-center">Loading...</div> : students.map(s => (
                            <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(s.id)}
                                    onChange={() => toggleStudent(s.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="text-sm font-medium">{s.name}</div>
                            </label>
                        ))}
                    </div>
                    <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground text-center">
                        {selectedStudents.length} selected
                    </div>
                </div>
            </div>
        </div>
    );
}
