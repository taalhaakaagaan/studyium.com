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
    Settings,
    Group
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/sidebar-nav";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Panel", href: "/teacher/dashboard" },
    { icon: Users, label: "Öğrencilerim", href: "/teacher/students" },
    { icon: MessageSquare, label: "Mesajlar", href: "/teacher/messages" },
    { icon: Group, label: "Gruplar", href: "/teacher/groups" },
    { icon: Radio, label: "Canlı Yayın", href: "/teacher/broadcast" },
    { icon: Settings, label: "Ayarlar", href: "/teacher/settings" },
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
