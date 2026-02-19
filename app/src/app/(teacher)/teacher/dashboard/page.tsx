
"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [myStudents, setMyStudents] = useState<any[]>([]);
    const [todaySessions, setTodaySessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            // Failsafe timeout
            const timeout = setTimeout(() => {
                if (loading) setLoading(false);
            }, 5000);

            // @ts-ignore
            if (typeof window !== 'undefined' && window.require) {
                try {
                    // @ts-ignore
                    const { ipcRenderer } = window.require('electron');
                    const sessionRes = await ipcRenderer.invoke('db:check-session');
                    if (sessionRes.success) {
                        setCurrentUser(sessionRes);
                        await loadDashboard(sessionRes.id);
                    } else {
                        // valid session not found, redirect to login
                        router.push('/login');
                    }
                } catch (error) {
                    console.error("Init error:", error);
                } finally {
                    clearTimeout(timeout);
                }
            }
        };
        init();
    }, []);

    const loadDashboard = async (teacherId: number) => {
        try {
            // Get Students (via bookings)
            // @ts-ignore
            if (window.require) {
                // @ts-ignore
                const { ipcRenderer } = window.require('electron');
                const res = await ipcRenderer.invoke('db:get-tutor-dashboard', teacherId);
                if (res.my_students) {
                    setMyStudents(res.my_students.slice(0, 4));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-12">
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                        Eğitmen Paneli
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
                        <p className="text-muted-foreground font-semibold uppercase tracking-[0.3em] text-[10px]">
                            Hoş geldin, <span className="text-zinc-900 dark:text-white">{currentUser?.name}</span>! Bugün harika bir gün.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="group relative overflow-hidden">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                    <div className="relative rounded-3xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                        <div className="flex flex-row items-center justify-between pb-4">
                            <h3 className="tracking-widest text-[10px] font-black uppercase text-muted-foreground/60">Toplam Öğrenci</h3>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-black tracking-tighter">{myStudents.length}</div>
                            <p className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">Aktif Danışan</p>
                        </div>
                    </div>
                </div>

                {/* Visual Placeholder for other stats */}
                <div className="rounded-3xl border-2 border-dashed border-border/50 p-8 flex items-center justify-center opacity-40">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Yeni İstatistikler Yakında</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex justify-between items-end px-2">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight">Öğrencilerim</h2>
                        <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Son Etkileşim Kurulanlar</p>
                    </div>
                    <Link
                        href="/teacher/students"
                        className="group flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                    >
                        Tümünü Gör
                        <div className="h-px w-4 bg-blue-600 transition-all group-hover:w-8" />
                    </Link>
                </div>

                {myStudents.length === 0 ? (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 rounded-3xl blur opacity-20" />
                        <div className="relative border-2 border-dashed rounded-3xl bg-white/30 backdrop-blur-sm p-16 text-center space-y-4">
                            <Users className="mx-auto h-16 w-16 text-muted-foreground/20" />
                            <p className="text-lg font-bold text-muted-foreground/60">Henüz size atanmış bir öğrenci bulunmuyor.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {myStudents.map((student) => (
                            <div
                                key={student.id || student.email}
                                onClick={() => router.push(`/teacher/students`)}
                                className="group relative rounded-[2rem] border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative flex flex-col items-center text-center space-y-6">
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0">
                                        <div className="w-full h-full rounded-[14px] bg-white/10 flex items-center justify-center text-4xl font-black text-white">
                                            {student.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {student.name}
                                        </h3>
                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{student.email}</p>
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
