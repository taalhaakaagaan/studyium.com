"use client";

import { Navbar } from "@/components/navbar";
import { UserPlus, Search, Calendar, Video, MonitorPlay } from "lucide-react";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: <UserPlus className="h-8 w-8 text-primary" />,
            title: "1. Ücretsiz Kayıt Olun",
            desc: "Öğrenci veya eğitmen olarak saniyeler içinde hesabınızı oluşturun."
        },
        {
            icon: <Search className="h-8 w-8 text-secondary" />,
            title: "2. Eğitmeninizi Seçin",
            desc: "İhtiyacınız olan dersi ve size en uygun eğitmeni filtreleyerek bulun."
        },
        {
            icon: <Calendar className="h-8 w-8 text-blue-500" />,
            title: "3. Randevu Oluşturun",
            desc: "Eğitmenin takviminden size uygun saati seçin ve ders talebi gönderin."
        },
        {
            icon: <Video className="h-8 w-8 text-green-500" />,
            title: "4. Derse Başlayın",
            desc: "Ders saatinde size gönderilen link üzerinden online görüşmeye katılın."
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Nasıl Çalışır?</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Studyium ile öğrenmek veya öğretmek çok kolay. İşte adım adım sürecimiz.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-card border border-border p-8 rounded-2xl relative">
                            <div className="absolute -top-6 left-8 bg-card border border-border p-4 rounded-xl shadow-lg">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mt-8 mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-24 bg-card border border-border rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-4">Neden Studyium?</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <MonitorPlay className="h-5 w-5 text-primary" />
                                <span>Gelişmiş online ders altyapısı</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MonitorPlay className="h-5 w-5 text-primary" />
                                <span>Güvenli ödeme ve randevu sistemi</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MonitorPlay className="h-5 w-5 text-primary" />
                                <span>Değerlendirme ve yorum sistemi</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 h-64 w-full bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                        <span className="text-6xl">🚀</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
