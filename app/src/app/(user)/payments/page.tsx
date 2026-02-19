"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth"; // fallback
import { Loader2, DollarSign, Wallet } from "lucide-react";

export default function PaymentsPage() {
    const [user, setUser] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0 });

    useEffect(() => {
        const init = async () => {
            // @ts-ignore
            if (window.require) {
                // @ts-ignore
                const { ipcRenderer } = window.require('electron');
                const session = await ipcRenderer.invoke('db:check-session');
                if (session.success) {
                    setUser(session);
                    fetchPayments(session.id);
                } else {
                    setLoading(false);
                }
            }
        };
        init();
    }, []);

    const fetchPayments = async (userId: number) => {
        try {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            const res = await ipcRenderer.invoke('db:get-student-payments', userId);
            if (res.success) {
                const rawPayments = res.payments || [];

                // Group by Tutor
                const grouped = Object.values(rawPayments.reduce((acc: any, p: any) => {
                    const key = `${p.tutor_name} ${p.tutor_surname}-${p.iban}`;
                    if (!acc[key]) {
                        acc[key] = {
                            id: p.id,
                            tutor_name: p.tutor_name,
                            tutor_surname: p.tutor_surname,
                            iban: p.iban,
                            account_name: p.account_name,
                            total_amount: 0,
                            lessons: []
                        };
                    }
                    acc[key].total_amount += parseFloat(p.lesson_price || '0');
                    acc[key].lessons.push(`${p.lesson_name} (${new Date(p.booking_date).toLocaleDateString('tr-TR')})`);
                    return acc;
                }, {}));

                setPayments(grouped);
                const total = grouped.reduce((sum: number, p: any) => sum + p.total_amount, 0);
                setStats({ total });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Ödemelerim</h2>
                <div className="mb-8 bg-card border px-4 py-2 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Toplam Ödenecek</p>
                        <p className="text-xl font-bold text-foreground">{stats.total} TL</p>
                    </div>
                </div>
            </div>

            <p className="text-muted-foreground">Onaylanmış dersleriniz için ödeme bilgileri aşağıdadır. (Eğitmen bazlı gruplanmıştır)</p>

            <div className="space-y-4">
                {payments.length > 0 ? (
                    payments.map((group: any) => (
                        <div key={group.id} className="bg-card border rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{group.tutor_name} {group.tutor_surname}</h3>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {group.lessons.length} Ders: {group.lessons.join(', ')}
                                    </div>
                                </div>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Ödeme Bekliyor</span>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border/50">
                                <h4 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Ödeme Bilgileri
                                </h4>
                                <div className="flex justify-between text-base border-b pb-2 mb-2">
                                    <span className="text-muted-foreground">Toplam Tutar:</span>
                                    <span className="font-mono font-bold text-lg text-primary">{group.total_amount} TL</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">IBAN:</span>
                                    <span className="font-mono select-all font-medium text-foreground">{group.iban || 'Belirtilmemiş'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Hesap Sahibi:</span>
                                    <span className="font-medium text-foreground">{group.account_name || 'Belirtilmemiş'}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 italic">* Lütfen ödeme yaparken açıklama kısmına Ad Soyad belirtin.</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-card border rounded-xl">
                        <Wallet className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                        Ödeme yapılacak onaylı dersiniz bulunmamaktadır.
                    </div>
                )}
            </div>
        </div>
    );
}
