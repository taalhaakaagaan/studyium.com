"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, useAuthStore } from "@/lib/auth";
import { Shield, GraduationCap, BookOpen, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [checking, setChecking] = useState(true);

  // Session Check — auto-redirect if already logged in
  useEffect(() => {
    const check = async () => {
      try {
        const session = await authAPI.checkSession();
        if (session.success) {
          // @ts-ignore
          login({ ...session });
          if (session.role === 'admin') router.push('/admin/dashboard');
          else if (session.role === 'teacher' || session.role === 'tutor') router.push('/teacher/dashboard');
          else router.push('/dashboard');
          return;
        }
      } catch (e) {
        console.error("Session check error:", e);
      }
      setChecking(false);
    };
    check();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Sparkles className="h-12 w-12 text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-muted-foreground text-sm">Oturum kontrol ediliyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/30 via-background to-background pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-violet-900/15 via-transparent to-transparent pointer-events-none z-0" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex lg:flex-col lg:gap-10 relative"
        style={{ animation: 'animate-in 0.6s ease-out forwards' }}>

        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles size={28} />
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-muted-foreground/60">
            Studyium
          </h1>
          <p className="text-muted-foreground max-w-[500px] mx-auto text-base leading-relaxed font-sans">
            Öğrenim platformunuza hoş geldiniz. Devam etmek için portalınızı seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto mt-6">

          {/* Student Card */}
          <button
            onClick={() => router.push('/login?portal=student')}
            className="group cursor-pointer block relative z-20 text-left"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex flex-col items-center text-center space-y-4 relative z-30">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  <GraduationCap size={36} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Öğrenci Portalı</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ders programınız, mesajlarınız ve kişiselleştirilmiş öğrenim paneliniz.
                </p>
                <div className="pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                  Giriş Yap <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => router.push('/login?portal=teacher')}
            className="group cursor-pointer block relative z-20 text-left"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-400/30 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex flex-col items-center text-center space-y-4 relative z-30">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/20 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  <BookOpen size={36} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Öğretmen Portalı</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Öğrencilerinizi yönetin, gruplar oluşturun ve dersler planlayın.
                </p>
                <div className="pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-wide uppercase">
                  Giriş Yap <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

        </div>

        <div className="text-xs text-muted-foreground mt-10 relative z-20 font-sans">
          &copy; 2026 Studyium. Tüm hakları saklıdır.
        </div>
      </div>
    </main>
  );
}
