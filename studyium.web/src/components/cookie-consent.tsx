"use client";

import { useState, useEffect } from "react";
import { X, Cookie, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const consent = localStorage.getItem("studyium-cookie-consent");
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("studyium-cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem("studyium-cookie-consent", "rejected");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-6 md:flex md:items-start md:gap-6 relative overflow-hidden">

                    {/* Decorative Background */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Icon */}
                    <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <Cookie className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <span className="md:hidden"><Cookie className="h-5 w-5 text-indigo-600" /></span>
                                Çerez ve Gizlilik Tercihleri
                            </h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                                Sizlere daha iyi bir deneyim sunmak için çerezleri kullanıyoruz. Sitemizi kullanarak
                                <button onClick={() => setShowDetails(true)} className="text-indigo-600 hover:underline mx-1 font-medium">
                                    Çerez Politikası
                                </button>
                                ve
                                <button onClick={() => setShowDetails(true)} className="text-indigo-600 hover:underline mx-1 font-medium">
                                    KVKK Aydınlatma Metni
                                </button>
                                kapsamında verilerinizin işlenmesini kabul etmiş olursunuz.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm active:scale-95 text-sm"
                            >
                                Kabul Et
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-colors text-sm"
                            >
                                Reddet
                            </button>
                            <button
                                onClick={() => setShowDetails(true)}
                                className="px-6 py-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 text-sm font-medium transition-colors sm:ml-auto"
                            >
                                Detayları İncele
                            </button>
                        </div>
                    </div>

                    {/* Close for mobile if needed, but actions cover it */}
                </div>
            </div>

            {/* Modal for Details (KVKK Text placeholder) */}
            {showDetails && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col relative">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-inherit rounded-t-2xl z-10">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="text-green-600" />
                                KVKK ve Gizlilik Politikası
                            </h3>
                            <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                            <h4 className="font-bold text-lg text-black dark:text-white">1. Veri Sorumlusu</h4>
                            <p>Studyium Platformu olarak kişisel verilerinizin güvenliğine önem veriyoruz...</p>

                            <h4 className="font-bold text-lg text-black dark:text-white">2. Çerezler</h4>
                            <p>Sitemizde zorunlu çerezler, performans çerezleri ve hedefleme çerezleri kullanılmaktadır...</p>

                            <h4 className="font-bold text-lg text-black dark:text-white">3. Amaçlar</h4>
                            <p>Eğitim hizmetlerimizi geliştirmek, güvenliği sağlamak ve kişiselleştirilmiş deneyim sunmak amacıyla verileriniz işlenmektedir.</p>

                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border text-xs">
                                * Bu metin bir örnektir. Yasal geçerlilik için hukuk danışmanınızla görüşmeniz önerilir.
                            </div>
                        </div>

                        <div className="p-6 border-t bg-zinc-50 dark:bg-zinc-900 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setShowDetails(false)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Kapat</button>
                            <button onClick={() => { setShowDetails(false); handleAccept(); }} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Okudum, Kabul Ediyorum</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
