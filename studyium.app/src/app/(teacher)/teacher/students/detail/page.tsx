"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authAPI, useAuthStore } from "@/lib/auth";
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Video, User } from "lucide-react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 to 24:00 (approx)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const dynamic = 'force-dynamic';

import { Suspense } from "react";

function StudentDetailContent() {
    const searchParams = useSearchParams();
    const studentId = searchParams.get('id');
    const { user } = useAuthStore();

    const [student, setStudent] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string, hour: number } | null>(null);
    const [topic, setTopic] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            if (!studentId) return;
            // Mock fetch student
            // In real app: const res = await authAPI.getUserDetails(studentId);
            // setStudent(res.user);
            setStudent({ id: studentId, name: 'Student Name', email: 'student@example.com' });

            // Mock fetch specific lessons for this student AND this teacher
            setLessons([
                { day: 'Mon', hour: 10, topic: 'Algebra 101', teacher_id: (user as any)?.id }
            ]);
            setLoading(false);
        };
        fetchDetails();
    }, [studentId, user]);

    const handleSlotClick = (day: string, hour: number) => {
        setSelectedSlot({ day, hour });
        setShowModal(true);
    };

    const handleSaveLesson = async () => {
        if (!selectedSlot || !topic) return;

        // Mock Save to DB
        // authAPI.createBooking({ student_id: studentId, tutor_id: user.id, day, hour, topic ... })
        const newLesson = {
            day: selectedSlot.day,
            hour: selectedSlot.hour,
            topic: topic,
            teacher_id: (user as any)?.id
        };
        setLessons([...lessons, newLesson]);
        setShowModal(false);
        setTopic("");
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-card border rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{student?.name}</h1>
                        <p className="text-muted-foreground">{student?.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium">Enrolled Courses</div>
                    <div className="text-2xl font-bold text-primary">2</div>
                </div>
            </div>

            {/* Schedule */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Weekly Schedule for {student?.name}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                        Click a slot to assign a lesson
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-8 border-b divide-x bg-muted/20 text-center text-sm font-medium py-2">
                            <div className="p-2 w-16">Time</div>
                            {DAYS.map(d => <div key={d} className="p-2 flex-1">{d}</div>)}
                        </div>
                        <div className="divide-y">
                            {HOURS.map(hour => (
                                <div key={hour} className="grid grid-cols-8 divide-x min-h-[60px]">
                                    <div className="p-2 text-xs text-muted-foreground flex items-center justify-center bg-muted/5 font-mono">
                                        {String(hour).padStart(2, '0')}:00
                                    </div>
                                    {DAYS.map(day => {
                                        // Filter lessons: specific to student (implied by page context) AND specific to teacher (optional but good)
                                        const lesson = lessons.find(l => l.day === day && l.hour === hour);
                                        // Is it my lesson?
                                        const isMyLesson = lesson?.teacher_id === (user as any)?.id;

                                        return (
                                            <div
                                                key={day}
                                                onClick={() => !lesson && handleSlotClick(day, hour)}
                                                className={`p-2 relative transition-all border-transparent border-2 hover:border-primary/20 ${lesson ? (isMyLesson ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-100 dark:bg-gray-800') : 'hover:bg-muted/50 cursor-pointer'}`}
                                            >
                                                {lesson ? (
                                                    <div className="text-xs text-left">
                                                        <div className={`font-bold truncate ${isMyLesson ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                            {lesson.topic}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {isMyLesson ? 'You' : 'Other Teacher'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100">
                                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Lesson Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-background border rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Assign Lesson</h3>
                        <div className="text-sm text-muted-foreground">
                            {selectedSlot?.day} @ {selectedSlot?.hour}:00
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Lesson Topic</label>
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                placeholder="e.g. Thermodynamics"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">
                                Cancel
                            </button>
                            <button onClick={handleSaveLesson} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TeacherStudentDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>}>
            <StudentDetailContent />
        </Suspense>
    );
}
