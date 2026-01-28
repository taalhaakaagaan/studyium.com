"use client";

import { Navbar } from "@/components/navbar";
import { CheckCircle2 } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        "Birebir Canlı Dersler",
        "Gelişmiş Randevu Sistemi",
        "Detaylı Eğitmen Profilleri",
        "Güvenli Ödeme Altyapısı",
        "Mobil Uyumlu Arayüz",
        "Koyu Mod Desteği",
        "Ders Hatırlatmaları",
        "Performans Takibi"
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-6">Özellikler</h1>
                    <p className="text-xl text-muted-foreground">Eğitim deneyiminizi mükemmelleştiren teknolojiler.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <span className="text-lg font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center p-8">
                        <div className="text-center">
                            <span className="text-8xl mb-4 block">✨</span>
                            <h3 className="text-2xl font-bold">Premium Deneyim</h3>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
