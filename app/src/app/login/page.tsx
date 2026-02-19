"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, useAuthStore } from "@/lib/auth";
import { Shield, Key, Mail, Loader2, ArrowRight, GraduationCap, BookOpen, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore(state => state.login);

    const portalParam = searchParams.get('portal') || 'student';
    const [portal, setPortal] = useState<'student' | 'teacher'>(portalParam === 'teacher' ? 'teacher' : 'student');

    // Form State
    const [step, setStep] = useState<'login' | '2fa'>('login');
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    // Check Session on Mount
    useEffect(() => {
        const check = async () => {
            const session = await authAPI.checkSession();
            if (session.success) {
                // @ts-ignore
                login({ ...session });
                if (session.role === 'admin') router.push('/admin/dashboard');
                else if (session.role === 'teacher' || session.role === 'tutor') router.push('/teacher/dashboard');
                else router.push('/dashboard');
            } else {
                setLoading(false);
            }
        };
        check();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await authAPI.login(email, rememberMe, portal);
            if (result.success) {
                if (result.requires2FA) {
                    setStep('2fa');
                    setCodeSent(true);
                } else {
                    // Direct login (admin)
                    // @ts-ignore
                    login({ ...result });
                    if (result.role === 'admin') router.push('/admin/dashboard');
                    else if (result.role === 'teacher' || result.role === 'tutor') router.push('/teacher/dashboard');
                    else router.push('/dashboard');
                }
            } else {
                setError(result.message || "Geçersiz email veya yetkisiz giriş.");
            }
        } catch (err) {
            console.error(err);
            setError("Bağlantı hatası. Lütfen ağ bağlantınızı kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await authAPI.verify2FA(email, code);
            if (result.success) {
                // @ts-ignore
                login({ ...result });

                // Redirect based on role
                if (result.role === 'admin') router.push('/admin/dashboard');
                else if (result.role === 'teacher' || result.role === 'tutor') router.push('/teacher/dashboard');
                else router.push('/dashboard');
            } else {
                setError(result.message || "Geçersiz kod");
            }
        } catch (err) {
            console.error(err);
            setError("Doğrulama başarısız.");
        } finally {
            setLoading(false);
        }
    };

    const isStudent = portal === 'student';
    const accentColor = isStudent ? 'blue' : 'violet';

    if (loading && step === 'login' && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    <p className="text-muted-foreground text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
            {/* Background */}
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${isStudent ? 'from-blue-900/20' : 'from-violet-900/20'} via-background to-background pointer-events-none z-0 transition-colors duration-700`} />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md space-y-6 relative z-10" style={{ animation: 'animate-in 0.5s ease-out forwards' }}>

                {/* Portal Tabs */}
                <div className="flex bg-muted/50 rounded-xl p-1.5 gap-1">
                    <button
                        onClick={() => { setPortal('student'); setError(''); setStep('login'); setCode(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${isStudent
                                ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <GraduationCap size={16} />
                        Öğrenci
                    </button>
                    <button
                        onClick={() => { setPortal('teacher'); setError(''); setStep('login'); setCode(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${!isStudent
                                ? 'bg-card shadow-sm text-violet-600 dark:text-violet-400'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <BookOpen size={16} />
                        Öğretmen
                    </button>
                </div>

                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`p-3 rounded-2xl ${isStudent
                        ? 'bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/20 text-violet-600 dark:text-violet-400'
                        } mb-1 shadow-sm`}>
                        {isStudent ? <GraduationCap size={40} /> : <BookOpen size={40} />}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {step === 'login' ? (isStudent ? 'Öğrenci Girişi' : 'Öğretmen Girişi') : 'Doğrulama Kodu'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {step === 'login'
                            ? 'Studyium hesabınıza giriş yapın'
                            : `${email} adresine gönderilen kodu girin`
                        }
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border rounded-2xl shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    {codeSent && step === '2fa' && !error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium text-center flex items-center justify-center gap-2">
                            <CheckCircle size={16} />
                            Doğrulama kodu email adresinize gönderildi.
                        </div>
                    )}

                    {step === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Email Adresi
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-11 transition-all"
                                        placeholder="ornek@studyium.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-200 transition-colors cursor-pointer accent-indigo-600"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                                    Bu cihazda beni hatırla
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-4 py-2.5 w-full shadow-sm active:scale-[0.98] ${isStudent
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-500/25'
                                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-violet-500/25'
                                    }`}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Devam Et
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-5">
                            <div className="flex flex-col items-center text-center space-y-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
                                    <Key size={28} />
                                </div>
                                <h3 className="font-semibold text-base">İki Adımlı Doğrulama</h3>
                                <p className="text-sm text-muted-foreground">
                                    <b className="text-foreground">{email}</b> adresine 6 haneli bir kod gönderdik.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex h-14 w-full rounded-xl border border-input bg-background px-3 py-2 text-center text-3xl font-mono tracking-[0.3em] ring-offset-background placeholder:text-muted-foreground/40 placeholder:tracking-[0.3em] placeholder:text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length < 6}
                                className={`inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-4 py-2.5 w-full shadow-sm active:scale-[0.98] ${isStudent
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-500/25'
                                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-violet-500/25'
                                    }`}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Doğrula & Giriş Yap
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('login'); setCode(''); setError(''); setCodeSent(false); }}
                                className="text-sm text-muted-foreground hover:text-foreground w-full text-center flex items-center justify-center gap-1 transition-colors mt-2"
                            >
                                <ArrowLeft size={14} />
                                Geri Dön
                            </button>
                        </form>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-muted-foreground hover:text-indigo-500 flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Portal Seçimine Dön
                    </button>
                </div>

                <div className="text-center text-xs text-muted-foreground font-sans">
                    &copy; 2026 Studyium. Güvenli Giriş.
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
