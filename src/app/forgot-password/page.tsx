"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight, KeyRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const router = useRouter();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/forgot_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
                alert(data.message);
            } else {
                alert(data.message || "Hata oluştu.");
            }
        } catch (err) {
            alert("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, new_password: newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                router.push('/login');
            } else {
                alert(data.message || "Hata oluştu.");
            }
        } catch (err) {
            alert("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-xl dark:bg-black/20">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {step === 1 ? "Şifremi Unuttum" : "Yeni Şifre Belirle"}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {step === 1
                            ? "E-posta adresinizi girin, doğrulama kodu gönderelim."
                            : "E-postanıza gelen kodu ve yeni şifrenizi giriniz."}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="mt-8 space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                                placeholder="E-posta adresi"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-secondary/90 hover:shadow-secondary/25 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Gönderiliyor..." : "Kod Gönder"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all tracking-widest font-mono text-center text-xl"
                                placeholder="Doğrulama Kodu"
                                maxLength={6}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-secondary transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                                placeholder="Yeni Şifre"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-secondary/90 hover:shadow-secondary/25 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm font-medium text-secondary hover:text-secondary/80">
                        Giriş ekranına dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
