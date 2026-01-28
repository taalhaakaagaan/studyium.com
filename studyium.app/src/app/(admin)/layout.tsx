"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";
import {
    ShieldCheck,
    LayoutDashboard,
    Users,
    FileBox,
    Settings,
    LogOut,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WindowControls } from "@/components/window-controls";
import { SidebarNav } from "@/components/sidebar-nav";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: Users, label: "Groups", href: "/admin/groups" },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-card md:flex">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <ShieldCheck className="h-6 w-6 text-red-600" />
                        <span className="">Admin Panel</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <SidebarNav items={sidebarItems} />
                </div>
                <div className="mt-auto p-4">
                    <button
                        onClick={async () => {
                            await authAPI.logout();
                            window.location.href = '/login';
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <WindowControls />
                <div className="flex-1 p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
