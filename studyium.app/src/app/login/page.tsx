"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, useAuthStore } from "@/lib/auth";
import { Shield, Key, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore(state => state.login);

    // Form State
    const [step, setStep] = useState<'login' | '2fa'>('login');
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    // UI State
    const [loading, setLoading] = useState(true); // Start true to check session
    const [error, setError] = useState("");

    // Check Session on Mount
    useEffect(() => {
        const check = async () => {
            const session = await authAPI.checkSession();
            if (session.success) {
                // @ts-ignore
                login({ ...session });
                if (session.role === 'admin') router.push('/admin/dashboard');
                else if (session.role === 'teacher') router.push('/teacher/dashboard');
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
            const result = await authAPI.login(email, rememberMe);
            if (result.success) {
                if (result.requires2FA) {
                    setStep('2fa');
                } else {
                    // Quick Login Success (Dev Mode)
                    // @ts-ignore
                    login({ ...result }); // Pass full user object (id, name, email, role)
                    if (result.role === 'admin') router.push('/admin/dashboard');
                    else if (result.role === 'teacher') router.push('/teacher/dashboard');
                    else router.push('/dashboard');
                }
            } else {
                setError(result.message || "Invalid credentials or unauthorized.");
            }
        } catch (err) {
            console.error(err);
            setError("Connection failed. Please check network/DB.");
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
                // Login Successful
                // @ts-ignore
                login({ ...result }); // Pass full user object

                // Redirect based on role
                if (result.role === 'admin') router.push('/admin/dashboard');
                else if (result.role === 'teacher') router.push('/teacher/dashboard');
                else router.push('/dashboard');
            } else {
                setError(result.message || "Invalid code");
            }
        } catch (err) {
            console.error(err);
            setError("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background p-6">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Logo / Header */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500 mb-2">
                        <Shield size={48} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to access your Studyium portal</p>
                </div>

                <div className="bg-card border rounded-xl shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    {step === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                            placeholder="name@studyium.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors cursor-pointer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember me on this device</label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue with Email
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex flex-col items-center text-center space-y-2 mb-4">
                                <div className="p-2 rounded-full bg-orange-500/10 text-orange-500 mb-2">
                                    <Key size={32} />
                                </div>
                                <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                                <p className="text-sm text-muted-foreground">
                                    We sent a 6-digit code to <b>{email}</b>. Please enter it below.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl font-mono tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length < 6}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 w-full"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Login <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('login')}
                                className="text-sm text-muted-foreground hover:text-foreground hover:underline w-full text-center"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}
                </div>

                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-muted-foreground hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                        &larr; Back to Selection
                    </button>
                </div>

                <div className="text-center text-xs text-muted-foreground mt-8">
                    &copy; 2026 Studyium App. Secure Login.
                </div>
            </div>
        </div>
    );
}
