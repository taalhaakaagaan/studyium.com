'use client';

import { Download, Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
                    Download Studyium App
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Experience the full power of Studyium on your desktop. Faster, focused, and feature-rich.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    {/* Windows */}
                    <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Monitor className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">For Windows</h2>
                        <p className="text-muted-foreground mb-6">Type: .exe (Installer)</p>
                        <a
                            href="/downloads/Studyium-Setup.exe"
                            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-medium transition-colors w-full"
                        >
                            <Download className="h-5 w-5" />
                            Download for Windows
                        </a>
                    </div>

                    {/* Linux */}
                    <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Monitor className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">For Linux</h2>
                        <p className="text-muted-foreground mb-6">Type: .AppImage</p>
                        <button
                            disabled
                            className="inline-flex items-center justify-center gap-2 bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed px-8 py-3 rounded-full font-medium transition-colors w-full"
                        >
                            <Download className="h-5 w-5" />
                            Coming Soon
                        </button>
                    </div>

                    {/* Mac */}
                    <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Monitor className="h-8 w-8 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">For Mac</h2>
                        <p className="text-muted-foreground mb-6">Type: .dmg (M1/Intel)</p>
                        <button
                            disabled
                            className="inline-flex items-center justify-center gap-2 bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed px-8 py-3 rounded-full font-medium transition-colors w-full"
                        >
                            <Download className="h-5 w-5" />
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
