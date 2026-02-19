"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";
import { Loader2, User as UserIcon, Calendar, DollarSign, MessageSquare, Star, ArrowLeft, Users, BookOpen, GraduationCap } from "lucide-react";

export function UserDetailClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (id) {
                const res = await authAPI.getUserDetails(id);
                if (res.success) {
                    setData(res);
                }
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!data || !data.user) return <div className="p-8 text-center text-muted-foreground">Kullanıcı bulunamadı</div>;

    const { user, bookings, comments, stats, matchings } = data;
    const isTeacher = user.role === 'tutor' || user.role === 'teacher';

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Back Button */}
            <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <ArrowLeft size={14} /> Geri Dön
            </button>

            {/* Header / Profile Card */}
            <div className="flex items-start justify-between bg-card border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className={`p-3.5 rounded-2xl ${isTeacher
                        ? 'bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/20 text-violet-600 dark:text-violet-400'
                        : 'bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400'
                        }`}>
                        {isTeacher ? <BookOpen className="h-7 w-7" /> : <GraduationCap className="h-7 w-7" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isTeacher
                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {isTeacher ? 'Öğretmen' : 'Öğrenci'}
                        </div>
                    </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                    <p>Kayıt: {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}</p>
                </div>
            </div>

            {/* Teacher Specific Stats */}
            {isTeacher && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-medium">Toplam Kazanç</span>
                        </div>
                        <div className="text-2xl font-bold">₺{stats.totalEarnings?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">Öğrenci Sayısı</span>
                        </div>
                        <div className="text-2xl font-bold">{matchings?.length || 0}</div>
                    </div>
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Toplam Ders</span>
                        </div>
                        <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                    </div>
                </div>
            )}

            {/* Teacher-Student Matchings */}
            {matchings && matchings.length > 0 && (
                <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {isTeacher ? 'Öğrenci Eşleşmeleri' : 'Öğretmen Eşleşmeleri'}
                        </h3>
                        <span className="text-sm text-muted-foreground">{matchings.length} eşleşme</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5 font-medium">{isTeacher ? 'Öğrenci' : 'Öğretmen'}</th>
                                    <th className="px-6 py-3.5 font-medium">Email</th>
                                    <th className="px-6 py-3.5 font-medium">Toplam Ders</th>
                                    <th className="px-6 py-3.5 font-medium">Toplam Ödeme</th>
                                    <th className="px-6 py-3.5 font-medium">İlk Ders</th>
                                    <th className="px-6 py-3.5 font-medium">Son Ders</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {matchings.map((m: any, idx: number) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                                        onClick={() => {
                                            const targetId = isTeacher ? m.student_id : m.tutor_user_id;
                                            if (targetId) router.push(`/admin/users/detail?id=${targetId}`);
                                        }}
                                    >
                                        <td className="px-6 py-4 font-medium">
                                            {isTeacher ? m.student_name : m.teacher_name}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {isTeacher ? m.student_email : m.teacher_email}
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
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Booking History */}
            <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {isTeacher ? 'Ders Geçmişi' : 'Ders Geçmişi'}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5 font-medium">Tarih</th>
                                <th className="px-6 py-3.5 font-medium">{isTeacher ? 'Öğrenci' : 'Öğretmen'}</th>
                                <th className="px-6 py-3.5 font-medium">Konu</th>
                                <th className="px-6 py-3.5 font-medium">Ücret</th>
                                <th className="px-6 py-3.5 font-medium">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {bookings?.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        {booking.date ? new Date(booking.date).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {isTeacher ? booking.student_name : booking.teacher_name}
                                    </td>
                                    <td className="px-6 py-4">{booking.topic_name || '-'}</td>
                                    <td className="px-6 py-4">₺{booking.amount || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                                            ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                            {booking.status || 'beklemede'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!bookings || bookings.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        Ders kaydı bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reviews Section */}
            {comments && comments.length > 0 && (
                <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Yorumlar & Değerlendirmeler
                        </h3>
                    </div>
                    <div className="divide-y divide-border/50">
                        {comments.map((comment: any, idx: number) => (
                            <div key={idx} className="p-6 hover:bg-muted/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium">{comment.student_name || comment.tutor_name || comment.subject || "Yorum"}</span>
                                    <div className="flex items-center gap-2">
                                        {comment.rating && (
                                            <span className="flex items-center text-yellow-500 text-xs font-bold">
                                                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                                                {comment.rating}/5
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('tr-TR') : ''}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm">{comment.content || comment.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
