"use client";

import Link from "next/link";
import { KeyRound, ArrowRight } from "lucide-react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(searchParams.get('email') || "");
    const [code, setCode] = useState("");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/verify_code.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const result = await res.json();

            if (res.ok && result.user) {
                // Auto-login logic
                localStorage.setItem('studyium_user', JSON.stringify(result.user));
                window.dispatchEvent(new Event('auth-change'));

                alert("Hesabınız başarıyla doğrulandı! Giriş yapılıyor...");
                router.push('/');
            } else {
                alert(result.message || "Doğrulama hatası.");
            }
        } catch {
            alert("Hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-xl dark:bg-black/20 text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center text-secondary mb-4">
                    <KeyRound className="h-8 w-8" />
                </div>

                <h2 className="text-2xl font-bold">Hesap Doğrulama</h2>
                <p className="text-muted-foreground">
                    Güvenliğiniz için lütfen e-posta adresinize gönderilen kodu giriniz.
                </p>
                {email && <p className="text-sm font-medium mt-2">{email}</p>}

                <form onSubmit={handleVerify} className="space-y-6 mt-6">
                    {!searchParams.get('email') && (
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta Adresi"
                            className="w-full p-3 rounded-lg bg-background border border-border"
                        />
                    )}

                    <input
                        type="text"
                        className="w-full text-center text-3xl tracking-[1em] font-mono py-4 rounded-lg bg-background border border-border"
                        placeholder="_ _ _ _ _ _"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-secondary/90 hover:shadow-secondary/25"
                    >
                        {isLoading ? "Doğrulanıyor..." : "Doğrula"}
                    </button>
                </form>

                <div className="mt-4">
                    <Link href="/login" className="text-sm text-secondary hover:underline">
                        Giriş ekranına dön
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyAccountPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
