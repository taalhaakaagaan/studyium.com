"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Star, Clock, BookOpen, Users, Trophy, Laptop, Download, Monitor, Calculator } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PanelSystem } from "@/components/panel-system";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdBanner from "@/components/AdBanner";

type Tutor = {
  id: number;
  name: string;
  surname: string;
  subjects: string;
  rating: number;
  hourly_rate: string;
  fake_hourly_rate?: string | null;
  review_count: number;
};

export default function Home() {
  const [popularTutors, setPopularTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch('/api/get_popular_lessons.php')
      .then(res => res.json())
      .then(data => setPopularTutors(data))
      .catch(err => console.error("Failed to load popular tutors", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Pass search term to tutors page via query param
      router.push(`/tutors?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background - Optimized for iOS */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-secondary/20 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl mb-6">
              Hayalinizdeki Üniversiteyi <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Studyium</span> ile Kazanın
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10">
              Türkiye'nin en iyi eğitmenlerinden birebir online özel ders alın.
              YKS, LGS ve daha fazlası için kişiselleştirilmiş eğitim planı.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-lg relative mb-12 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative flex items-center bg-card border border-white/10 rounded-full p-2 shadow-2xl">
                <Search className="ml-4 h-6 w-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hangi dersten desteğe ihtiyacın var? (Matematik, Fizik...)"
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-foreground placeholder-muted-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-transform hover:scale-105">
                  Ders Bul
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link
                href="https://github.com/taalhaakaagaan/studyium.com/releases/download/v0.5.0/Studyium-Setup-0.5.0.exe"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground px-8 text-sm font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25 gap-2 group"
              >
                <Monitor className="w-5 h-5 group-hover:animate-pulse" /> Windows için İndir
              </Link>
              <Link
                href="https://github.com/taalhaakaagaan/studyium.com/releases/download/v0.5.0/Studyium-0.5.0.AppImage"
                className="inline-flex h-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground px-8 text-sm font-bold transition-all hover:scale-105 gap-2 group"
              >
                <Laptop className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Linux için İndir
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Link
                href="/gunun-sorusu"
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-white/5 hover:border-red-500/50 transition-all hover:scale-105 hover:bg-red-500/5 group"
              >
                <Trophy className="w-8 h-8 mb-3 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Günün Sorusu</span>
              </Link>
              <Link
                href="/tutors"
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-white/5 hover:border-primary/50 transition-all hover:scale-105 hover:bg-primary/5 group"
              >
                <Users className="w-8 h-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Eğitmenler</span>
              </Link>
              <Link
                href="/ders-notlari"
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-white/5 hover:border-secondary/50 transition-all hover:scale-105 hover:bg-secondary/5 group"
              >
                <BookOpen className="w-8 h-8 mb-3 text-secondary group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Ders Notları</span>
              </Link>
              <Link
                href="/yks-puan-hesaplama"
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-white/5 hover:border-blue-500/50 transition-all hover:scale-105 hover:bg-blue-500/5 group"
              >
                <Calculator className="w-8 h-8 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">YKS Robotu</span>
              </Link>
              <Link
                href="/how-it-works"
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-white/5 hover:border-orange-500/50 transition-all hover:scale-105 hover:bg-orange-500/5 group"
              >
                <Clock className="w-8 h-8 mb-3 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Nasıl Çalışır?</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Lessons / Tutors */}
      {/* Panel System for AYT/TYT */}
      <PanelSystem />

      {/* Trust Indicators */}
      <section className="py-24 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Uzman Kadro</h3>
              <p className="text-muted-foreground">Sadece alanında dereceli ve tecrübeli eğitmenlerle çalışıyoruz.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-secondary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Esnek Program</h3>
              <p className="text-muted-foreground">Ders saatlerini kendi programınıza göre belirleyin.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Kişisel Takip</h3>
              <p className="text-muted-foreground">Gelişiminiz yapay zeka destekli sistemimizle takip edilir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get the App Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-16 bg-card border border-white/10 shadow-3xl text-center space-y-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Laptop className="w-4 h-4" /> Masaüstü Deneyimi
            </div>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Çalışmalarınıza <span className="text-primary text-glow">Hız Katın</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Studyium masaüstü uygulaması ile bildirimleri kaçırmayın, çevrimdışı notlarınıza erişin ve daha odaklı bir çalışma ortamına sahip olun.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link
                href="/app"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground px-10 text-lg font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 gap-3"
              >
                <Download className="w-6 h-6" /> Hemen İndir
              </Link>
              <Link
                href="/features"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-border bg-background/50 px-10 text-lg font-bold backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground"
              >
                Özellikleri Keşfet
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground opacity-70">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Windows 10+</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Linux (AppImage)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisement Banner */}
      <AdBanner />

    </div>

  );
}
