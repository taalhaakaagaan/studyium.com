"use client";

import { useState } from "react";
import { CartDrawer, CartFloatingButton } from "@/components/cart-drawer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <>
            <main className="flex-1">
                {children}
            </main>
            <CartFloatingButton onClick={() => setCartOpen(true)} />
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
