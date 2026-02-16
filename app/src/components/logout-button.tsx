"use client";

import { authAPI, useAuthStore } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
    className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
    const router = useRouter();
    const logout = useAuthStore(state => state.logout);

    const handleLogout = async () => {
        // Clear Client State
        logout();

        // Clear Backend Session
        await authAPI.logout();

        // Redirect
        router.push('/');
        router.refresh(); // Ensure server knows session is gone
    };

    return (
        <button
            onClick={handleLogout}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 text-sm font-medium",
                className
            )}
        >
            <LogOut className="h-4 w-4" />
            Logout
        </button>
    );
}
