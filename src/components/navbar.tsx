"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "@/components/mode-toggle";
import { User, LogOut, Menu, Download } from "lucide-react";
import { useState } from "react";

export function Navbar({ transparent = false }: { transparent?: boolean }) {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${transparent ? 'bg-transparent backdrop-blur-none border-none' : 'bg-background/80 backdrop-blur-md border-b border-border'}`}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Studyium
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/tutors" className="text-sm font-medium hover:text-primary transition-colors">Özel Ders</Link>
                    <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">Özellikler</Link>
                    <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">Blog</Link>
                    <Link href="/download" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                        <Download className="w-4 h-4" /> App
                    </Link>
                </nav>

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <ModeToggle />

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href={user.role === 'admin' ? '/admin' : '/profile'} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium">
                                <User className="h-4 w-4" />
                                <span>{user.name}</span>
                            </Link>
                            <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Çıkış Yap">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Giriş Yap</Link>
                            <Link href="/register" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                                Kayıt Ol
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <ModeToggle />
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-foreground">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 shadow-xl animate-in slide-in-from-top-4">
                    <nav className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 border-b border-border/50 pb-4">
                            <Link href="/tutors" className="flex items-center justify-between text-base font-medium p-3 hover:bg-muted/50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                <span>Özel Ders</span>
                            </Link>
                            <Link href="/features" className="flex items-center justify-between text-base font-medium p-3 hover:bg-muted/50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                <span>Özellikler</span>
                            </Link>
                            <Link href="/blog" className="flex items-center justify-between text-base font-medium p-3 hover:bg-muted/50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                <span>Blog</span>
                            </Link>
                            <Link href="/download" className="flex items-center justify-between text-base font-medium p-3 hover:bg-muted/50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                <span className="flex items-center gap-2"><Download className="w-4 h-4" /> App İndir</span>
                            </Link>
                        </div>

                        {user ? (
                            <div className="flex flex-col gap-3 pt-2">
                                <Link href="/profile" className="flex items-center gap-3 text-base font-medium p-3 hover:bg-muted/50 rounded-lg text-primary bg-primary/5" onClick={() => setMobileMenuOpen(false)}>
                                    <User className="h-5 w-5" />
                                    <span>Profilim ({user.name})</span>
                                </Link>
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 text-base font-medium p-3 hover:bg-destructive/10 rounded-lg text-destructive w-full text-left">
                                    <LogOut className="h-5 w-5" />
                                    <span>Çıkış Yap</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link href="/login" className="flex items-center justify-center text-sm font-medium p-3 border border-border rounded-lg hover:bg-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                    Giriş Yap
                                </Link>
                                <Link href="/register" className="flex items-center justify-center text-sm font-medium p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20" onClick={() => setMobileMenuOpen(false)}>
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
