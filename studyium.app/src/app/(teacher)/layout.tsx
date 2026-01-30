"use client";
import Link from "next/link";
import {
    Users,
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Radio,
    LogOut,
    Video,
    FileVideo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/sidebar-nav";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
    { icon: Calendar, label: "Schedule", href: "/teacher/schedule" },
    { icon: Users, label: "My Students", href: "/teacher/students" },
    { icon: MessageSquare, label: "Messages", href: "/teacher/messages" },
    { icon: Users, label: "Groups", href: "/teacher/groups" },
    // Live Class removed as per request
    { icon: Radio, label: "Broadcast", href: "/teacher/broadcast" },
    { icon: FileVideo, label: "Recordings", href: "/teacher/recordings" },
    { icon: Users, label: "Settings", href: "/teacher/settings" },
];

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-card md:flex">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <a href="/" className="flex items-center gap-2 font-semibold text-purple-600">
                        <Users className="h-6 w-6" />
                        <span className="">Teacher Portal</span>
                    </a>
                </div>
                <div className="flex-1">
                    <SidebarNav items={sidebarItems} />
                </div>
                <div className="mt-auto p-4">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
