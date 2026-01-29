"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    BookOpen,
    Plus,
    Trash2,
    LogOut,
    LayoutDashboard,
    GraduationCap,
    FileText,
    Edit,
    Menu,
    X,
    Save,
    CalendarCheck,
    MessageSquare,
    Star,
    CheckSquare,
    Square,
    CreditCard,
    DollarSign
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

type Stats = {
    total_users: number;
    total_tutors: number;
    total_lessons: number;
    pending_bookings: number;
    daily_visitors?: number;
    monthly_visitors?: number;
};

type Tutor = {
    id: number;
    name: string;
    surname: string;
    email: string;
    hourly_rate: string;
    fake_hourly_rate?: string | null;
    subjects: string;
    bio: string;
    course_details?: string;
    topic_ids?: number[]; // For edit
    account_name?: string;
    iban?: string;
};

type Lesson = {
    id: number;
    name: string;
    category: string;
};

type Topic = {
    id: number;
    name: string;
    lesson_id: number;
    lesson_name: string;
    category: string;
    price?: number;
    fake_price?: number;
};

type BlogPost = {
    id: number;
    title: string;
    category: string;
    excerpt: string;
};

type Booking = {
    id: number;
    tutor_name: string;
    tutor_surname: string;
    student_name: string;
    student_surname: string;
    student_email: string;
    student_phone?: string;
    created_at: string;
    status: string;
};

type Payment = {
    id: number;
    amount: string;
    date: string;
    tutor: string;
    student: string;
};

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Stats & Data
    const [stats, setStats] = useState<Stats>({
        total_users: 0,
        total_tutors: 0,
        total_lessons: 0,
        pending_bookings: 0
    });
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allTopics, setAllTopics] = useState<Topic[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    // Forms State
    const [newTutor, setNewTutor] = useState({ name: '', surname: '', email: '', bio: '', subjects: '', account_name: '', iban: '' });
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

    const [newLesson, setNewLesson] = useState({ name: '', category: '' });
    const [newBlog, setNewBlog] = useState({ title: '', category: '', excerpt: '' });

    // Filter State
    const [selectedLessonFilter, setSelectedLessonFilter] = useState<number | null>(null);
    const [pricingLessonId, setPricingLessonId] = useState<number | null>(null);

    // Editing State
    // Editing State
    const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);

    // Note Editor State
    const [selectedNoteTopic, setSelectedNoteTopic] = useState<Topic | null>(null);
    const [noteContent, setNoteContent] = useState('');
    const [noteTitle, setNoteTitle] = useState('');

    // Debug State
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        fetchStats();
        fetchTutors();
        fetchLessons();
        fetchBlogs();
        fetchBookings();
        fetchTopics();
        fetchPayments();
    }, []);

    // Fetchers
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/get_stats.php');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                if (data.debug) setDebugInfo(data.debug);
            } else {
                setFetchError("Stats fetch failed: " + res.status);
            }
        } catch (e: any) {
            setFetchError("Stats fetch error: " + e.message);
        }
    };

    const fetchTutors = async () => {
        const res = await fetch('/api/admin/get_tutors.php');
        if (res.ok) setTutors(await res.json());
    };

    const fetchLessons = async () => {
        const res = await fetch('/api/admin/get_lessons.php');
        if (res.ok) setLessons(await res.json());
    };

    const fetchTopics = async () => {
        try {
            const res = await fetch('/api/admin/get_all_topics.php');
            if (res.ok) {
                const data = await res.json();
                setAllTopics(data);
                setFetchError(null);
            } else {
                const text = await res.text();
                setFetchError(`Error ${res.status}: ${res.statusText} - ${text.substring(0, 100)}`);
            }
        } catch (err: any) {
            setFetchError(`Fetch Exception: ${err.message}`);
        }
    }

    const handleBookingStatus = async (id: number, status: 'approved' | 'rejected') => {
        if (!confirm(`Bu randevuyu ${status === 'approved' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch('/api/admin/update_booking_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || `Randevu ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
                fetchBookings(); // Reload list
            } else {
                alert(data.message || "Hata oluştu.");
            }
        } catch (e) {
            console.error(e);
            alert("Bağlantı hatası.");
        }
    };

    const fetchBlogs = async () => {
        const res = await fetch('/api/get_blog_posts.php');
        if (res.ok) setBlogs(await res.json());
    };

    const fetchBookings = async () => {
        const res = await fetch('/api/admin/get_bookings.php');
        if (res.ok) setBookings(await res.json());
    };

    const fetchPayments = async () => {
        const res = await fetch('/api/admin/get_payments.php');
        if (res.ok) {
            const data = await res.json();
            setPayments(data.transactions);
            setTotalRevenue(data.total_amount);
        }
    };

    // Derived State for Topics
    const groupedTopics = allTopics.reduce((acc, topic) => {
        const key = `${topic.category} - ${topic.lesson_name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(topic);
        return acc;
    }, {} as Record<string, Topic[]>);

    // Handlers
    const handleTopicToggle = (id: number) => {
        setSelectedTopics(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const handleAddTutor = async (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-generate subjects string from selected topics if empty
        let subjectsStr = newTutor.subjects;
        if (!subjectsStr && selectedTopics.length > 0) {
            // Find lesson names from selected topics
            const selectedLessonNames = Array.from(new Set(
                allTopics.filter(t => selectedTopics.includes(t.id)).map(t => t.lesson_name)
            ));
            subjectsStr = selectedLessonNames.join(', ');
        }

        // Just create the payload and let JSON.stringify handle arrays
        // Note: PHP needs to decode this JSON properly.
        const payload = {
            ...newTutor,
            subjects: subjectsStr,
            topic_ids: selectedTopics
        };

        const res = await fetch('/api/admin/add_tutor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Hoca eklendi!");
            setNewTutor({ name: '', surname: '', email: '', bio: '', subjects: '', account_name: '', iban: '' });
            setSelectedTopics([]);
            fetchTutors();
        } else {
            const errorData = await res.json();
            alert(errorData.message || "Hata oluştu.");
        }
    };

    const handleDeleteTutor = async (id: number) => {
        if (!confirm("Bu hocayı silmek istediğinize emin misiniz?")) return;
        const res = await fetch('/api/admin/delete_tutor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            alert("Eğitmen silindi.");
            fetchTutors();
        } else {
            alert("Silme işlemi başarısız.");
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/add_lesson.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLesson)
        });
        if (res.ok) {
            alert("Ders eklendi!");
            setNewLesson({ name: '', category: '' });
            fetchLessons();
        }
    };

    const handleAddBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/manage_blog.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newBlog, action: 'add' })
        });
        if (res.ok) {
            alert("Blog yazısı eklendi!");
            setNewBlog({ title: '', category: '', excerpt: '' });
            fetchBlogs();
        }
    };

    const handleDeleteBlog = async (id: number) => {
        if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
        const res = await fetch('/api/admin/manage_blog.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'delete' })
        });
        if (res.ok) fetchBlogs();
    };

    const handleEditTutor = (tutor: Tutor) => {
        setEditingTutor(tutor);
        // Pre-fill selected topics if they exist on the tutor object
        if (tutor.topic_ids && Array.isArray(tutor.topic_ids)) {
            setSelectedTopics(tutor.topic_ids);
        } else {
            setSelectedTopics([]);
        }
    };

    const handleUpdateTutor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTutor) return;

        // Auto-generate subjects string from selected topics if empty or desired
        let subjectsStr = editingTutor.subjects;
        if (selectedTopics.length > 0) {
            const selectedLessonNames = Array.from(new Set(
                allTopics.filter(t => selectedTopics.includes(t.id)).map(t => t.lesson_name)
            ));
            subjectsStr = selectedLessonNames.join(', ');
        }

        const payload = {
            ...editingTutor,
            subjects: subjectsStr,
            topic_ids: selectedTopics
        };

        const res = await fetch('/api/admin/edit_tutor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Eğitmen güncellendi!");
            setEditingTutor(null);
            fetchTutors();
            setSelectedTopics([]);
        } else {
            alert("Hata oluştu!");
        }
    };

    const handleUpdateTopicPrice = async (topicId: number, price: string, fakePrice: string) => {
        const res = await fetch('/api/admin/update_topic_price.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: topicId, price, fake_price: fakePrice })
        });
        if (res.ok) {
            alert("Fiyat güncellendi!");
            fetchTopics(); // Refresh to show new values
        } else {
            alert("Hata oluştu.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b border-border p-4 flex justify-between items-center bg-card sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 hover:bg-accent rounded-lg">
                        <Menu className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Admin Paneli</h1>
                </div>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-red-500 hover:text-red-600">
                        <LogOut className="h-5 w-5" /> <span className="hidden sm:inline">Çıkış</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-4 transition-transform duration-300 md:relative md:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h2 className="font-bold text-lg">Menü</h2>
                        <button onClick={() => setIsSidebarOpen(false)}><X className="h-6 w-6" /></button>
                    </div>

                    <nav className="space-y-2">
                        <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <LayoutDashboard className="h-5 w-5" /> Genel Bakış
                        </button>
                        <button onClick={() => { setActiveTab('tutors'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'tutors' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <GraduationCap className="h-5 w-5" /> Hocalar
                        </button>
                        <button onClick={() => { setActiveTab('lessons'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'lessons' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <BookOpen className="h-5 w-5" /> Dersler
                        </button>
                        <button onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <CalendarCheck className="h-5 w-5" /> Randevular
                        </button>
                        <button onClick={() => { setActiveTab('notes'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'notes' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <BookOpen className="h-5 w-5" /> Ders Notları
                        </button>
                        <button onClick={() => { setActiveTab('blog'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'blog' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <FileText className="h-5 w-5" /> Blog Yönetimi
                        </button>

                        <button onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <MessageSquare className="h-5 w-5" /> Toplu Mesaj
                        </button>
                        <button onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'payments' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                            <CreditCard className="h-5 w-5" /> Ödemeler
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Genel Bakış</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                                            <h3 className="text-2xl font-bold mt-2">{stats.total_users}</h3>
                                        </div>
                                        <Users className="h-8 w-8 text-primary/50" />
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Eğitmenler</p>
                                            <h3 className="text-2xl font-bold mt-2">{stats.total_tutors}</h3>
                                        </div>
                                        <GraduationCap className="h-8 w-8 text-secondary/50" />
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Başvurular</p>
                                            <h3 className="text-2xl font-bold mt-2">{stats.pending_bookings}</h3>
                                        </div>
                                        <CalendarCheck className="h-8 w-8 text-green-500/50" />
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Günlük Ziyaretçi</p>
                                            <h3 className="text-2xl font-bold mt-2">{stats.daily_visitors || 0}</h3>
                                        </div>
                                        <Users className="h-8 w-8 text-blue-500/50" />
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Aylık Ziyaretçi</p>
                                            <h3 className="text-2xl font-bold mt-2">{stats.monthly_visitors || 0}</h3>
                                        </div>
                                        <CalendarCheck className="h-8 w-8 text-orange-500/50" />
                                    </div>
                                </div>
                            </div>

                            {/* DEBUG CONSOLE - Visible only if stats are suspicious or requested */}
                            <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-destructive/20">
                                <h3 className="text-lg font-bold text-destructive mb-2">Sistem Durumu (Debug)</h3>
                                {fetchError && <div className="text-red-500 font-bold mb-2">{fetchError}</div>}
                                {debugInfo ? (
                                    <div className="space-y-2 text-xs font-mono">
                                        <div>Database: <span className="font-bold">{debugInfo.db_name}</span></div>
                                        <div>Status: <span className="text-green-600 font-bold">{debugInfo.connection_status}</span></div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <div className="font-bold underline mb-1">Tablo Kontrolü</div>
                                                {Object.entries(debugInfo.tables_found || {}).map(([table, exists]: [string, any]) => (
                                                    <div key={table} className={exists ? 'text-green-600' : 'text-red-600'}>
                                                        {table}: {exists ? 'MEVCUT' : 'YOK'}
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <div className="font-bold underline mb-1">Ham Satır Sayıları</div>
                                                {Object.entries(debugInfo.raw_counts || {}).map(([table, count]: [string, any]) => (
                                                    <div key={table}>
                                                        {table}: {count}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">Veri yükleniyor veya debug bilgisi yok...</div>
                                )}
                            </div>
                        </div>

                    )}



                    {/* Notes Management Tab */}
                    {activeTab === 'notes' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Ders Notu Yönetimi</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Selector Column */}
                                <div className="md:col-span-1 space-y-4">
                                    <h3 className="font-bold">Konu Seçimi</h3>
                                    <div className="border border-border rounded-xl p-4 h-[600px] overflow-y-auto bg-card">
                                        {Object.entries(groupedTopics).map(([lessonName, topics]) => (
                                            <div key={lessonName} className="mb-4">
                                                <h4 className="font-semibold text-sm bg-muted p-2 rounded mb-2 sticky top-0">{lessonName}</h4>
                                                <div className="space-y-1">
                                                    {topics.map(t => (
                                                        <button
                                                            key={t.id}
                                                            onClick={async () => {
                                                                setSelectedNoteTopic(t);
                                                                setNoteTitle(t.name);
                                                                setNoteContent(''); // Reset content/file indicator if needed
                                                                // In PDF mode, we might want to check if a PDF exists, but GET API needs update relative to task.
                                                                // For now, assuming simply uploading new overwrites or sets.
                                                            }}
                                                            className={`w-full text-left text-sm p-2 rounded truncate transition-colors ${selectedNoteTopic?.id === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                                                        >
                                                            {t.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Editor Column */}
                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="font-bold flex justify-between items-center">
                                        İçerik Editörü (PDF)
                                        {selectedNoteTopic && <span className="text-sm font-normal text-muted-foreground">{selectedNoteTopic.lesson_name} / {selectedNoteTopic.name}</span>}
                                    </h3>

                                    {selectedNoteTopic ? (
                                        <div className="bg-card border border-border rounded-xl p-4 h-[600px] flex flex-col gap-4">
                                            <div>
                                                <label className="text-sm font-bold mb-1 block">Başlık</label>
                                                <input
                                                    value={noteTitle}
                                                    onChange={(e) => setNoteTitle(e.target.value)}
                                                    className="w-full p-2 border border-border rounded bg-background"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                                                <label className="text-sm font-bold mb-4 block text-center">PDF Dosyası Yükle</label>
                                                <input
                                                    type="file"
                                                    id="note-pdf-upload"
                                                    accept="application/pdf"
                                                    className="block w-full max-w-xs text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                />
                                                <p className="text-xs text-muted-foreground mt-4">
                                                    Not: İçerik artık sadece PDF dosyasından oluşmaktadır.
                                                </p>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={async () => {
                                                        const fileInput = document.getElementById('note-pdf-upload') as HTMLInputElement;
                                                        const file = fileInput?.files?.[0];

                                                        const formData = new FormData();
                                                        formData.append('topicId', String(selectedNoteTopic.id));
                                                        formData.append('title', noteTitle);
                                                        // Passing empty content as requested, strictly PDF
                                                        formData.append('content', '');
                                                        if (file) {
                                                            formData.append('pdf_file', file);
                                                        }

                                                        try {
                                                            const res = await fetch('/api/admin/save_note.php', {
                                                                method: 'POST',
                                                                body: formData
                                                            });
                                                            const data = await res.json();
                                                            if (data.message && (data.message.includes('eklendi') || data.message.includes('güncellendi'))) {
                                                                alert('Not kaydedildi.');
                                                            } else if (data.id) {
                                                                // Some API variations return id on success
                                                                alert('Not kaydedildi.');
                                                            } else {
                                                                alert('İşlem tamamlandı: ' + (data.message || 'Başarılı'));
                                                            }
                                                        } catch (e: any) {
                                                            alert('Hata: ' + e.message);
                                                        }
                                                    }}
                                                    className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:bg-primary/90"
                                                >
                                                    <Save className="h-4 w-4 inline mr-2" /> Kaydet
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-card border border-border rounded-xl p-6 h-[600px] flex items-center justify-center text-muted-foreground">
                                            Soldan bir konu seçiniz.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Blog Tab */}
                    {activeTab === 'blog' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Blog Yönetimi</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fileInput = document.getElementById('blog-pdf-upload') as HTMLInputElement;
                                const file = fileInput?.files?.[0];

                                const formData = new FormData();
                                formData.append('action', 'add');
                                formData.append('title', newBlog.title);
                                formData.append('category', newBlog.category);
                                formData.append('excerpt', ''); // Excerpt removal if strict PDF, or keep as optional text? Removed as requested "PDF only" imply strict content.
                                if (file) {
                                    formData.append('pdf_file', file);
                                } else {
                                    alert("Lütfen bir PDF dosyası seçin.");
                                    return;
                                }

                                const res = await fetch('/api/admin/manage_blog.php', {
                                    method: 'POST',
                                    body: formData
                                });

                                if (res.ok) {
                                    alert("Blog yazısı eklendi!");
                                    setNewBlog({ title: '', category: '', excerpt: '' });
                                    if (fileInput) fileInput.value = '';
                                    fetchBlogs();
                                } else {
                                    alert("Hata oluştu.");
                                }
                            }} className="bg-card border border-border p-6 rounded-xl mb-8 space-y-4">
                                <h3 className="text-lg font-bold">Yeni Yazı Ekle (PDF)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} placeholder="Başlık" className="w-full p-2 border rounded bg-background" required />
                                    <input value={newBlog.category} onChange={e => setNewBlog({ ...newBlog, category: e.target.value })} placeholder="Kategori" className="w-full p-2 border rounded bg-background" required />
                                </div>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/20 text-center">
                                    <label className="block mb-2 font-semibold">Blog PDF Dosyası</label>
                                    <input type="file" id="blog-pdf-upload" accept="application/pdf" className="mx-auto block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" required />
                                </div>
                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors w-full md:w-auto justify-center">
                                    <Plus className="h-4 w-4" /> Ekle
                                </button>
                            </form>

                            <div className="grid gap-4">
                                {blogs.map((blog) => (
                                    <div key={blog.id} className="flex justify-between items-center p-4 bg-card border border-border rounded-lg">
                                        <div>
                                            <h4 className="font-bold">{blog.title}</h4>
                                            <p className="text-sm text-muted-foreground">{blog.category}</p>
                                        </div>
                                        <button onClick={() => handleDeleteBlog(blog.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                                {blogs.length === 0 && <p className="text-muted-foreground text-center py-8">Henüz blog yazısı yok.</p>}
                            </div>
                        </div>
                    )}

                    {/* Tutors Tab */}
                    {activeTab === 'tutors' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold">Eğitmen Yönetimi</h2>

                            {/* Add Tutor Form */}
                            <div className="p-6 rounded-xl bg-card border border-border">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Hoca Ekle</h2>
                                <form onSubmit={handleAddTutor} className="space-y-4">
                                    {/* Lesson Selection */}
                                    <div className="mb-4">
                                        <label className="text-sm font-medium mb-1 block">1. Ders Seçin (Konuları listelemek için)</label>
                                        <select
                                            className="w-full p-2 rounded bg-background border border-border"
                                            value={selectedLessonFilter || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const lessonId = val ? parseInt(val) : null;
                                                setSelectedLessonFilter(lessonId);
                                                // Reset topics when lesson changes to ensure flow validity
                                                setSelectedTopics([]);

                                                const selectedLesson = lessons.find(l => l.id === lessonId);
                                                if (selectedLesson) {
                                                    setNewTutor(prev => ({ ...prev, subjects: selectedLesson.name }));
                                                }
                                            }}
                                        >
                                            <option value="">Ders Seçiniz...</option>
                                            {lessons.map(l => (
                                                <option key={l.id} value={l.id}>{l.name} ({l.category})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Topic Selection UI - Only show if Lesson is Selected */}
                                    {/* DEBUG INFO */}
                                    {/* DEBUG INFO REMOVED */}

                                    {selectedLessonFilter && (
                                        <div className="border border-border rounded-xl p-4 max-h-60 overflow-y-auto mb-4 animate-in fade-in slide-in-from-top-2">
                                            <h3 className="font-bold mb-2">2. Konu Seçin</h3>
                                            <div className="space-y-4">
                                                {Object.entries(groupedTopics).map(([lessonName, topics]) => {
                                                    // Filter topics by selectedLessonFilter (robust string comparison)
                                                    const filteredTopics = topics.filter(t => String(t.lesson_id) === String(selectedLessonFilter));

                                                    if (filteredTopics.length === 0) return null;

                                                    return (
                                                        <div key={lessonName}>
                                                            <h4 className="font-semibold text-sm text-muted-foreground bg-muted/50 p-1 mb-1 rounded">{lessonName}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                {filteredTopics.map(topic => (
                                                                    <div key={topic.id} onClick={() => handleTopicToggle(topic.id)} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedTopics.includes(topic.id) ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted'}`}>
                                                                        {selectedTopics.includes(topic.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                                        <span className="text-sm">{topic.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {/* Add a specialized indicator if no topics found for this lesson */}
                                                {allTopics.filter(t => String(t.lesson_id) === String(selectedLessonFilter)).length === 0 && (
                                                    <p className="text-muted-foreground text-sm">Bu derse ait konu bulunamadı. (ID: {selectedLessonFilter})</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tutor Details Form - Only show if Lesson AND at least one Topic is Selected */}
                                    {selectedLessonFilter && selectedTopics.length > 0 && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-border pt-4">
                                            <h3 className="font-bold">3. Hoca Bilgileri</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input name="name" placeholder="Ad" value={newTutor.name} onChange={e => setNewTutor({ ...newTutor, name: e.target.value })} className="p-2 rounded bg-background border border-border" required />
                                                <input name="surname" placeholder="Soyad" value={newTutor.surname} onChange={e => setNewTutor({ ...newTutor, surname: e.target.value })} className="p-2 rounded bg-background border border-border" required />
                                                <input name="email" placeholder="Email" value={newTutor.email} onChange={e => setNewTutor({ ...newTutor, email: e.target.value })} className="p-2 rounded bg-background border border-border" required />
                                                <input name="account_name" placeholder="Hesap Sahibi (Ad Soyad)" value={newTutor.account_name} onChange={e => setNewTutor({ ...newTutor, account_name: e.target.value })} className="p-2 rounded bg-background border border-border" />
                                                <input name="iban" placeholder="IBAN (TR...)" value={newTutor.iban} onChange={e => setNewTutor({ ...newTutor, iban: e.target.value })} className="p-2 rounded bg-background border border-border" />
                                                {/* Price fields removed as per new logic */}
                                            </div>

                                            {/* Auto-filled subjects but user can edit (optional) */}
                                            <div className="hidden">
                                                {/* Hidden because it is auto-managed now, user shouldn't need to touch it if strict flow is enforced */}
                                                <input name="subjects" placeholder="Ders (Otomatik)" value={newTutor.subjects} readOnly className="w-full p-2 rounded bg-background border border-border" />
                                            </div>

                                            <textarea name="bio" placeholder="Biyografi" value={newTutor.bio} onChange={e => setNewTutor({ ...newTutor, bio: e.target.value })} className="w-full p-2 rounded bg-background border border-border" required />
                                            <button type="submit" className="bg-primary text-primary-foreground p-2 rounded w-full font-medium hover:bg-primary/90 transition-colors">Ekle</button>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Tutors List */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Mevcut Hocalar</h2>
                                <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
                                    <table className="w-full text-left min-w-[600px]">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-4 font-medium">Ad Soyad</th>
                                                <th className="p-4 font-medium">Email</th>
                                                <th className="p-4 font-medium">Dersler</th>
                                                <th className="p-4 font-medium">Banka Bilgileri</th>
                                                <th className="p-4 font-medium">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tutors.map(t => (
                                                <tr key={t.id} className="border-t border-border hover:bg-muted/50">
                                                    <td className="p-4">{t.name} {t.surname}</td>
                                                    <td className="p-4 text-muted-foreground">{t.email}</td>
                                                    <td className="p-4">{t.subjects}</td>
                                                    <td className="p-4 text-xs">
                                                        {t.account_name && <div>{t.account_name}</div>}
                                                        {t.iban && <div className="font-mono text-muted-foreground">{t.iban}</div>}
                                                    </td>
                                                    <td className="p-4 flex gap-2">
                                                        <button onClick={() => handleEditTutor(t)} className="p-2 text-primary hover:bg-primary/10 rounded transition-colors" title="Düzenle">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteTutor(t.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Sil">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Toplu Mesaj Gönder</h2>
                            <div className="p-6 rounded-xl bg-card border border-border max-w-2xl">
                                <p className="text-muted-foreground mb-6">Bu alandan tüm hocalara aynı anda mesaj gönderebilirsiniz. Mesajlar hem site içi bildirim paneline hem de kayıtlı e-posta adreslerine düşecektir.</p>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // Stop bubbling
                                    const form = e.currentTarget;
                                    const formData = new FormData(form);
                                    const payload = Object.fromEntries(formData);

                                    // Prevent double submission via simple flag check or just rely on logic
                                    // But key here is avoiding re-renders causing re-submission or button bounce.

                                    if (!confirm("Bu mesajı hedef kitleye göndermek istediğinize emin misiniz?")) return;

                                    try {
                                        const res = await fetch('/api/admin/send_bulk_message.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(payload)
                                        });
                                        const result = await res.json();
                                        alert(result.message);
                                        if (res.ok) {
                                            (e.target as HTMLFormElement).reset();
                                        }
                                    } catch {
                                        alert("Gönderim sırasında hata oluştu.");
                                    }
                                }} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Hedef Kitle</label>
                                        <select name="target_group" className="w-full p-2 rounded bg-background border border-border">
                                            <option value="tutors">Sadece Eğitmenler</option>
                                            <option value="students">Sadece Öğrenciler</option>
                                            <option value="all">Herkes (Eğitmen + Öğrenci)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Konu Başlığı</label>
                                        <input name="title" placeholder="Örn: Yeni Dönem Bilgilendirmesi" className="w-full p-2 rounded bg-background border border-border" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Mesaj İçeriği</label>
                                        <textarea name="content" placeholder="Mesajınızı buraya giriniz..." className="w-full p-2 rounded bg-background border border-border h-48" required />
                                    </div>
                                    <button type="submit" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded font-bold hover:bg-primary/90 transition-colors w-full">
                                        <MessageSquare className="h-5 w-5" /> Mesajı Yayınla
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Lessons Tab */}
                    {activeTab === 'lessons' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold">Ders Yönetimi</h2>
                            <div className="p-6 rounded-xl bg-card border border-border">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Ders Ekle</h2>
                                <form onSubmit={handleAddLesson} className="flex flex-col md:flex-row gap-4">
                                    <input name="name" placeholder="Ders Adı" value={newLesson.name} onChange={e => setNewLesson({ ...newLesson, name: e.target.value })} className="flex-1 p-2 rounded bg-background border border-border" required />
                                    <select name="category" value={newLesson.category} onChange={e => setNewLesson({ ...newLesson, category: e.target.value })} className="p-2 rounded bg-background border border-border" required>
                                        <option value="">Kategori Seç</option>
                                        <option value="YKS">YKS</option>
                                        <option value="LGS">LGS</option>
                                        <option value="DİL">DİL</option>
                                    </select>
                                    <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors">Ekle</button>
                                </form>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Mevcut Dersler</h2>
                                <div className="bg-card rounded-xl border border-border overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-4 font-medium">Ders Adı</th>
                                                <th className="p-4 font-medium">Kategori</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lessons.map(l => (
                                                <tr key={l.id} className="border-t border-border hover:bg-muted/50">
                                                    <td className="p-4">{l.name}</td>
                                                    <td className="p-4 flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">{l.category}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Topic Pricing Management */}
                            <div className="space-y-4 pt-8 border-t border-border mt-8">
                                <h2 className="text-xl font-bold">Konu Fiyatlandırma</h2>
                                <p className="text-muted-foreground text-sm">Derslerin konuları için tek tek fiyat belirleyebilirsiniz.</p>

                                <div className="mb-4">
                                    <select
                                        className="w-full md:w-1/3 p-2 rounded bg-background border border-border"
                                        value={pricingLessonId || ''}
                                        onChange={(e) => setPricingLessonId(Number(e.target.value))}
                                    >
                                        <option value="">Fiyatlandırma için Ders Seçiniz...</option>
                                        {lessons.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} ({l.category})</option>
                                        ))}
                                    </select>
                                </div>

                                {pricingLessonId && (
                                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="p-4 font-medium">Konu Adı</th>
                                                    <th className="p-4 font-medium">Fiyat (TL)</th>
                                                    <th className="p-4 font-medium">Eski Fiyat (Opsiyonel)</th>
                                                    <th className="p-4 font-medium">İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allTopics.filter(t => String(t.lesson_id) === String(pricingLessonId)).map(t => (
                                                    <TopicPriceRow key={t.id} topic={t} onSave={handleUpdateTopicPrice} />
                                                ))}
                                                {allTopics.filter(t => String(t.lesson_id) === String(pricingLessonId)).length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="p-4 text-center text-muted-foreground">Bu derse ait konu bulunamadı.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold">Randevular</h2>
                            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-4 font-medium">Öğrenci</th>
                                            <th className="p-4 font-medium">Eğitmen</th>
                                            <th className="p-4 font-medium">Tarih</th>
                                            <th className="p-4 font-medium">Durum</th>
                                            <th className="p-4 font-medium">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(book => (
                                            <tr key={book.id} className="border-t border-border hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="font-bold">{book.student_name} {book.student_surname}</div>
                                                    <div className="text-xs text-muted-foreground">{book.student_email}</div>
                                                </td>
                                                <td className="p-4">{book.tutor_name} {book.tutor_surname}</td>
                                                <td className="p-4 text-sm">{new Date(book.created_at).toLocaleString('tr-TR')}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${book.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                        book.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {book.status === 'approved' ? 'Onaylandı' : book.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {book.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleBookingStatus(book.id, 'approved')} className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90">Onayla</button>
                                                            <button onClick={() => handleBookingStatus(book.id, 'rejected')} className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs hover:bg-destructive/90">Reddet</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Ödeme Akışı</h2>

                            <div className="mb-8 bg-card border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <h3 className="text-lg text-muted-foreground">Toplam Onaylanan Ödeme</h3>
                                    <p className="text-4xl font-bold mt-2 text-primary">{totalRevenue} TL</p>
                                </div>
                                <div className="p-4 bg-primary/20 rounded-full text-primary">
                                    <DollarSign className="h-10 w-10" />
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-4 font-medium">Öğrenci</th>
                                            <th className="p-4 font-medium">Eğitmen</th>
                                            <th className="p-4 font-medium">Tutar</th>
                                            <th className="p-4 font-medium">Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                                                <td className="p-4">{p.student}</td>
                                                <td className="p-4">{p.tutor}</td>
                                                <td className="p-4 font-mono font-bold">{p.amount} TL</td>
                                                <td className="p-4 text-sm">{new Date(p.date).toLocaleString('tr-TR')}</td>
                                            </tr>
                                        ))}
                                        {payments.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground">Henüz onaylanmış ödeme kaydı bulunmuyor.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* Edit Tutor Modal */}
                    {
                        editingTutor && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                                <div className="bg-card p-6 rounded-xl w-full max-w-lg border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">Eğitmen Düzenle</h3>
                                        <button onClick={() => setEditingTutor(null)} className="text-muted-foreground hover:text-foreground">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUpdateTutor} className="space-y-4">
                                        {/* Price fields removed from Edit Modal */}

                                        {/* Topic Selection in Edit Modal */}
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Uzmanlık Alanları & Konular</label>
                                            <div className="border border-border rounded-xl p-4 max-h-60 overflow-y-auto">
                                                <div className="space-y-4">
                                                    {Object.entries(groupedTopics).map(([lessonName, topics]) => (
                                                        <div key={lessonName}>
                                                            <h4 className="font-semibold text-sm text-muted-foreground bg-muted/50 p-1 mb-1 rounded">{lessonName}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {topics.map(topic => (
                                                                    <div key={topic.id} onClick={() => handleTopicToggle(topic.id)} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedTopics.includes(topic.id) ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted'}`}>
                                                                        {selectedTopics.includes(topic.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                                        <span className="text-sm">{topic.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Dersler (Manuel Yazı)</label>
                                            <input
                                                value={editingTutor.subjects}
                                                onChange={e => setEditingTutor({ ...editingTutor!, subjects: e.target.value })}
                                                className="w-full p-2 rounded bg-background border border-border"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Biyografi</label>
                                            <textarea
                                                value={editingTutor.bio}
                                                onChange={e => setEditingTutor({ ...editingTutor!, bio: e.target.value })}
                                                className="w-full p-2 rounded bg-background border border-border h-24"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Ders Detayları (Hoca Sayfasında Görünür)</label>
                                            <textarea
                                                value={editingTutor.course_details || ''}
                                                onChange={e => setEditingTutor({ ...editingTutor!, course_details: e.target.value })}
                                                className="w-full p-2 rounded bg-background border border-border h-32"
                                                placeholder="Ders işleyişi hakkında detaylı bilgi, tecrübeler vb."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Hesap Sahibi (Ad Soyad)</label>
                                            <input
                                                value={editingTutor.account_name || ''}
                                                onChange={e => setEditingTutor({ ...editingTutor!, account_name: e.target.value })}
                                                className="w-full p-2 rounded bg-background border border-border"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">IBAN (TR...)</label>
                                            <input
                                                value={editingTutor.iban || ''}
                                                onChange={e => setEditingTutor({ ...editingTutor!, iban: e.target.value })}
                                                className="w-full p-2 rounded bg-background border border-border"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button type="button" onClick={() => setEditingTutor(null)} className="px-4 py-2 text-muted-foreground hover:bg-accent rounded">
                                                İptal
                                            </button>
                                            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2">
                                                <Save className="h-4 w-4" /> Kaydet
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }
                </main>
            </div>
        </div>
    );
}

function TopicPriceRow({ topic, onSave }: { topic: Topic, onSave: (id: number, p: string, fp: string) => void }) {
    const [price, setPrice] = useState(topic.price?.toString() || '');
    const [fakePrice, setFakePrice] = useState(topic.fake_price?.toString() || '');

    useEffect(() => {
        setPrice(topic.price?.toString() || '');
        setFakePrice(topic.fake_price?.toString() || '');
    }, [topic]);

    return (
        <tr className="border-t border-border hover:bg-muted/50">
            <td className="p-4">{topic.name}</td>
            <td className="p-4">
                <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-32 p-2 rounded bg-background border border-border"
                    placeholder="0.00"
                />
            </td>
            <td className="p-4">
                <input
                    type="number"
                    value={fakePrice}
                    onChange={e => setFakePrice(e.target.value)}
                    className="w-32 p-2 rounded bg-background border border-border"
                    placeholder="Opsiyonel"
                />
            </td>
            <td className="p-4">
                <button
                    onClick={() => onSave(topic.id, price, fakePrice)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
                >
                    Kaydet
                </button>
            </td>
        </tr>
    );
}


