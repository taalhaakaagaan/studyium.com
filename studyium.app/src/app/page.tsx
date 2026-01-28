import Link from "next/link";
import { Shield, User, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none z-0" />

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex lg:flex-col lg:gap-12 animate-in fade-in zoom-in duration-500 relative">

        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/50">
            Studyium
          </h1>
          <p className="text-muted-foreground max-w-[600px] mx-auto text-lg">
            The ultimate platform for learning and management. Select your portal to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-8">

          {/* Student Card */}
          <Link href="/login" className="group cursor-pointer block relative z-20">
            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex flex-col items-center text-center space-y-4 relative z-30">
                <div className="p-4 rounded-full bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <User size={32} />
                </div>
                <h3 className="text-xl font-bold">Student Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Private schedule, messages, and personalized learning dashboard.
                </p>
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs font-medium text-blue-600">
                  Login / Dashboard <ArrowRight className="ml-1 w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>

          {/* Teacher Card */}
          <Link href="/login" className="group cursor-pointer block relative z-20">
            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex flex-col items-center text-center space-y-4 relative z-30">
                <div className="p-4 rounded-full bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <User size={32} />
                </div>
                <h3 className="text-xl font-bold">Teacher Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Manage students, create groups, and schedule lessons.
                </p>
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs font-medium text-purple-600">
                  Login as Teacher <ArrowRight className="ml-1 w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>

        </div>

        <div className="text-xs text-muted-foreground mt-12 relative z-20">
          &copy; 2026 Studyium App. All rights reserved.
        </div>
      </div>
    </main>
  );
}
