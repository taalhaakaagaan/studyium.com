"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
    id: string; // unique ID for the cart item (e.g. timestamp)
    tutor_id: number;
    tutor_name: string;
    student_id: number;
    booking_date?: string;
    note?: string;
    price: number;
    lesson_id: number;
    lesson_name: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalPrice: number;
    discountedPrice: number;
    discountRate: number; // 0, 0.15, 0.20, 0.25
    savings: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Helper to get current user ID
    const getCurrentUserId = () => {
        if (typeof window === 'undefined') return null;
        try {
            const u = localStorage.getItem("studyium_user");
            if (u) return JSON.parse(u).id;
        } catch (e) { }
        return null; // Guest
    };

    // Use sessionStorage instead of localStorage for ephemeral cart
    const storage = typeof window !== 'undefined' ? window.sessionStorage : null;

    const loadCart = () => {
        const uid = getCurrentUserId();
        setUserId(uid);
        // Clear cart on session start implies we might not even want to load per user if we want it *totally* fresh.
        // But user said "Cart is unique to users" but "zeroed when logging in".
        // This likely means: If I login, start with 0. If I reload page, keep it involved.
        // So sessionStorage is perfect. It clears on tab close. 
        // But if I logout and login, I want empty.

        // We will use a key: `studyium_cart_${uid || 'guest'}` in sessionStorage.
        const key = `studyium_cart_${uid || 'guest'}`;
        const stored = storage?.getItem(key);

        if (stored) {
            try { setItems(JSON.parse(stored)); } catch (e) { setItems([]); }
        } else {
            setItems([]);
        }
    };

    useEffect(() => {
        loadCart();
        const handleSessionChange = () => {
            // If we just logged in/out, we should probably clear the current in-memory items 
            // before loading new ones to avoid flashing.
            setItems([]);
            setTimeout(loadCart, 50);
        };
        window.addEventListener('user-session-change', handleSessionChange);
        window.addEventListener('storage', handleSessionChange);
        return () => {
            window.removeEventListener('user-session-change', handleSessionChange);
            window.removeEventListener('storage', handleSessionChange);
        };
    }, []);

    useEffect(() => {
        const uid = getCurrentUserId();
        const key = `studyium_cart_${uid || 'guest'}`;
        storage?.setItem(key, JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, "id">) => {
        // Duplicate Check
        const isDuplicate = items.some(item =>
            item.tutor_id === newItem.tutor_id &&
            item.lesson_id === newItem.lesson_id
        );

        if (isDuplicate) {
            alert("Bu dersi zaten sepete eklediniz.");
            return;
        }

        const item: CartItem = { ...newItem, id: Date.now().toString() + Math.random().toString().slice(2) };
        setItems(prev => [...prev, item]);
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    // Discount Logic
    // 3 items => 15%
    // 4 items => 20%
    // 5+ items => 25%
    const count = items.length;
    let discountRate = 0;
    if (count >= 5) discountRate = 0.25;
    else if (count === 4) discountRate = 0.20;
    else if (count === 3) discountRate = 0.15;

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const savings = totalPrice * discountRate;
    const discountedPrice = totalPrice - savings;

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            clearCart,
            totalPrice,
            discountedPrice,
            discountRate,
            savings
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
