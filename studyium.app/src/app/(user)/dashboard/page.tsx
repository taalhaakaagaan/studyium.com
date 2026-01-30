"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { useAuthStore } from "@/lib/auth"; // Keep auth store if used, or use electron session

export default function UserDashboard() {
    // const { user } = useAuthStore(); // Switching to electron session for consistency
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [liveSession, setLiveSession] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined' && (window as any).electron) {
                try {
                    const sessionRes = await (window as any).electron.invoke('db:check-session');
                    if (sessionRes.success) {
                        setCurrentUser(sessionRes);
                        checkSchedule(sessionRes.id);
                    }
                } catch (error) {
                    console.error("Init error:", error);
                }
            }
        };
        init();

        // Poll every minute
        const interval = setInterval(init, 60000);
        return () => clearInterval(interval);
    }, []);

    const checkSchedule = async (studentId: number) => {
        try {
            const res = await (window as any).electron.invoke('db:get-schedule', { studentId });
            if (res.success) {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const today = days[new Date().getDay()];
                const nowHour = new Date().getHours();

                // Find active session
                // Logic: Day matches, and Current Hour is within Start-End
                // And simple check: Start hour == Current hour (for now, or logic for durations)
                // "saatler geldiği zaman" -> when time comes.
                const currentFn = res.schedule.find((s: any) => {
                    if (s.day_of_week !== today) return false;
                    const [startH, startM] = s.start_time.split(':').map(Number);
                    const [endH, endM] = s.end_time.split(':').map(Number);

                    const nowMinutes = nowHour * 60 + new Date().getMinutes();
                    const startTotal = startH * 60 + (startM || 0);
                    const endTotal = endH * 60 + (endM || 0);

                    return nowMinutes >= startTotal && nowMinutes < endTotal; // Is currently happening
                });

                if (currentFn) {
                    // Check if there is an active broadcast for this teacher
                    const liveRes = await (window as any).electron.invoke('db:get-active-broadcasts');
                    let isLive = false;

                    if (liveRes.success && liveRes.broadcasts) {
                        // Check if this teacher is live
                        // Try both teacher_id and tutor_id from schedule item
                        const teacherId = currentFn.teacher_id || currentFn.tutor_id;
                        const broadcast = liveRes.broadcasts.find((b: any) => b.teacher_id == teacherId);

                        if (broadcast) {
                            currentFn.note = broadcast.topic || currentFn.note;
                            currentFn.is_live = true;
                            isLive = true;
                        }
                    }

                    if (isLive) {
                        setLiveSession(currentFn);
                    } else {
                        setLiveSession(null);
                    }
                } else {
                    setLiveSession(null);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>

            {/* Live Class Banner */}
            {liveSession && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="font-bold uppercase tracking-wider text-xs bg-white/20 px-2 py-0.5 rounded">Live Now</span>
                            </div>
                            <h2 className="text-2xl font-bold">{liveSession.note || "Live Class"}</h2>
                            <p className="text-white/80">
                                {liveSession.group_name ? `Group: ${liveSession.group_name}` : "Private Lesson"} currently in progress.
                            </p>
                        </div>
                        <a
                            href={`/teacher/live?role=student&topic=${encodeURIComponent(liveSession.note || "Lesson")}&link=${encodeURIComponent(liveSession.link || "")}&roomId=${liveSession.teacher_id || liveSession.tutor_id}`}
                            className="bg-white text-indigo-600 hover:bg-white/90 px-6 py-3 rounded-lg font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <Video className="h-5 w-5" />
                            Join Class
                        </a>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm text-muted-foreground">Next Lesson</span>
                        <span className="text-2xl font-bold">Mathematics</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
