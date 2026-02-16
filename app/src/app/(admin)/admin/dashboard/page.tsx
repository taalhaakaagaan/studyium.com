"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";
import { Users, BookOpen, Activity, DollarSign, Loader2, Eye, GraduationCap, Calendar } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await authAPI.getAdminStats();
            if (res.success) {
                setStats(res.stats);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards */}
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Toplam Öğrenci</span>
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                </div>

                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Toplam Öğretmen</span>
                        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
                </div>

                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Toplam Ders</span>
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalLessons || 0}</div>
                </div>

                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Günlük Ziyaretçi</span>
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalVisitors || 0}</div>
                    <p className="text-xs text-muted-foreground">Aylık: {stats?.monthlyVisitors || 0}</p>
                </div>
            </div>

            {/* Active Sessions / Matchings Table */}
            <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Aktif Eşleşmeler (Öğretmen - Öğrenci)
                    </h3>
                    <span className="text-sm text-muted-foreground">{stats?.matchings?.length || 0} eşleşme</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5 font-medium">Öğretmen</th>
                                <th className="px-6 py-3.5 font-medium">Öğrenci</th>
                                <th className="px-6 py-3.5 font-medium">Toplam Ders</th>
                                <th className="px-6 py-3.5 font-medium">Toplam Ödeme</th>
                                <th className="px-6 py-3.5 font-medium">İlk Ders</th>
                                <th className="px-6 py-3.5 font-medium">Son Ders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {stats?.matchings?.map((m: any, idx: number) => (
                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => router.push(`/admin/users/detail?id=${m.tutor_user_id}`)}
                                            className="hover:underline text-left"
                                        >
                                            <div className="font-medium">{m.teacher_name}</div>
                                            <div className="text-xs text-muted-foreground">{m.teacher_email}</div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => router.push(`/admin/users/detail?id=${m.student_id}`)}
                                            className="hover:underline text-left"
                                        >
                                            <div className="font-medium">{m.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{m.student_email}</div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {m.total_lessons} ders
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        ₺{parseFloat(m.total_paid || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {m.first_lesson ? new Date(m.first_lesson).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {m.last_lesson ? new Date(m.last_lesson).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.matchings || stats.matchings.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        Henüz eşleşme bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
