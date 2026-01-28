"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/auth";
import { Loader2, User as UserIcon, Calendar, DollarSign, MessageSquare, Star } from "lucide-react";

export function UserDetailClient() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (id) {
                const res = await authAPI.getUserDetails(id);
                if (res.success) {
                    setData(res);
                }
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!data || !data.user) return <div className="p-8 text-center">User not found</div>;

    const { user, bookings, comments, stats } = data;
    const isTeacher = user.role === 'tutor' || user.role === 'teacher';

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header / Profile Card */}
            <div className="flex items-start justify-between bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-muted rounded-full">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                        </div>
                    </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                    <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Teacher Specific Stats */}
            {isTeacher && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-medium">Total Earnings</span>
                        </div>
                        <div className="text-2xl font-bold">${stats.totalEarnings?.toLocaleString() || 0}</div>
                    </div>
                    {/* Add more teacher stats if needed */}
                </div>
            )}

            {/* Courses / Lessons History */}
            <div className="border rounded-xl shadow bg-card">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {isTeacher ? "Teaching History" : "Course History"}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">{isTeacher ? "Student" : "Teacher"}</th>
                                <th className="px-6 py-3 font-medium">Topic</th>
                                <th className="px-6 py-3 font-medium">Fee</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bookings.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4">{new Date(booking.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">
                                        {isTeacher ? booking.student_name : booking.teacher_name}
                                    </td>
                                    <td className="px-6 py-4">{booking.topic_name}</td>
                                    <td className="px-6 py-4">${booking.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize 
                                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {booking.status || 'pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No lessons found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Comments Section */}
            {!isTeacher && (
                <div className="border rounded-xl shadow bg-card">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Reviews & Comments
                        </h3>
                    </div>
                    <div className="divide-y">
                        {comments.length > 0 ? comments.map((comment: any, idx: number) => (
                            <div key={idx} className="p-6 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium">{comment.student_name || comment.tutor_name || comment.subject || "Review"}</span>
                                    <div className="flex items-center gap-2">
                                        {comment.rating && (
                                            <span className="flex items-center text-yellow-500 text-xs font-bold">
                                                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                                                {comment.rating}/5
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm">{comment.content || comment.message}</p>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-muted-foreground">
                                No comments found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
