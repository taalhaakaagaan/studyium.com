"use client";

import { authAPI } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            <div className="bg-card border rounded-xl shadow-sm p-6 max-w-md">
                <h3 className="font-semibold text-lg mb-4">Account</h3>

                <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Logged in as Admin</p>
                        <p className="text-xs text-muted-foreground">admin@studyium.app</p>
                    </div>

                    <button
                        onClick={async () => {
                            await authAPI.logout();
                            window.location.href = '/login';
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
