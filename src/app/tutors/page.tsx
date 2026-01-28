"use client";

import { useEffect, useState, Suspense } from "react";
import { Star, Clock, Search, Filter, ArrowLeft, Send } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/cart-context";

type Tutor = {
    id: number;
    name: string;
    surname: string;
    bio: string;
    subjects: string;
    rating: number;
    hourly_rate: string;
    review_count: number;
    topic_names?: string[]; // NEW: For search
};

type Review = {
    id: number;
    student_name: string;
    rating: number;
    comment: string;
    created_at: string;
};

function TutorsContent() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
    const [search, setSearch] = useState("");
    const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null); // For booking modal
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const query = searchParams.get('search') || "";
                const url = query
                    ? `/api/get_tutors.php?search=${encodeURIComponent(query)}`
                    : '/api/get_tutors.php';

                const res = await fetch(url);
                const data = await res.json();
                setTutors(data);
                setFilteredTutors(data);

                // If there was a search param, set the search box too
                if (query) setSearch(query);
            } catch (error) {
                console.error("Failed to load tutors", error);
            }
        };
        fetchTutors();
    }, [searchParams]);

    // Client-side filtering when user types in the header input locally
    useEffect(() => {
        if (!search) {
            setFilteredTutors(tutors);
            return;
        }
        const lower = search.toLowerCase();
        const filtered = tutors.filter(t =>
            t.name.toLowerCase().includes(lower) ||
            t.surname.toLowerCase().includes(lower) ||
            t.bio.toLowerCase().includes(lower) ||
            (t.topic_names && t.topic_names.some(tn => tn.toLowerCase().includes(lower)))
        );
        setFilteredTutors(filtered);
    }, [search, tutors]);

    // --- LIST VIEW ---
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border p-4 sticky top-0 bg-background/80 backdrop-blur z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Studyium Eğitmenleri</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Hoca veya Ders Ara..."
                                className="pl-9 pr-4 py-2 rounded-full border border-border bg-card focus:ring-2 focus:ring-primary outline-none w-64 transparent"
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value);
                                    // Optional: update URL to reflect search? Maybe not needed for simple filter.
                                }}
                            />
                        </div>
                        <ModeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 py-8">
                {filteredTutors.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Eğitmen bulunamadı.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTutors.map(tutor => (
                            <div key={tutor.id} onClick={() => router.push(`/tutors/detail?id=${tutor.id}`)} className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{tutor.name} {tutor.surname}</h3>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {tutor.topic_names?.slice(0, 3).map((topic, i) => (
                                                    <span key={i} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">{topic}</span>
                                                ))}
                                                {tutor.topic_names && tutor.topic_names.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">+{tutor.topic_names.length - 3}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-sm font-bold">
                                            <Star className="h-3 w-3 fill-current" /> {tutor.rating}
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{tutor.bio}</p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/tutors/detail?id=${tutor.id}`);
                                    }}
                                    className="absolute bottom-0 left-0 w-full py-3 bg-primary text-primary-foreground font-semibold opacity-0 group-hover:opacity-100 transition-all translate-y-full group-hover:translate-y-0"
                                >
                                    Eğitmenleri İncele
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main >
        </div>
    );
}

export default function TutorsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
            <TutorsContent />
        </Suspense>
    );
}

function DollarSign({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    )
}
