'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Note = {
    id: number;
    title: string;
    content: string;
    updated_at: string;
};

function NoteDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/notes/get.php?topicId=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.note) setNote(data.note);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen pt-32 text-center">Yükleniyor...</div>;

    if (!note) return (
        <div className="min-h-screen pt-32 px-4 text-center">
            <div className="max-w-md mx-auto">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Not Bulunamadı</h1>
                <p className="text-muted-foreground mb-6">Bu konu için henüz içerik eklenmemiş.</p>
                <Link href="/notes" className="px-6 py-2 bg-primary text-primary-foreground rounded-full">Geri Dön</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
            <div className="max-w-4xl mx-auto">
                <Link href="/notes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="h-4 w-4" /> Ders Notları
                </Link>

                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-4">{note.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 border-b border-border pb-8">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(note.updated_at).toLocaleDateString('tr-TR')}</span>
                    </div>

                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                </article>
            </div>
        </div>
    );
}

export default function NoteDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 text-center">Yükleniyor...</div>}>
            <NoteDetailContent />
        </Suspense>
    );
}
