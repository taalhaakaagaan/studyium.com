"use client";

import { useAuthStore, authAPI } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function TeacherSettingsPage() {
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await authAPI.logout();
        logout();
        router.push('/login');
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Account Actions</h3>
                    <div className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
                        <div>
                            <div className="font-medium">Sign Out</div>
                            <div className="text-sm text-muted-foreground">Sign out of your account</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
