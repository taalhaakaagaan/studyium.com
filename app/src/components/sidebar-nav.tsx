"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { chatAPI, useAuthStore } from "@/lib/auth";
import { usePathname } from "next/navigation";

interface SidebarItem {
    icon: any;
    label: string;
    href: string;
}

interface SidebarNavProps {
    items: SidebarItem[];
    basePath?: string; // e.g. /teacher or /admin to highlight active
}

export function SidebarNav({ items }: SidebarNavProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [counts, setCounts] = useState({ dm: 0, groups: 0 });

    useEffect(() => {
        if (!user) return;

        const fetchCounts = async () => {
            const res = await chatAPI.getUnreadCounts((user as any).id);
            if (res.success) {
                setCounts({ dm: res.dm, groups: res.groups });
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [user]);

    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-2 mt-4">
            {items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const isMessages = item.label === "Messages";
                // const isGroups = item.label === "Groups"; // If we separate group counts

                return (
                    <a
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all relative",
                            isActive
                                ? "bg-muted text-primary font-semibold"
                                : "text-muted-foreground hover:text-primary hover:bg-muted"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}

                        {isMessages && counts.dm > 0 && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {counts.dm}
                            </span>
                        )}
                    </a>
                );
            })}
        </nav>
    );
}
