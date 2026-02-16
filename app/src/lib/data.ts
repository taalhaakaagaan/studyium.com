
export type Role = "admin" | "teacher" | "student";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
}

export const MOCK_USERS: User[] = [
    { id: "1", name: "Admin User", email: "admin@studyium.app", role: "admin" },
    { id: "2", name: "Ali Yılmaz", email: "ali@teacher.com", role: "teacher" },
    { id: "3", name: "Ayşe Kaya", email: "ayse@teacher.com", role: "teacher" },
    { id: "4", name: "Mehmet Demir", email: "mehmet@student.com", role: "student" },
    { id: "5", name: "Zeynep Çelik", email: "zeynep@student.com", role: "student" },
    { id: "6", name: "Can Yıldız", email: "can@student.com", role: "student" },
    { id: "7", name: "Elif Arslan", email: "elif@student.com", role: "student" },
];

export interface Assignment {
    teacherId: string;
    studentId: string;
}

// In a real app, this would be in a DB. 
// For now we will just use this structure to type our components.
export const MOCK_ASSIGNMENTS: Assignment[] = [
    { teacherId: "2", studentId: "4" },
];

export interface Lesson {
    id: string;
    teacherId: string;
    studentId: string;
    date: string; // ISO string for simplicity in mock
    topic: string;
    status: "scheduled" | "completed" | "cancelled";
    meetingLink?: string;
}

export const MOCK_LESSONS: Lesson[] = [
    {
        id: "l1",
        teacherId: "2",
        studentId: "4",
        date: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        topic: "Calculus: Derivatives",
        status: "scheduled"
    },
    {
        id: "l2",
        teacherId: "2",
        studentId: "4",
        date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        topic: "Physics: Kinematics",
        status: "scheduled"
    },
];

export interface Group {
    id: string;
    name: string;
    teacherId: string;
    studentIds: string[];
}

export const MOCK_GROUPS: Group[] = [
    { id: "g1", name: "Math Advanced Group", teacherId: "2", studentIds: ["4", "5"] },
    { id: "g2", name: "Physics 101 Cohort", teacherId: "2", studentIds: ["6", "7"] },
];

export interface ScheduleItem {
    day: string; // "Monday", "Tuesday", etc.
    hour: number; // 8-21
    groupId?: string; // If null/undefined, it might be a private 1-on-1 placeholder or free
    note?: string;    // "Problem Solving", "Lecture", etc.
    teacherId: string;
}

export const MOCK_SCHEDULE_ITEMS: ScheduleItem[] = [
    { day: "Monday", hour: 10, groupId: "g1", note: "Derivatives Introduction", teacherId: "2" },
    { day: "Wednesday", hour: 14, groupId: "g2", note: "Newton's Laws", teacherId: "2" },
];
