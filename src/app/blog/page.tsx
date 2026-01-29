"use client";

import { useState, useEffect } from 'react';

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function BlogPage() {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/get_blog_posts.php')
            .then(res => res.json())
            .then(data => setPosts(data));
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">

            <main className="container mx-auto px-4 py-24">
                <h1 className="text-4xl font-bold mb-8">Blog</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <article key={post.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="h-48 bg-muted/30 flex items-center justify-center text-4xl">
                                📝
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">{post.category}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                                <Link href={`/blog/detail?slug=${post.slug}`} className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                                    Devamını Oku →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}
