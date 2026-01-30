"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Video, Users, Clock, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ScheduleItem {
    id?: number;
    day_of_week: string;
    start_time: string; // "HH:mm:ss"
    end_time: string;
    student_id?: number | null;
    group_id?: number | null;
    is_live: boolean;
    note?: string;
    student_name?: string;
    group_name?: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Group {
    id: number;
    name: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [users, setUsers] = useState<Student[]>([]); // All users for selection
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string, hour: number } | null>(null);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        studentId: "",
        groupId: "",
        note: "",
        isLive: false,
        duration: 1 // hours
    });

    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined' && (window as any).electron) {
                try {
                    const sessionRes = await (window as any).electron.invoke('db:check-session');
                    if (sessionRes.success) {
                        setCurrentUser(sessionRes);
                        loadSchedule(sessionRes.id);
                        loadResources();
                    }
                } catch (error) {
                    console.error("Init error:", error);
                }
            } else {
                // Mock for browser dev
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadSchedule = async (teacherId: number) => {
        try {
            const res = await (window as any).electron.invoke('db:get-schedule', { teacherId });
            if (res.success) {
                setSchedule(res.schedule);
            }
        } catch (e) {
            console.error("Load schedule error", e);
        } finally {
            setLoading(false);
        }
    };

    const loadResources = async () => {
        try {
            const usersRes = await (window as any).electron.invoke('db:get-users', { role: 'student' }); // or 'user'
            if (usersRes.success) setUsers(usersRes.users);

            const groupsRes = await (window as any).electron.invoke('db:get-groups');
            if (groupsRes.success) setGroups(groupsRes.groups);
        } catch (e) {
            console.error("Load resources error", e);
        }
    };

    const handleSlotClick = (day: string, hour: number) => {
        // Check if there is already an item here?
        // Actually, we render items on top. If clicking empty space:
        setSelectedSlot({ day, hour });
        setEditingItem(null);
        setFormData({
            studentId: "",
            groupId: "",
            note: "",
            isLive: false,
            duration: 1
        });
        setIsModalOpen(true);
    };

    const handleItemClick = (item: ScheduleItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingItem(item);
        setSelectedSlot(null);

        // Parse duration
        const start = parseInt(item.start_time.split(':')[0]);
        const end = parseInt(item.end_time.split(':')[0]);

        setFormData({
            studentId: item.student_id?.toString() || "",
            groupId: item.group_id?.toString() || "",
            note: item.note || "",
            isLive: Boolean(item.is_live),
            duration: end - start
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!currentUser) return;

        const day = editingItem ? editingItem.day_of_week : selectedSlot?.day;
        const startHour = editingItem ? parseInt(editingItem.start_time.split(':')[0]) : selectedSlot?.hour;

        if (!day || startHour === undefined) return;

        // Construct times
        // Simple HH:00:00 format
        const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
        const endHour = startHour + Number(formData.duration);
        const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;

        const payload = {
            id: editingItem?.id, // undefined for new
            teacher_id: currentUser.id,
            student_id: formData.studentId || null,
            group_id: formData.groupId || null,
            day_of_week: day,
            start_time: startTime,
            end_time: endTime,
            is_live: formData.isLive ? 1 : 0,
            note: formData.note
        };

        try {
            const res = await (window as any).electron.invoke('db:save-schedule-item', payload);
            if (res.success) {
                setIsModalOpen(false);
                loadSchedule(currentUser.id);
            } else {
                alert("Failed to save: " + res.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error saving");
        }
    };

    const handleDelete = async () => {
        if (!editingItem?.id) return;
        if (!confirm("Are you sure you want to delete this schedule item?")) return;

        try {
            const res = await (window as any).electron.invoke('db:delete-schedule-item', editingItem.id);
            if (res.success) {
                setIsModalOpen(false);
                loadSchedule(currentUser.id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to find items for a cell
    const getItemsForCell = (day: string, hour: number) => {
        return schedule.filter(item => {
            if (item.day_of_week !== day) return false;
            const start = parseInt(item.start_time.split(':')[0]);
            return start === hour;
            // What if it spans multiple hours?
            // With this simple grid, rendering only at start time is easiest, maybe stretch height.
        });
    };

    if (loading) return <div className="p-8 text-white">Loading schedule...</div>;

    return (
        <div className="p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Weekly Schedule</h1>
                    <p className="text-zinc-400">Manage your recurring weekly lessons</p>
                </div>
                {/* Could add a 'Save Changes' if we were doing batch, but we do atomic now */}
            </div>

            <div className="flex-1 overflow-auto bg-zinc-900 rounded-xl border border-zinc-800 relative">
                <div className="grid grid-cols-8 min-w-[1000px] border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10 text-sm font-medium">
                    <div className="p-3 border-r border-zinc-800 text-center text-zinc-400">Time</div>
                    {DAYS.map(day => (
                        <div key={day} className="p-3 border-r border-zinc-800 text-center text-zinc-300 last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-8 min-w-[1000px]">
                    {HOURS.map(hour => (
                        <>
                            <div key={`time-${hour}`} className="p-3 border-r border-b border-zinc-800 text-center text-xs text-zinc-500 font-mono">
                                {hour}:00
                            </div>
                            {DAYS.map(day => {
                                const items = getItemsForCell(day, hour);
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className="border-r border-b border-zinc-800 relative min-h-[80px] hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                                        onClick={() => handleSlotClick(day, hour)}
                                    >
                                        <div className="absolute inset-0 p-1">
                                            {items.map(item => {
                                                const start = parseInt(item.start_time.split(':')[0]);
                                                const end = parseInt(item.end_time.split(':')[0]);
                                                const duration = end - start;
                                                const height = duration * 80; // 80px per hour approx
                                                // Adjust height to cover multiple slots?
                                                // CSS grid is better for this but for now simple absolute within relative cell
                                                // But if we use absolute, we need to overflow the cell.
                                                // Simpler: Just render it in the start cell with z-index.
                                                // Note: 'overflow-hidden' on cell would clip it. Removed it effectively.

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={(e) => handleItemClick(item, e)}
                                                        className={cn(
                                                            "absolute left-1 right-1 rounded-md p-2 text-xs border cursor-pointer hover:brightness-110 shadow-md z-10 flex flex-col gap-1 overflow-hidden",
                                                            item.is_live ? "bg-red-900/80 border-red-700/50" : "bg-indigo-900/80 border-indigo-700/50"
                                                        )}
                                                        style={{ height: `${height - 8}px`, top: '4px' }}
                                                    >
                                                        <div className="flex items-center gap-1 font-semibold text-white/90">
                                                            {item.is_live && <Video size={10} className="animate-pulse text-red-400" />}
                                                            {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                                        </div>
                                                        <div className="font-medium truncate">
                                                            {item.student_name || item.group_name || "Private Block"}
                                                        </div>
                                                        {item.note && <div className="text-white/60 truncate italic">{item.note}</div>}
                                                    </div>
                                                );
                                            })}

                                            {/* Hover add button */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center pointer-events-none">
                                                {items.length === 0 && <Plus className="text-zinc-600" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/50">
                            <h3 className="font-semibold text-lg">
                                {editingItem ? "Edit Schedule Item" : "Add New Item"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Assign To</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value, groupId: "" })}
                                        disabled={!!formData.groupId}
                                    >
                                        <option value="">Select Student...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>

                                    <select
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        value={formData.groupId}
                                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value, studentId: "" })}
                                        disabled={!!formData.studentId}
                                    >
                                        <option value="">Select Group...</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Start Time</label>
                                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300 text-sm border border-zinc-700">
                                        {(editingItem ? parseInt(editingItem.start_time) : selectedSlot?.hour)}:00
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Duration (Hours)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Note</label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    placeholder="e.g. 'Calculus: Derivatives'"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                <input
                                    type="checkbox"
                                    id="isLive"
                                    checked={formData.isLive}
                                    onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                                    className="w-4 h-4 rounded border-zinc-600 text-indigo-600 focus:ring-indigo-600"
                                />
                                <label htmlFor="isLive" className="text-sm font-medium flex items-center gap-2 cursor-pointer select-none">
                                    <Video size={14} className={formData.isLive ? "text-red-500" : "text-zinc-500"} />
                                    This is a Live Lesson
                                </label>
                            </div>
                        </div>

                        <div className="p-4 border-t border-zinc-800 bg-zinc-800/50 flex justify-end gap-2">
                            {editingItem && (
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors mr-auto"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Save Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
