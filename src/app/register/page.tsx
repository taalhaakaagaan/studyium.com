"use client";

import Link from "next/link";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [showKvkk, setShowKvkk] = useState(false);
    const router = useRouter();



    const [step, setStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState("");
    const [registeredEmail, setRegisteredEmail] = useState("");

    // ... (keep handleGoogleLogin)

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            let result;
            try {
                result = await res.json();
            } catch (e) {
                const text = await res.text();
                throw new Error("Sunucu hatası: " + (text.substring(0, 50) || res.statusText));
            }

            if (res.ok) {
                setRegisteredEmail(data.email as string);
                setStep(2); // Move to verification Code step
                alert("Doğrulama kodu e-posta adresinize gönderildi!");
            } else {
                alert(result.message || "Kayıt başarısız.");
            }
        } catch (error: any) {
            console.error(error);
            alert("Bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/verify_code.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: registeredEmail, code: verificationCode }),
            });
            const result = await res.json();
            if (res.ok) {
                alert("Hesabınız doğrulandı! Giriş yapabilirsiniz.");
                router.push('/login');
            } else {
                alert(result.message || "Doğrulama başarısız.");
            }
        } catch {
            alert("Hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
                <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-xl dark:bg-black/20 text-center">
                    <h2 className="text-2xl font-bold">Hesabınızı Doğrulayın</h2>
                    <p className="text-muted-foreground">Lütfen e-posta adresinize ({registeredEmail}) gönderilen 6 haneli kodu girin.</p>

                    <form onSubmit={handleVerify} className="space-y-4 mt-6">
                        <input
                            type="text"
                            className="w-full text-center text-3xl tracking-[1em] font-mono py-4 rounded-lg bg-background border border-border"
                            placeholder="_ _ _ _ _ _"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-secondary/90"
                        >
                            {isLoading ? "Doğrulanıyor..." : "Doğrula ve Tamamla"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Step 1: Registration Form
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-xl dark:bg-black/20">
                {/* ... keeping existing design wrapper ... */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Hesap Oluştur
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Studyium&apos;a katılın ve hedeflerinize ulaşın
                    </p>
                </div>

                <form onSubmit={handleRegister} className="mt-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                                placeholder="Ad"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                id="surname"
                                name="surname"
                                type="text"
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                                placeholder="Soyad"
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                            <Phone className="h-5 w-5" />
                        </div>
                        <input
                            id="gsm"
                            name="gsm"
                            type="tel"
                            required
                            className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                            placeholder="GSM (5XX XXXXXXX)"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                            placeholder="E-posta adresi"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                            placeholder="Şifre"
                        />
                    </div>

                    <div className="flex items-start gap-2">
                        <input
                            id="kvkk"
                            type="checkbox"
                            checked={kvkkAccepted}
                            onChange={(e) => setKvkkAccepted(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                        />
                        <label htmlFor="kvkk" className="text-sm text-muted-foreground">
                            <button type="button" onClick={() => setShowKvkk(true)} className="text-secondary underline hover:text-secondary/80">
                                KVKK Aydınlatma Metni
                            </button>'ni okudum ve kabul ediyorum.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !kvkkAccepted}
                        className="group relative flex w-full justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-secondary/90 hover:shadow-secondary/25 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Hesap oluşturuluyor...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Kayıt Ol <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        )}
                    </button>
                </form>

                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Zaten hesabınız var mı?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-secondary hover:text-secondary/80"
                    >
                        Giriş Yap
                    </Link>
                </p>
            </div>

            {/* KVKK Modal */}
            {
                showKvkk && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h2 className="text-2xl font-bold">KVKK Aydınlatma Metni</h2>
                                <button onClick={() => setShowKvkk(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                            </div>
                            <div className="p-6 overflow-y-auto text-muted-foreground space-y-4">
                                <p><strong>Kişisel Verilerin Korunması Kanunu (KVKK) Hakkında Bilgilendirme</strong></p>
                                <p>Studyium olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında işlemekteyiz.</p>
                                <p>1. Verilerinizin Toplanma Yöntemi: Verileriniz, web sitemiz üzerinden doldurduğunuz formlar aracılığıyla elektronik ortamda toplanmaktadır.</p>
                                <p>2. İşleme Amacı: Üyelik işlemlerinin gerçekleştirilmesi, hizmetlerimizin sunulması ve iletişim faaliyetlerinin yürütülmesi.</p>
                                <p>3. Haklarınız: KVKK'nın 11. maddesi uyarınca, verilerinizin işlenip işlenmediğini öğrenme, silinmesini talep etme haklarına sahipsiniz.</p>
                                <div className="h-4"></div>
                            </div>
                            <div className="p-6 border-t border-border flex justify-end">
                                <button onClick={() => { setKvkkAccepted(true); setShowKvkk(false); }} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold">
                                    Okudum, Anladım
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
