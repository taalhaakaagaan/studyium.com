"use client";

import { X, Star, Calendar, Clock, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Tutor {
    id: number;
    name: string;
    surname: string;
    bio: string;
    rating: number;
    review_count: number;
    hourly_rate: string;
    subjects: string;
    // Extra fields from API join
    // ...
}

interface TutorBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tutor: Tutor | null;
    topicName?: string;
}

export function TutorBookingModal({ isOpen, onClose, tutor, topicName }: TutorBookingModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!mounted || !tutor) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-background w-full max-w-lg rounded-3xl shadow-2xl p-6 transition-all duration-300 transform ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-muted/50 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-4xl mb-4">
                        🎓
                    </div>
                    <h2 className="text-2xl font-bold text-center">{tutor.name} {tutor.surname}</h2>
                    <p className="text-primary font-medium">{tutor.subjects}</p>
                    <div className="flex items-center gap-1 text-yellow-500 mt-2 font-bold">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{tutor.rating}</span>
                        <span className="text-muted-foreground font-normal ml-1">({tutor.review_count} Yorum)</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Hakkında</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
                    </div>

                    {topicName && (
                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg text-center text-sm font-semibold">
                            Seçilen Konu: {topicName}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Saatlik Ücret</span>
                        <span className="text-2xl font-bold">{tutor.hourly_rate} TL</span>
                    </div>
                    <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/25">
                        Randevu Oluştur
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
