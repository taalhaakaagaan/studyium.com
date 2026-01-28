
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
            if (typeof window !== 'undefined' && (window as any).electron) {
                try {
                    const sessionRes = await (window as any).electron.invoke('db:check-session');
                    if (sessionRes.success) {
                        setCurrentUser(sessionRes);
                        loadDashboard(sessionRes.id);
                    }
                } catch (error) {
                    console.error("Init error:", error);
                }
            }
        };
        init();
    }, []);

    const loadDashboard = async (teacherId: number) => {
        try {
            // Get Students (via bookings or raw) - simplified for now
            // We'll reuse get-user-details logic or just fetch all for demo if needed, 
            // but let's stick to what we need. 
            // The original mocked logic filtered assignments.
            // Let's rely on 'db:get-user-details' to get recent interactions or stats.
            const userDetails = await (window as any).electron.invoke('db:get-user-details', teacherId);
            // It doesn't return list of students directly in a nice array for this view, 
            // but let's fetch 'db:get-users' purely for display if we want "My Students".
            // Or just keep the mock for students list if scope is just Schedule.
            // BUT, the task is about Live Button.

            // fetch Schedule
            const scheduleRes = await (window as any).electron.invoke('db:get-schedule', { teacherId });
            if (scheduleRes.success) {
                filterTodaySessions(scheduleRes.schedule);
            }

            // Keep mock students for UI fullness if needed, or fetch real.
            // Let's try to fetch real students relevant to teacher if possible, else keep mock?
            // "The user... verify end-to-end". Real is better.
            const usersRes = await (window as any).electron.invoke('db:get-users', { role: 'student' });
            if (usersRes.success) setMyStudents(usersRes.users.slice(0, 4)); // Just show some

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filterTodaySessions = (schedule: any[]) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        const nowHour = new Date().getHours();

        const todays = schedule.filter((s: any) => s.day_of_week === today);
        // Sort by time
        todays.sort((a: any, b: any) => parseInt(a.start_time) - parseInt(b.start_time));

        setTodaySessions(todays);
    };

    const handleStartLive = async (session: any) => {
        // Create live session in DB if not exists (optional, or just go to room)
        // We go to room. Room handles "creation" or state?
        // Actually, 'db:create-live-session' exists.
        // Let's create it to generate a link/active status.
        try {
            const res = await (window as any).electron.invoke('db:create-live-session', {
                teacherId: currentUser.id,
                topic: session.note || "Live Lesson",
                participants: session.student_id ? [session.student_id] : [], // or group members
                link: "" // generate or empty
            });
            // Redirect
            router.push(`/teacher/live?role=teacher&topic=${encodeURIComponent(session.note || "Lesson")}`);
        } catch (e) {
            console.error(e);
            router.push(`/teacher/live?role=teacher`);
        }
    };

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {currentUser?.name}!</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Students</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{myStudents.length}</div>
                    <p className="text-xs text-muted-foreground">Visible on platform</p>
                </div>
            </div>

            {/* Live Today Section */}
            <div className="rounded-xl border bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users size={120} />
                </div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Today's Sessions ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
                </h2>

                <div className="space-y-3 relative z-10">
                    {todaySessions.length === 0 ? (
                        <div className="text-muted-foreground text-sm italic py-4">
                            No sessions scheduled for today.
                        </div>
                    ) : (
                        todaySessions.map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-sm border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="text-lg font-bold font-mono text-muted-foreground">
                                        {session.start_time.slice(0, 5)}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{session.group_name || session.student_name || "Private Lesson"}</div>
                                        <div className="text-sm text-muted-foreground">{session.note || "No topic"}</div>
                                    </div>
                                </div>
                                {session.is_live && (
                                    <button
                                        onClick={() => handleStartLive(session)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                    >
                                        <Video className="h-4 w-4" />
                                        Start Live Class
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">My Students (Recent)</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {myStudents.map((student) => (
                        <div key={student.id} className="group relative rounded-xl border bg-card shadow transition-all hover:shadow-md">
                            <div className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{student.name}</h3>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
