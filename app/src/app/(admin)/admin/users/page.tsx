"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";
import { Search, Loader2, Users, GraduationCap, BookOpen } from "lucide-react";

type Tab = 'students' | 'teachers';

export default function AdminUsersPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('students');
    const [searchText, setSearchText] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const role = activeTab === 'students' ? 'user' : 'tutor';
            const res = await authAPI.getUsers(role, searchText);
            if (res.success) setData(res.users || []);
            else setData([]);
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const handleRowClick = (user: any) => {
        router.push(`/admin/users/detail?id=${user.id}`);
    };

    const isStudents = activeTab === 'students';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h2>
                <div className="text-sm text-muted-foreground">
                    {data.length} {isStudents ? 'öğrenci' : 'öğretmen'}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-muted/50 rounded-xl p-1.5 gap-1 max-w-xs">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${isStudents
                            ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <GraduationCap size={16} />
                    Öğrenciler
                </button>
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${!isStudents
                            ? 'bg-card shadow-sm text-violet-600 dark:text-violet-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <BookOpen size={16} />
                    Öğretmenler
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="İsim veya email ile ara..."
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pl-10"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-5">
                    Ara
                </button>
            </form>

            {/* Content Table */}
            <div className="border rounded-2xl shadow-sm bg-card overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5 font-medium">İsim</th>
                                    <th className="px-6 py-3.5 font-medium">Email</th>
                                    <th className="px-6 py-3.5 font-medium">Rol</th>
                                    <th className="px-6 py-3.5 font-medium">Kayıt Tarihi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {data.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleRowClick(item)}
                                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium">{item.name || '-'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.role === 'tutor' || item.role === 'teacher'
                                                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {item.role === 'tutor' || item.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                            {isStudents ? 'Öğrenci bulunamadı.' : 'Öğretmen bulunamadı.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
