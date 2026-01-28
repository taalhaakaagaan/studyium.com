"use client";

import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MessageSquare, Clock, User as UserIcon, Users, BookOpen, GraduationCap } from "lucide-react";

type Booking = {
    id: number;
    lesson_name: string;
    tutor_name: string;
    tutor_surname: string;
    booking_date: string;
    status: string;
    meeting_link?: string;
    // For Tutor View
    student_name?: string;
    student_surname?: string;
    student_email?: string;
    note?: string;
    // Payment Info
    lesson_price?: string;
    account_name?: string;
    iban?: string;
};

type Message = {
    id: number;
    title: string;
    content: string;
    date: string;
};

// Tutor Specific Types
type TutorTopic = {
    name: string;
    price: string;
    fake_price?: string;
    lesson_name: string;
    category: string;
};

type Student = {
    name: string;
    surname: string;
    email: string;
    gsm: string;
};

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard"); // Renamed default for tutors

    // Student State
    const [appointments, setAppointments] = useState<Booking[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    // Tutor State
    const [tutorData, setTutorData] = useState<{
        upcoming_bookings: Booking[],
        past_bookings: Booking[],
        my_students: Student[],
        my_topics: TutorTopic[],
        earnings?: { total: number, transactions: any[] }
    } | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            if (user.role === 'tutor') {
                // Fetch Tutor Dashboard Data
                fetch(`/api/tutor/get_dashboard.php?user_id=${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.tutor_details) {
                            // Fetch earnings separately
                            fetch(`/api/tutor/get_payments.php?user_id=${user.id}`)
                                .then(res => res.json())
                                .then(earningsData => {
                                    setTutorData({
                                        ...data,
                                        earnings: {
                                            total: earningsData.total_amount,
                                            transactions: earningsData.transactions
                                        }
                                    });
                                });
                            setTutorData(data);
                        }
                    })
                    .catch(err => console.error("Tutor fetch error", err));
            } else {
                // Fetch Student Data (Existing)
                fetch('/api/profile.php?action=get_appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id })
                })
                    .then(res => res.json())
                    .then(data => setAppointments(data));
                setActiveTab('appointments');
            }

            // Messages are shared
            fetch('/api/profile.php?action=get_messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            })
                .then(res => res.json())
                .then(data => setMessages(data));
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="min-h-screen bg-background flex items-center justify-center">Yükleniyor...</div>;

    const isTutor = user.role === 'tutor';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto p-4 py-8 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 text-center">
                            <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center text-primary">
                                <UserIcon className="h-10 w-10" />
                            </div>
                            <h2 className="text-xl font-bold">{user.name} {user.surname}</h2>
                            <p className="text-muted-foreground text-sm">{user.email}</p>
                            {isTutor && <span className="inline-block mt-2 px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">Eğitmen</span>}
                        </div>

                        <nav className="bg-card border border-border rounded-xl p-2 space-y-1">
                            {isTutor ? (
                                <>
                                    <button
                                        onClick={() => setActiveTab('dashboard')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <Calendar className="h-5 w-5" /> Randevular
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'students' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <Users className="h-5 w-5" /> Öğrencilerim
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('my_lessons')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'my_lessons' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <BookOpen className="h-5 w-5" /> Derslerim
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <div className="h-5 w-5 flex items-center justify-center">⚙️</div> Ayarlar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setActiveTab('appointments')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'appointments' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <Calendar className="h-5 w-5" /> Aktif Randevular
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <Clock className="h-5 w-5" /> Geçmiş Dersler
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('payments')}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'payments' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                    >
                                        <div className="h-5 w-5 flex items-center justify-center">💳</div> Ödemeler
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                            >
                                <MessageSquare className="h-5 w-5" /> Mesajlarım
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {/* ---------------- TUTOR VIEW ---------------- */}
                        {isTutor && tutorData && (
                            <>
                                {activeTab === 'dashboard' && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold">Yaklaşan Randevular</h2>
                                        <div className="space-y-4">
                                            {tutorData.upcoming_bookings.map(book => (
                                                <div key={book.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4">
                                                    <div>
                                                        <div className="font-bold text-lg">{book.student_name} {book.student_surname}</div>
                                                        <div className="text-muted-foreground text-sm">{new Date(book.booking_date).toLocaleString('tr-TR')}</div>
                                                        {book.note && <div className="mt-2 text-sm bg-muted p-2 rounded">Not: {book.note}</div>}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${book.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>{book.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {tutorData.upcoming_bookings.length === 0 && <div className="text-muted-foreground">Yaklaşan randevu yok.</div>}
                                        </div>

                                        <h2 className="text-xl font-bold pt-8 border-t border-border">Geçmiş Randevular</h2>
                                        <div className="space-y-4">
                                            {tutorData.past_bookings.map(book => (
                                                <div key={book.id} className="opacity-75 bg-muted/20 border border-border rounded-xl p-4 flex justify-between">
                                                    <div>
                                                        <div className="font-bold">{book.student_name} {book.student_surname}</div>
                                                        <div className="text-xs">{new Date(book.booking_date).toLocaleString('tr-TR')}</div>
                                                    </div>
                                                    <span className="text-xs font-bold">{book.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'students' && (
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold">Öğrencilerim</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutorData.my_students.map((s, i) => (
                                                <div key={i} className="bg-card border border-border rounded-xl p-6">
                                                    <div className="font-bold text-lg">{s.name}</div>
                                                    <div className="text-muted-foreground">{s.email}</div>
                                                    <div className="text-sm mt-2">{s.gsm}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'my_lessons' && (
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold">Verdiğim Dersler</h2>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left bg-card border border-border rounded-xl overflow-hidden">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="p-4">Ders</th>
                                                        <th className="p-4">Kategori</th>
                                                        <th className="p-4">Konu</th>
                                                        <th className="p-4">Fiyat</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tutorData.my_topics.map((t, i) => (
                                                        <tr key={i} className="border-t border-border">
                                                            <td className="p-4 font-bold">{t.lesson_name}</td>
                                                            <td className="p-4"><span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-bold">{t.category}</span></td>
                                                            <td className="p-4">{t.name}</td>
                                                            <td className="p-4 font-mono">{t.price} TL</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}


                                {activeTab === 'earnings' && tutorData.earnings && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold">Kazanç Durumu</h2>

                                        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm">
                                            <div>
                                                <h3 className="text-lg text-muted-foreground">Toplam Onaylanan Kazanç</h3>
                                                <p className="text-4xl font-bold mt-2 text-green-500">{tutorData.earnings.total} TL</p>
                                            </div>
                                            <div className="p-4 bg-green-500/20 rounded-full text-green-500">
                                                <GraduationCap className="h-10 w-10" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold">Ödeme Geçmişi</h3>
                                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="p-4 font-medium">Öğrenci</th>
                                                        <th className="p-4 font-medium">Tutar</th>
                                                        <th className="p-4 font-medium">Tarih</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tutorData.earnings.transactions.map((tx: any) => (
                                                        <tr key={tx.id} className="border-t border-border hover:bg-muted/50">
                                                            <td className="p-4">{tx.student}</td>
                                                            <td className="p-4 font-mono font-bold text-green-600">+{tx.amount} TL</td>
                                                            <td className="p-4 text-sm text-muted-foreground">{new Date(tx.date).toLocaleString('tr-TR')}</td>
                                                        </tr>
                                                    ))}
                                                    {tutorData.earnings.transactions.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="p-8 text-center text-muted-foreground">Henüz onaylanmış kazanç kaydı yok.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold">Ödeme Ayarları</h2>
                                        <div className="bg-card border border-border rounded-xl p-6">
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                const form = e.target as HTMLFormElement;
                                                const payload = {
                                                    user_id: user.id,
                                                    account_name: (form.elements.namedItem('account_name') as HTMLInputElement).value,
                                                    iban: (form.elements.namedItem('iban') as HTMLInputElement).value
                                                };
                                                fetch('/api/tutor/update_payment_info.php', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(payload)
                                                })
                                                    .then(res => res.json())
                                                    .then(res => {
                                                        if (res.success) alert("Bilgiler güncellendi.");
                                                        else alert("Hata: " + res.message);
                                                    });
                                            }}>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Banka Hesap Sahibi (Ad Soyad)</label>
                                                        <input name="account_name" type="text" className="w-full p-3 bg-background border border-border rounded-lg" placeholder="Ad Soyad" defaultValue={(tutorData as any).tutor_details?.bank_account_name || ''} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">IBAN (TR...)</label>
                                                        <input name="iban" type="text" className="w-full p-3 bg-background border border-border rounded-lg" placeholder="TR..." defaultValue={(tutorData as any).tutor_details?.iban || ''} />
                                                    </div>
                                                    <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">Kaydet</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ---------------- STUDENT VIEW ---------------- */}
                        {!isTutor && activeTab === 'appointments' && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold mb-6">Aktif Randevularınız</h2>
                                {appointments.length > 0 ? appointments.map(booking => (
                                    <div key={booking.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{booking.lesson_name}</h3>
                                            <p className="text-muted-foreground">{booking.tutor_name} {booking.tutor_surname}</p>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(booking.booking_date).toLocaleString('tr-TR')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'approved'
                                                ? 'bg-green-500/10 text-green-500'
                                                : booking.status === 'rejected'
                                                    ? 'bg-red-500/10 text-red-500'
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {booking.status === 'approved' ? 'Onaylandı' : booking.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                            </span>
                                            {booking.meeting_link && (
                                                <a href={booking.meeting_link} target="_blank" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90">
                                                    Derse Katıl
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
                                        Henüz planlanmış bir randevunuz yok.
                                    </div>
                                )}
                            </div>
                        )}

                        {!isTutor && activeTab === 'payments' && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold mb-6">Ödemeler</h2>
                                <p className="text-muted-foreground mb-4">Onaylanmış dersleriniz için ödeme bilgileri aşağıdadır.</p>
                                {appointments.filter(b => b.status === 'approved').length > 0 ? appointments.filter(b => b.status === 'approved').map(booking => (
                                    <div key={booking.id} className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{booking.lesson_name}</h3>
                                                <p className="text-muted-foreground">{booking.tutor_name} {booking.tutor_surname}</p>
                                                <div className="text-sm mt-1">{new Date(booking.booking_date).toLocaleString('tr-TR')}</div>
                                            </div>
                                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Onaylandı</span>
                                        </div>

                                        <div className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border">
                                            <h4 className="font-bold text-sm text-primary mb-2">Ödeme Bilgileri</h4>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tutar:</span>
                                                <span className="font-mono font-bold">{booking.lesson_price ? booking.lesson_price + ' TL' : '-'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">IBAN:</span>
                                                <span className="font-mono select-all font-medium">{booking.iban || 'Belirtilmemiş'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Hesap Sahibi:</span>
                                                <span className="font-medium">{booking.account_name || 'Belirtilmemiş'}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-3 italic">* Lütfen ödeme yaparken açıklama kısmına Ad Soyad belirtin.</p>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
                                        Ödeme yapılacak onaylı dersiniz bulunmamaktadır.
                                    </div>
                                )}
                            </div>
                        )}

                        {!isTutor && activeTab === 'history' && (
                            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
                                Geçmiş ders kaydı bulunamadı.
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold mb-6">Mesaj Kutusu</h2>
                                {messages.map(msg => (
                                    <div key={msg.id} className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold">{msg.title}</h3>
                                            <span className="text-xs text-muted-foreground">
                                                {(() => {
                                                    if (!msg.date) return "";
                                                    try {
                                                        const d = new Date(msg.date);
                                                        return isNaN(d.getTime()) ? msg.date : d.toLocaleDateString('tr-TR');
                                                    } catch {
                                                        return msg.date;
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{msg.content}</p>
                                    </div>
                                ))}
                                {messages.length === 0 && <div className="text-muted-foreground">Mesajınız yok.</div>}
                            </div>
                        )}
                    </div>
                </div >
            </main >
        </div >
    );
}






