"use client";

import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";
import { ChevronLeft, Power } from "lucide-react";

export function WindowControls() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const handleQuit = async () => {
        await authAPI.quitApp();
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card mb-6">
            <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Go Back"
            >
                <div className="p-2 rounded-full bg-muted/50 hover:bg-muted">
                    <ChevronLeft className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Back</span>
            </button>

            <button
                onClick={handleQuit}
                className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
                title="Close Application"
            >
                <span className="text-sm font-medium">Close App</span>
                <div className="p-2 rounded-full bg-red-100 hover:bg-red-200">
                    <Power className="h-5 w-5" />
                </div>
            </button>
        </div>
    );
}
