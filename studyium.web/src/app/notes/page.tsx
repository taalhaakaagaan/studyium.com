'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react';

type Topic = {
    id: number;
    name: string;
    lesson_id: number;
    lesson_name: string;
    category: string;
};

export default function NotesPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [filter, setFilter] = useState<'TYT' | 'AYT' | 'ALL'>('ALL');
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/get_all_topics.php')
            .then(res => res.json())
            .then(data => setTopics(data))
            .catch(e => console.error(e));
    }, []);

    // Group by Lesson
    const grouped = topics.reduce((acc, topic) => {
        if (filter !== 'ALL' && topic.category !== filter) return acc;

        const key = topic.lesson_name;
        if (!acc[key]) acc[key] = { category: topic.category, topics: [] };
        acc[key].topics.push(topic);
        return acc;
    }, {} as Record<string, { category: string, topics: Topic[] }>);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Ders Notları</h1>
                    <p className="text-muted-foreground text-lg">TYT ve AYT konuları için kapsamlı ders notları.</p>
                </div>

                {/* Filters */}
                <div className="flex justify-center gap-4 mb-12">
                    <button onClick={() => setFilter('ALL')} className={`px-6 py-2 rounded-full font-medium transition-colors ${filter === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>Tümü</button>
                    <button onClick={() => setFilter('TYT')} className={`px-6 py-2 rounded-full font-medium transition-colors ${filter === 'TYT' ? 'bg-indigo-600 text-white' : 'bg-muted hover:bg-muted/80'}`}>TYT</button>
                    <button onClick={() => setFilter('AYT')} className={`px-6 py-2 rounded-full font-medium transition-colors ${filter === 'AYT' ? 'bg-rose-600 text-white' : 'bg-muted hover:bg-muted/80'}`}>AYT</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(grouped).map(([lessonName, data]) => (
                        <div key={lessonName} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6 border-b border-border bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-2xl font-bold">{lessonName}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.category === 'TYT' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {data.category}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {data.topics.length} Konu
                                </div>
                            </div>
                            <div className="p-4">
                                <ul className="space-y-2">
                                    {data.topics.slice(0, 5).map(topic => (
                                        <li key={topic.id}>
                                            <Link href={`/notes/detail?id=${topic.id}`} className="block p-2 rounded hover:bg-muted transition-colors flex items-center justify-between group">
                                                <span className="text-sm font-medium">{topic.name}</span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                    {data.topics.length > 5 && (
                                        <li>
                                            <button className="text-sm text-primary hover:underline pl-2 pt-2">
                                                Tümünü Gör ({data.topics.length - 5} daha)
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
