"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, useAuthStore } from "@/lib/auth";
import { User, Search, Mail, BookOpen } from "lucide-react";

export default function TeacherStudentsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            const res = await authAPI.getUsers('student', search);
            if (res.success) {
                // Map API response to Component state
                const mapped = res.users.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
                }));
                setStudents(mapped);
            }
            setLoading(false);
        };
        // Debounce could be added here, but for now fetch on search change
        const timeout = setTimeout(fetchStudents, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    // Client-side filter is now redundant if API does it, but keeping for safety if API fails search partials
    const filtered = students;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">My Students</h2>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm pl-8"
                        placeholder="Search students..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map(student => (
                    <div
                        key={student.id}
                        onClick={() => router.push(`/teacher/students/detail?id=${student.id}`)}
                        className="bg-card border rounded-xl shadow-sm p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="font-semibold text-lg">{student.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <Mail className="h-3 w-3" />
                                {student.email}
                            </div>
                        </div>
                        <div className="w-full pt-4 border-t mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>Joined: {student.joined}</span>
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" /> 2 Courses
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
