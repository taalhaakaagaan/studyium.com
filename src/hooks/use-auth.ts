"use client";

import { useEffect, useState } from "react";

type User = {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    is_verified: boolean;
};

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const stored = localStorage.getItem("studyium_user");
            if (stored) {
                setUser(JSON.parse(stored));
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();

        // Listen for login/logout events
        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    const logout = () => {
        localStorage.removeItem("studyium_user");
        window.dispatchEvent(new Event('auth-change'));
        window.dispatchEvent(new Event('user-session-change'));
        window.location.href = "/";
    };

    return { user, loading, logout };
}
