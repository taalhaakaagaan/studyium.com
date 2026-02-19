"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, CheckCircle, XCircle, Clock, Phone } from "lucide-react";

export default function AdminBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            if (window.require) {
                // @ts-ignore
                const { ipcRenderer } = window.require('electron');
                const res = await ipcRenderer.invoke('db:get-all-bookings');
                if (res.success) setBookings(res.bookings || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (id: number, status: string) => {
        if (!confirm(`Bu randevuyu ${status === 'approved' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;
        try {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            const res = await ipcRenderer.invoke('db:update-booking-status', { id, status });
            if (res.success) {
                fetchBookings();
            } else {
                alert("İşlem başarısız: " + res.message);
            }
        } catch (e) {
            alert("Hata oluştu.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Randevu Yönetimi</h2>
                <div className="text-sm text-muted-foreground">
                    {bookings.length} randevu
                </div>
            </div>

            <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5 font-medium">Öğrenci</th>
                                    <th className="px-6 py-3.5 font-medium">Telefon</th>
                                    <th className="px-6 py-3.5 font-medium">Eğitmen</th>
                                    <th className="px-6 py-3.5 font-medium">Tarih</th>
                                    <th className="px-6 py-3.5 font-medium">Durum</th>
                                    <th className="px-6 py-3.5 font-medium">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {bookings.map((book) => (
                                    <tr key={book.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{book.student_name} {book.student_surname}</div>
                                            <div className="text-xs text-muted-foreground">{book.student_email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span>{book.student_phone || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{book.tutor_name} {book.tutor_surname}</div>
                                            <div className="text-xs text-muted-foreground">{book.tutor_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(book.created_at).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    book.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {book.status === 'approved' ? 'Onaylandı' : book.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {book.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleStatus(book.id, 'approved')} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Onayla">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleStatus(book.id, 'rejected')} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Reddet">
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                            Randevu bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
