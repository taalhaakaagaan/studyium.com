"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock, Video, Users, Info } from "lucide-react";
import { useAuthStore, authAPI } from "@/lib/auth";
import Link from "next/link";
import { generateGoogleCalendarUrl } from "@/lib/calendar";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulePage() {
    const { user } = useAuthStore();
    const [currentDate] = useState(new Date());
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (user?.id) {
                const res = await authAPI.getUserDetails(user.id);
                if (res.success) {
                    setBookings(res.bookings || []);
                }
            }
        };
        fetchSchedule();
    }, [user?.id]);

    const addToCalendar = (title: string, dateStr?: string, hour?: number) => {
        if (!dateStr || hour === undefined) return;

        const date = new Date(dateStr);
        date.setHours(hour);

        const url = generateGoogleCalendarUrl({
            title: title || "Studyium Lesson",
            description: "Live lesson on Studyium",
            startTime: date
        });
        window.open(url, '_blank');
    };

    // Helper to map bookings to grid
    const getEventsForDay = (dayStr: string) => {
        return bookings.filter(b => {
            if (!b.date) return false;
            const date = new Date(b.date);
            const dayIndex = date.getDay(); // 0-6 (Sun is 0)
            const jsDayToOurDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return jsDayToOurDay[dayIndex] === dayStr;
        }).map(b => {
            const date = new Date(b.date);
            return {
                id: b.id,
                hour: date.getHours(),
                note: b.topic_name || "Lesson",
                groupName: b.teacher_name ? `Tutor: ${b.teacher_name}` : "Class",
                unformattedDate: b.date
            };
        }).sort((a, b) => a.hour - b.hour);
    };

    // Find upcoming
    const upcomingSession = bookings.find(b => new Date(b.date) > new Date());
    const upcomingGroup = upcomingSession ? { name: upcomingSession.topic_name || "Lesson" } : null;
    const upcomingTeacher = upcomingSession ? { name: upcomingSession.teacher_name || "Tutor" } : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border shadow-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span>January 2026</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                {DAYS.slice(0, 5).map((day) => {
                    const events = getEventsForDay(day);
                    return (
                        <div key={day} className="space-y-4">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center pb-2 border-b">
                                {day}
                            </div>
                            <div className="space-y-3 min-h-[300px]">
                                {events.length > 0 ? (
                                    events.map((event: any, j: number) => {
                                        return (
                                            <div key={j} className="group relative rounded-lg border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 p-3 shadow-sm text-sm space-y-1 hover:shadow-md transition-shadow">
                                                <h4 className="font-semibold pr-4">{event.groupName}</h4>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCalendar(event.groupName, event.unformattedDate, event.hour);
                                                    }}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-indigo-600"
                                                    title="Add to Google Calendar"
                                                >
                                                    <CalendarIcon size={12} />
                                                </button>

                                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                    <Clock size={10} /> {event.hour}:00 - {event.hour + 1}:00
                                                </div>
                                                {event.note && (
                                                    <div className="text-xs text-muted-foreground italic">
                                                        "{event.note}"
                                                    </div>
                                                )}
                                                <div className="inline-block rounded px-1.5 py-0.5 text-[10px] uppercase font-bold bg-background/50 text-foreground/70">
                                                    Group Class
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full rounded-lg border border-dashed flex items-center justify-center text-muted-foreground/30 text-xs py-8">
                                        Free Day
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {upcomingSession && upcomingGroup && (
                <div className="rounded-xl border bg-card p-6 shadow-sm mt-8 border-l-4 border-l-indigo-500">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5 text-indigo-600" />
                        Next Live Session
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                            <p className="font-medium text-lg">{upcomingGroup.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <CalendarIcon size={14} />
                                    {upcomingSession.date ? new Date(upcomingSession.date).toLocaleString() : 'Upcoming'}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1"><Users size={14} /> {upcomingTeacher?.name}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => addToCalendar(upcomingGroup.name, upcomingSession.date, new Date(upcomingSession.date).getHours())}
                                className="px-4 py-3 bg-white border text-indigo-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <CalendarIcon size={16} />
                                Add to Calendar
                            </button>
                            <Link
                                href="/teacher/live?role=student"
                                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <Video size={16} />
                                Join Live Classroom
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
