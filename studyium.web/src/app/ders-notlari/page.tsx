"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

type Note = {
    id: number;
    title: string;
    slug: string;
    category: string;
    lesson_name: string;
    created_at: string;
};

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [filter, setFilter] = useState("ALL"); // ALL, TYT, AYT

    useEffect(() => {
        let url = "/api/notes/get_notes.php";
        if (filter !== "ALL") {
            url += `?category=${filter}`;
        }
        fetch(url)
            .then((res) => res.json())
            .then((data) => setNotes(data))
            .catch((err) => console.error(err));
    }, [filter]);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 py-24">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Ders Notları
                </h1>

                {/* Filter */}
                <div className="flex justify-center gap-4 mb-12">
                    {["ALL", "TYT", "AYT"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${filter === cat
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "bg-card border border-white/10 hover:bg-white/5"
                                }`}
                        >
                            {cat === "ALL" ? "Tümü" : cat}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notes.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
                            Bu kategoride henüz not bulunmuyor.
                        </div>
                    ) : (
                        notes.map((note) => (
                            <Link key={note.id} href={`/ders-notlari/detail?slug=${note.slug}`} className="group relative block h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <article className="relative h-full rounded-2xl border border-white/10 bg-card p-6 transition-transform group-hover:-translate-y-1 group-hover:border-primary/50 shadow-xl">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${note.category === 'AYT' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/20' : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'}`}>
                                            {note.category}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(note.created_at).toLocaleDateString("tr-TR")}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {note.title}
                                    </h2>

                                    <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        {note.lesson_name || "Genel"}
                                    </div>

                                    <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
