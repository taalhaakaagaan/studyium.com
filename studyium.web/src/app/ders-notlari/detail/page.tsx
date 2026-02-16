"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Clock, Calendar, Download, ChevronLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import PDFViewer to avoid SSR issues (DOMMatrix not found)
const PDFViewer = dynamic(() => import("@/components/PDFViewer"), {
    ssr: false,
    loading: () => <div className="text-center p-8">PDF component yükleniyor...</div>
});

type NoteDetail = {
    id: number;
    title: string;
    category: string;
    lesson_name: string;
    content: string;
    pdf_url?: string;
    created_at: string;
};

function NoteDetailContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");

    const [note, setNote] = useState<NoteDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetch(`/api/notes/get_notes.php?slug=${slug}`)
                .then((res) => res.json())
                .then((data) => {
                    setNote(data);
                })
                .catch((err) => console.error(err))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [slug]);



    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!note || !note.title) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold mb-4">Not Bulunamadı</h1>
                <Link href="/ders-notlari" className="text-primary hover:underline">Geri Dön</Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 py-24 max-w-4xl">
                <Link href="/ders-notlari" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Tüm Notlar
                </Link>

                <article className="prose prose-invert max-w-none">
                    <div className="mb-8 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${note.category === 'AYT' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/20' : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'}`}>
                                {note.category}
                            </span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(note.created_at).toLocaleDateString("tr-TR")}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{note.title}</h1>
                        <p className="text-xl text-muted-foreground">{note.lesson_name}</p>
                    </div>

                    {/* Content Rendering (HTML) */}
                    {note.content && (
                        <div
                            className="prose prose-lg prose-invert max-w-none mb-12"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                    )}

                    {/* PDF Viewer */}
                    {note.pdf_url ? (
                        <PDFViewer url={note.pdf_url} />
                    ) : null}
                </article>
            </main>
        </div>
    );
}

export default function NoteDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
            <NoteDetailContent />
        </Suspense>
    );
}
