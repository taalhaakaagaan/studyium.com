"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-background z-50 rounded-t-3xl border-t border-border shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ maxHeight: "85vh" }}
            >
                <div className="flex flex-col h-full max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="text-xl font-bold">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-4 flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
