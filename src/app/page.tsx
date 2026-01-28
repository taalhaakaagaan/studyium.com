"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Star, Clock, BookOpen, Users, Trophy } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PanelSystem } from "@/components/panel-system";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-secondary/20 blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/tutors"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-8 text-sm font-medium transition-transform hover:scale-105"
              >
                Eğitmenleri İncele
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/50 px-8 text-sm font-medium backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Nasıl Çalışır?
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

    </div>
  );
}
