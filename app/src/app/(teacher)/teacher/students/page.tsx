"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { User, Search, Mail, BookOpen, Calendar, Loader2, GraduationCap, Video } from "lucide-react";

export default function TeacherStudentsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [students, setStudents] = useState<any[]>([]);
    const [liveLessons, setLiveLessons] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.require) {
                try {
                    // @ts-ignore
                    const { ipcRenderer } = window.require('electron');

                    let userId = user?.id;
                    if (!userId) {
                        const sessionRes = await ipcRenderer.invoke('db:check-session');
                        if (sessionRes.success) userId = sessionRes.id;
                        else { setLoading(false); return; }
                    }

                    if (userId) {
                        const res = await ipcRenderer.invoke('db:get-tutor-dashboard', userId);
                        if (res.success) {
                            setStudents(res.my_students || []);
                            setLiveLessons(res.live_lessons || []);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching students:", e);
                }
            }
            setLoading(false);
        };
        fetchStudents();
    }, [user?.id]);

    const isLessonJoinable = (lesson: any) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[currentTime.getDay()];
        if (lesson.day_of_week !== currentDay) return false;

        const [startH, startM] = lesson.start_time.split(':').map(Number);
        const [endH, endM] = lesson.end_time.split(':').map(Number);

        const startTime = new Date(currentTime);
        startTime.setHours(startH, startM, 0, 0);
        const endTime = new Date(currentTime);
        endTime.setHours(endH, endM, 0, 0);

        const fiveMinsBefore = new Date(startTime.getTime() - 5 * 60000);
        return currentTime >= fiveMinsBefore && currentTime <= endTime;
    };

    const activeLiveLesson = liveLessons.find(isLessonJoinable);

    const filtered = search
        ? students.filter(s =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase())
        )
        : students;

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
            {/* Live Lesson Banner - Premium Redesign */}
            {activeLiveLesson && (
                <div className="group relative overflow-hidden rounded-3xl animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-600 blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                    <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-red-200 dark:border-red-900/30 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-red-500/10">
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left flex-1">
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-2 bg-red-600 rounded-2xl blur opacity-20 animate-pulse" />
                                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30">
                                    <Video className="h-10 w-10 animate-bounce-subtle" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 flex h-6 w-6">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-200/50">
                                    Canlı Ders Başlıyor
                                </div>
                                <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                                    {activeLiveLesson.note || 'Ders'} — <span className="text-red-600">{activeLiveLesson.student_name}</span>
                                </h3>
                                <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-bold text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {activeLiveLesson.start_time.slice(0, 5)} - {activeLiveLesson.end_time.slice(0, 5)}
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 w-full lg:w-auto">
                            <button
                                onClick={async () => {
                                    // @ts-ignore
                                    const { ipcRenderer } = window.require('electron');
                                    const sess = await ipcRenderer.invoke('db:check-session');
                                    if (sess.success) {
                                        const settings = await ipcRenderer.invoke('db:get-tutor-settings', sess.id);
                                        if (settings.success && settings.settings.meeting_link) {
                                            window.open(settings.settings.meeting_link, '_blank');
                                        } else {
                                            alert("Lütfen önce ayarlardan Google Meet linkinizi ayarlayınız.");
                                        }
                                    }
                                }}
                                className="group/btn relative w-full lg:w-auto overflow-hidden rounded-2xl bg-red-600 px-12 py-5 font-black text-white transition-all hover:bg-red-700 hover:shadow-2xl hover:shadow-red-600/40 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                <span className="relative flex items-center justify-center gap-3 text-lg">
                                    DERSİ BAŞLAT
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Öğrencilerim
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
                        Akademik Yolculuklarına Ortak Olduğun {filtered.length} Yetenek
                    </p>
                </div>

                <div className="relative group w-full md:w-80">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                        <input
                            className="flex h-12 w-full rounded-2xl border border-input bg-card/80 backdrop-blur-md px-3 py-2 text-sm pl-12 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                            placeholder="Öğrenci ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 rounded-3xl blur opacity-20" />
                    <div className="relative border-2 border-dashed rounded-3xl bg-card/50 backdrop-blur-sm p-16 text-center space-y-4">
                        <GraduationCap className="mx-auto h-20 w-20 text-muted-foreground/20" />
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-muted-foreground">
                                {search ? 'Arama sonucu bulunamadı.' : 'Henüz öğrenciniz bulunmuyor.'}
                            </p>
                            <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
                                Öğrenciler ders aldığında başarı dolu hikayeleri burada listelenecek.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(student => (
                        <div
                            key={student.id || student.email}
                            className="group relative overflow-hidden"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 p-8 space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-0.5 shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-110">
                                        <div className="w-full h-full rounded-[14px] bg-white/10 flex items-center justify-center text-white">
                                            <GraduationCap className="h-10 w-10" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-extrabold text-xl truncate tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {student.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mt-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{student.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <button
                                        onClick={() => router.push(`/teacher/program?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}`)}
                                        className="w-full group/btn2 relative overflow-hidden flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 h-14 rounded-2xl font-black text-sm tracking-wide transition-all hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover/btn2:opacity-100 transition-opacity duration-300" />
                                        <Calendar className="relative h-5 w-5 transition-transform group-hover/btn2:-translate-y-1" />
                                        <span className="relative">PROGRAM HAZIRLA</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
