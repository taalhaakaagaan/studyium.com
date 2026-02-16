"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { Save, Video, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function TeacherSettingsPage() {
    const { user } = useAuthStore();
    const [meetingLink, setMeetingLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.require) {
                try {
                    // @ts-ignore
                    const { ipcRenderer } = window.require('electron');
                    const sess = await ipcRenderer.invoke('db:check-session');
                    if (sess.success) {
                        const res = await ipcRenderer.invoke('db:get-tutor-settings', sess.id);
                        if (res.success && res.settings) {
                            setMeetingLink(res.settings.meeting_link || "");
                        }
                    }
                } catch (e) {
                    console.error("Error fetching settings:", e);
                }
            }
            setLoading(false);
        };
        fetchSettings();
    }, [user?.id]);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            // @ts-ignore
            const { ipcRenderer } = window.require('electron');
            const sess = await ipcRenderer.invoke('db:check-session');
            if (sess.success) {
                const res = await ipcRenderer.invoke('db:update-meeting-link', {
                    userId: sess.id,
                    link: meetingLink
                });
                if (res.success) {
                    setStatus({ type: 'success', message: 'Ayarlar başarıyla kaydedildi.' });
                } else {
                    setStatus({ type: 'error', message: 'Kaydedilirken bir hata oluştu: ' + res.message });
                }
            }
        } catch (e: any) {
            setStatus({ type: 'error', message: 'Hata: ' + e.message });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-12">
            <div className="space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Sistem Ayarları
                </h2>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
                    Platform deneyimini kişiselleştir ve yönet
                </p>
            </div>

            <div className="group relative overflow-hidden">
                {/* Decorative Background Blur */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] transition-all duration-1000 group-hover:bg-indigo-500/20" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] transition-all duration-1000 group-hover:bg-violet-500/20" />

                <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 p-10 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Video className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Canlı Ders Entegrasyonu</h3>
                                <p className="text-sm text-muted-foreground font-medium">Uzak eğitim platformu bağlantılarını yönet</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                            Canlı dersleriniz için kullanacağınız Google Meet veya benzeri platformun linkini buraya ekleyin.
                            Öğrencileriniz ders saati geldiğinde bu butona tıklayarak derse katılabilecek.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">Platform Linki</label>
                            <div className="relative group/input">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-0 group-focus-within/input:opacity-20 transition duration-500" />
                                <div className="relative">
                                    <Video className="absolute left-4 top-4 h-5 w-5 text-muted-foreground transition-colors group-focus-within/input:text-indigo-500" />
                                    <input
                                        className="flex h-14 w-full rounded-2xl border border-input bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md px-3 py-2 text-base pl-12 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:focus-visible:ring-indigo-400/30"
                                        placeholder="https://meet.google.com/abc-defg-hij"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 italic px-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                                Örn: https://meet.google.com/xyz-abcd-123
                            </div>
                        </div>

                        {status && (
                            <div className={`p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border animate-in zoom-in-95 duration-300 ${status.type === 'success'
                                    ? 'bg-green-50/80 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50'
                                    : 'bg-red-50/80 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                                }`}>
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${status.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                                    }`}>
                                    {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                </div>
                                {status.message}
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group/btn h-16 w-full relative overflow-hidden flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-lg tracking-wide transition-all hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            {saving ? (
                                <Loader2 className="h-6 w-6 animate-spin relative" />
                            ) : (
                                <Save className="h-6 w-6 relative transition-transform group-hover/btn:-translate-y-1" />
                            )}
                            <span className="relative">AYARLARI KAYDET</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
