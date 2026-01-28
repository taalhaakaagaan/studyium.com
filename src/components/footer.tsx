"use client";

import { Instagram, Youtube, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Producer Info */}
                <div className="text-center md:text-left">
                    <p className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        by fathertkt
                    </p>
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Studyium. Tüm hakları saklıdır.
                    </p>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-6">
                    <Link
                        href="https://www.instagram.com/fathertkt"
                        target="_blank"
                        className="text-muted-foreground hover:text-pink-500 transition-colors transform hover:scale-110"
                    >
                        <Instagram className="h-6 w-6" />
                        <span className="sr-only">Instagram</span>
                    </Link>

                    <Link
                        href="https://www.youtube.com/@fathertkt"
                        target="_blank"
                        className="text-muted-foreground hover:text-red-600 transition-colors transform hover:scale-110"
                    >
                        <Youtube className="h-6 w-6" />
                        <span className="sr-only">YouTube</span>
                    </Link>

                    <Link
                        href="https://www.tiktok.com/@fathertkt"
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110"
                    >
                        {/* Custom TikTok SVG as Lucide might not have it in this version */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-6 w-6"
                        >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                        <span className="sr-only">TikTok</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
