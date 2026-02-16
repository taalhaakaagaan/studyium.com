"use client";

import { useEffect, useState } from "react";
import { Video, Calendar } from "lucide-react";
import { authAPI, useAuthStore } from "@/lib/auth";
import { scheduleAPI } from "@/lib/schedule";

export default function UserDashboard() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [liveSession, setLiveSession] = useState<any>(null);
    const [activeLessons, setActiveLessons] = useState<any[]>([]);
    const [weeklyProgram, setWeeklyProgram] = useState<any[]>([]);
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const init = async () => {
            try {
                const sessionRes = await authAPI.checkSession();
                if (sessionRes.success) {
                    setCurrentUser(sessionRes);
                    checkSchedule(sessionRes.id);
                }
            } catch (error) {
                console.error("Init error:", error);
            }
        };
        init();

        const interval = setInterval(init, 60000);
        return () => clearInterval(interval);
    }, []);

    const checkSchedule = async (studentId: number) => {
        try {
            const res = await scheduleAPI.getSchedule(studentId);
            if (res.success) {
                setActiveLessons(res.active_lessons || []);
                setWeeklyProgram(res.weekly_program || []);

                // Live session logic (simplified for new structure)
                // Check if any weekly program item is current
                /* 
                   Logic to check for live session would go here similar to before, 
                   but mapping over weeklyProgram instead of raw schedule 
                */
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Öğrenci Paneli
                </h1>
                <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
                    Hoş geldin! Bugün harika bir öğrenme günü.
                </p>
            </div>

            {/* Active / Upcoming Lessons List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">Aktif Derslerim</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>

                {activeLessons.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed rounded-3xl bg-muted/20 text-muted-foreground flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                            <Video className="w-6 h-6 opacity-20" />
                        </div>
                        <p className="font-medium">Henüz planlanmış aktif bir dersiniz bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {Object.entries(
                            activeLessons.reduce((acc: any, lesson: any) => {
                                const teacher = lesson.teacher_name || "Bilinmeyen Öğretmen";
                                if (!acc[teacher]) acc[teacher] = [];
                                acc[teacher].push(lesson);
                                return acc;
                            }, {})
                        ).map(([teacherName, lessons]: [string, any], idx) => (
                            <div key={idx} className="group relative overflow-hidden">
                                {/* Glass Card */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative p-6 border rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/20">
                                            <div className="w-full h-full rounded-[14px] bg-white/10 flex items-center justify-center text-white text-2xl font-black">
                                                {teacherName.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-xl truncate tracking-tight">{teacherName}</div>
                                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Eğitmen</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Dersler</div>
                                            <div className="flex flex-wrap gap-2">
                                                {lessons.map((l: any, i: number) => (
                                                    <div key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100/50 dark:border-indigo-800/50">
                                                        {l.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border/50">
                                            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Program</div>
                                            <div className="flex flex-wrap gap-2">
                                                {lessons.map((l: any, i: number) => l.date && (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl text-[11px] font-black border border-border/50 transition-colors hover:bg-indigo-500 hover:text-white group/time">
                                                        <Calendar className="w-3 h-3 opacity-50 group-hover/time:opacity-100" />
                                                        {l.date} • {l.time}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
