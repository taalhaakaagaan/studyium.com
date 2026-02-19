
"use client";

import { useState } from "react";
import { User } from "@/lib/data";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: User;
    students: User[];
    currentAssignments: string[]; // List of student IDs
    onSave: (teacherId: string, studentIds: string[]) => void;
}

export function AssignmentDialog({
    isOpen,
    onClose,
    teacher,
    students,
    currentAssignments,
    onSave,
}: AssignmentDialogProps) {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(currentAssignments);

    if (!isOpen) return null;

    const toggleStudent = (studentId: string) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                        <h2 className="text-lg font-semibold">Assign Students</h2>
                        <p className="text-sm text-zinc-500">To: {teacher.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {students.map((student) => {
                        const isSelected = selectedStudentIds.includes(student.id);
                        return (
                            <div
                                key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                    isSelected
                                        ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                                        : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{student.name}</div>
                                        <div className="text-xs text-zinc-500">{student.email}</div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="text-indigo-600 dark:text-indigo-400">
                                        <Check size={16} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {students.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                            No students found.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(teacher.id, selectedStudentIds)}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                    >
                        Save Assignments
                    </button>
                </div>
            </div>
        </div>
    );
}
