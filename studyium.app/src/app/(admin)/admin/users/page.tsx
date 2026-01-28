"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";
import { Search, Loader2 } from "lucide-react";

type Tab = 'students' | 'teachers' | 'visitors';

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
            if (activeTab === 'visitors') {
                const res = await authAPI.getVisitors(searchText);
                if (res.success) setData(res.visitors);
            } else {
                // Map tab to role
                const role = activeTab === 'students' ? 'user' : 'tutor';
                const res = await authAPI.getUsers(role, searchText);
                if (res.success) setData(res.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const handleRowClick = (user: any) => {
        if (activeTab === 'visitors') return; // Non-clickable
        router.push(`/admin/users/detail?id=${user.id}`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>

            {/* Tabs */}
            <div className="flex space-x-2 border-b">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Students
                </button>
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'teachers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Teachers
                </button>
                <button
                    onClick={() => setActiveTab('visitors')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'visitors' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Visitors
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                    Search
                </button>
            </form>

            {/* Content Table */}
            <div className="border rounded-xl shadow bg-card">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    {activeTab === 'visitors' ? (
                                        <>
                                            <th className="px-6 py-3 font-medium">ID</th>
                                            <th className="px-6 py-3 font-medium">IP Address</th>
                                            <th className="px-6 py-3 font-medium">Visited At</th>
                                            {/* Add more visitor columns if known */}
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-3 font-medium">Name</th>
                                            <th className="px-6 py-3 font-medium">Email</th>
                                            <th className="px-6 py-3 font-medium">Joined Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleRowClick(item)}
                                        className={`transition-colors ${activeTab !== 'visitors' ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                                    >
                                        {activeTab === 'visitors' ? (
                                            <>
                                                <td className="px-6 py-4">{item.id}</td>
                                                <td className="px-6 py-4">{item.ip_address || "Unknown"}</td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {item.visited_at ? new Date(item.visited_at).toLocaleString() : '-'}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{item.email}</td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                            No {activeTab} found.
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
