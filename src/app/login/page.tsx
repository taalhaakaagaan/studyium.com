"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();



    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            let result;
            try {
                result = await res.json();
            } catch (e) {
                console.error("JSON Parse Error:", e);
                const text = await res.text();
                throw new Error("Sunucu hatası: " + (text.substring(0, 50) || res.statusText));
            }

            if (res.ok) {
                // Save user to local storage for UI persistence
                if (result.user) {
                    localStorage.setItem('studyium_user', JSON.stringify(result.user));
                }

                // Dispatch event to notify other components (like Navbar)
                window.dispatchEvent(new Event('auth-change'));
                window.dispatchEvent(new Event('user-session-change'));

                if (result.redirectUrl) {
                    router.push(result.redirectUrl);
                } else {
                    alert("Giriş başarılı!");
                    router.push('/');
                }
            } else {
                if (result.require_verification) {
                    // Redirect to verification page
                    alert("Lütfen hesabınızı doğrulayın. Doğrulama ekranına yönlendiriliyorsunuz.");
                    router.push(`/verify-account?email=${encodeURIComponent(result.email || data.email)}`);
                } else {
                    alert(result.message || "Giriş başarısız.");
                }
            }
        } catch (error: any) {
            console.error(error);
            alert("Bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-xl dark:bg-black/20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Tekrar Hoşgeldiniz
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Öğrenme yolculuğunuza devam etmek için giriş yapın
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all"
                                placeholder="E-posta adresi"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all"
                                placeholder="Şifre"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-muted-foreground"
                            >
                                Beni Hatırla
                            </label>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="font-medium text-primary hover:text-primary/80"
                        >
                            Şifremi unuttum?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Giriş yapılıyor...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Giriş Yap <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        )}
                    </button>
                </form>

                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Hesabınız yok mu?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-primary hover:text-primary/80"
                    >
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    );
}
