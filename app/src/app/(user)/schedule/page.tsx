"use client";

import { useEffect, useState } from "react";
import { authAPI, useAuthStore } from "@/lib/auth";
import { scheduleAPI } from "@/lib/schedule";
import { Loader2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function MySchedulePage() {
    const { user } = useAuthStore();
    const [weeklyProgram, setWeeklyProgram] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000); // update every 30s
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const sessionRes = await authAPI.checkSession();
                if (!sessionRes || !sessionRes.success || !sessionRes.id) {
                    if (user?.id) {
                        const res = await scheduleAPI.getSchedule(user.id);
                        if (res.success) setWeeklyProgram(res.weekly_program || []);
                    }
                    setLoading(false);
                    return;
                }

                const res = await scheduleAPI.getSchedule(sessionRes.id);
                if (res.success) {
                    setWeeklyProgram(res.weekly_program || []);
                }
            } catch (e: any) {
                console.error("Error fetching schedule:", e);
            }
            setLoading(false);
        };
        fetchSchedule();
    }, [user?.id]);

    const isLessonJoinable = (event: any) => {
        if (!event.is_live) return false;

        // Get day of week in English
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[currentTime.getDay()];
        if (event.day_of_week !== currentDay) return false;

        const [startH, startM] = event.start_time.split(':').map(Number);
        const [endH, endM] = event.end_time.split(':').map(Number);

        const startTime = new Date(currentTime);
        startTime.setHours(startH, startM, 0, 0);

        const endTime = new Date(currentTime);
        endTime.setHours(endH, endM, 0, 0);

        const fiveMinsBefore = new Date(startTime.getTime() - 5 * 60000);

        return currentTime >= fiveMinsBefore && currentTime <= endTime;
    };

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const TURKISH_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        Haftalık Programım
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
                        Gelecek derslerini takip et ve yönet
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20" />
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        {format(currentTime, 'HH:mm')}
                    </span>
                    <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-800" />
                    <span className="text-xs font-semibold text-muted-foreground">
                        {format(currentTime, 'EEEE', { locale: tr })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-5 overflow-visible">
                {DAYS.map((day, dayIdx) => (
                    <div key={day} className="flex flex-col gap-4 min-w-0">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                            <div className="relative font-bold text-center py-3 bg-white dark:bg-zinc-900 rounded-xl border border-border/50 shadow-sm">
                                <span className="bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    {TURKISH_DAYS[dayIdx]}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-h-[100px]">
                            {weeklyProgram
                                .filter(event => event.day_of_week === day)
                                .map((event, idx) => {
                                    const joinable = isLessonJoinable(event);
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "group/card p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                                event.is_live
                                                    ? joinable
                                                        ? "bg-red-50/80 dark:bg-red-900/40 border-red-200 dark:border-red-800 shadow-xl shadow-red-500/10 scale-[1.02] z-10"
                                                        : "bg-red-50/30 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/30 opacity-80"
                                                    : "bg-white/50 dark:bg-zinc-900/50 border-border shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 backdrop-blur-md"
                                            )}
                                        >
                                            {/* Decorative Background Elements */}
                                            <div className={cn(
                                                "absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl opacity-20 transition-all group-hover/card:scale-150",
                                                event.is_live ? "bg-red-500" : "bg-indigo-500"
                                            )} />

                                            <div className="relative space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className={cn(
                                                        "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                                                        event.is_live
                                                            ? "text-red-600 border-red-200 bg-red-100/50"
                                                            : "text-indigo-600 border-indigo-200 bg-indigo-100/50"
                                                    )}>
                                                        {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                                                    </div>

                                                    {event.is_live && (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={cn("w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.5)]", joinable && "animate-pulse")} />
                                                            <span className="text-[10px] font-extrabold text-red-600 tracking-tighter">LIVE</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="font-bold text-sm leading-tight line-clamp-2">
                                                        {event.lesson_name || event.note || 'Planlanmış Ders'}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                        {event.teacher_name}
                                                    </div>
                                                </div>

                                                {event.is_live && joinable && (
                                                    <a
                                                        href={event.meeting_link || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-4 w-full relative group/btn"
                                                    >
                                                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition duration-200" />
                                                        <div className="relative bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95">
                                                            <Video className="w-3.5 h-3.5" />
                                                            DERSE KATIL
                                                        </div>
                                                    </a>
                                                )}

                                                {event.note && event.lesson_name && (
                                                    <div className={cn(
                                                        "text-[10px] text-muted-foreground/70 italic line-clamp-1 border-t pt-2 mt-2",
                                                        event.is_live ? "border-red-200/50" : "border-border/50"
                                                    )}>
                                                        {event.note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
