"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from "next/dynamic";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from 'next/link';

// Dynamic import for PDFViewer
const PDFViewer = dynamic(() => import("@/components/PDFViewer"), {
    ssr: false,
    loading: () => <div className="text-center p-8 text-muted-foreground">PDF görüntüleyici yükleniyor...</div>
});

function BlogDetailContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetch(`/api/get_blog_posts.php?slug=${slug}`)
                .then(res => res.json())
                .then(data => {
                    // API might return array or single object depending on implementation.
                    // Usually get_blog_posts returns array. If slug provided, it might return filtered array.
                    // We need to check response structure.
                    if (Array.isArray(data)) {
                        setPost(data[0]);
                    } else {
                        setPost(data);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <main className="flex-1 container mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-bold mb-4">Blog yazısı bulunamadı.</h1>
                    <Link href="/blog" className="text-primary hover:underline">Geri Dön</Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-24">
                <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Tüm Yazılar
                </Link>

                <article className="max-w-4xl mx-auto">
                    <header className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{post.category}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
                        {post.excerpt && <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">{post.excerpt}</p>}
                    </header>

                    <div className="prose prose-invert max-w-none">
                        {/* PDF Viewer */}
                        {post.pdf_url ? (
                            <div className="mt-8">
                                <PDFViewer url={post.pdf_url} />
                            </div>
                        ) : (
                            <div className="p-8 text-center border border-white/10 rounded-xl bg-white/5">
                                <p className="text-muted-foreground">Bu yazı için PDF içeriği bulunmuyor.</p>
                            </div>
                        )}

                        {/* Content Fallback (if any HTML content remains) */}
                        {post.content && !post.pdf_url && (
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
}

export default function BlogDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
            <BlogDetailContent />
        </Suspense>
    );
}
