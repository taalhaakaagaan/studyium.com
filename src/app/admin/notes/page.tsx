"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, FileText, Upload, Save } from "lucide-react";

type Note = {
    id: number;
    title: string;
    slug: string;
    category: string;
    lesson_name: string;
    created_at: string;
};

type Lesson = {
    id: number;
    name: string;
    category: string;
};


export default function AdminNotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);

    // Modal / Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentNote, setCurrentNote] = useState<any>(null); // Full detail for editing
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchNotes();
        // Fetch lessons for dropdown
        // Assuming there is an endpoint for lessons or we reuse get_popular_lessons? 
        // We probably need a simple get_all_lessons endpoint, but for now let's assume popular or hardcode/fetch existing.
        // Actually we don't have a simple get_all_lessons. Let's create a quick way or just fetch notes and unique lessons?
        // Let's assume we can fetch lessons. User didn't ask for lesson management, just lesson NOTES.
        // I'll assume standard lessons exist.
    }, []);

    const fetchNotes = () => {
        fetch("/api/notes/get_notes.php")
            .then(res => res.json())
            .then(data => setNotes(data))
            .catch(err => console.error(err));
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/save_note.php?id=${id}`, { method: 'DELETE' });
        fetchNotes();
    };

    const handleEdit = (note: Note) => {
        // Fetch full details including content
        fetch(`/api/notes/get_notes.php?slug=${note.slug}`)
            .then(res => res.json())
            .then(data => {
                setCurrentNote(data);
                setIsEditing(true);
            });
    };

    const handleCreate = () => {
        setCurrentNote({
            title: '',
            slug: '',
            category: 'TYT',
            content: '',
            lesson_id: ''
        });
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const md = new FormData(e.currentTarget);
        if (currentNote.id) md.append('id', currentNote.id);
        // If content is rich text, get it from editor. Here using textarea for simplicity as requested "HTML/Text".

        try {
            const res = await fetch("/api/admin/save_note.php", {
                method: "POST",
                body: md
            });
            const json = await res.json();
            if (res.ok) {
                alert("Başarılı!");
                setIsEditing(false);
                fetchNotes();
            } else {
                alert("Hata: " + json.message);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ders Notları Yönetimi</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> Yeni Not Ekle
                </button>
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">Başlık</th>
                            <th className="p-4 font-medium">Kategori</th>
                            <th className="p-4 font-medium">Ders</th>
                            <th className="p-4 font-medium">Tarih</th>
                            <th className="p-4 font-medium text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {notes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Henüz not eklenmemiş.
                                </td>
                            </tr>
                        ) : (
                            notes.map((note) => (
                                <tr key={note.id} className="hover:bg-white/5">
                                    <td className="p-4 font-medium">{note.title}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${note.category === 'AYT' ? 'bg-purple-400/10 text-purple-400 ring-purple-400/20' : 'bg-blue-400/10 text-blue-400 ring-blue-400/20'}`}>
                                            {note.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground">{note.lesson_name || '-'}</td>
                                    <td className="p-4 text-muted-foreground">{new Date(note.created_at).toLocaleDateString("tr-TR")}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(note)}
                                                className="rounded-lg p-2 hover:bg-white/10 text-blue-400"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="rounded-lg p-2 hover:bg-white/10 text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal - Simple implementation inline or distinct component */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl border border-white/20 bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentNote?.id ? 'Notu Düzenle' : 'Yeni Not Ekle'}</h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Başlık</label>
                                    <input
                                        name="title"
                                        defaultValue={currentNote?.title}
                                        required
                                        className="w-full rounded-md border border-white/10 bg-black/20 p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kategori</label>
                                    <select
                                        name="category"
                                        defaultValue={currentNote?.category}
                                        className="w-full rounded-md border border-white/10 bg-black/20 p-2"
                                    >
                                        <option value="TYT">TYT</option>
                                        <option value="AYT">AYT</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ders ID (şimdilik manuel)</label>
                                <input
                                    name="lesson_id"
                                    type="number"
                                    defaultValue={currentNote?.lesson_id}
                                    className="w-full rounded-md border border-white/10 bg-black/20 p-2"
                                    placeholder="Örn: 1 (Matematik)"
                                />
                                <p className="text-xs text-muted-foreground">Ders listesi veritabanından ID bakılarak girilebilir.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">İçerik (HTML)</label>
                                <textarea
                                    name="content"
                                    defaultValue={currentNote?.content}
                                    rows={10}
                                    className="w-full rounded-md border border-white/10 bg-black/20 p-2 font-mono text-sm"
                                    placeholder="<p>Not içeriği...</p>"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">PDF Yükle (Opsiyonel)</label>
                                <input
                                    type="file"
                                    name="pdf_file"
                                    accept="application/pdf"
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-white/10"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                                >
                                    <Save className="h-4 w-4" /> Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
