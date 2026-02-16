"use client";

import { useCart } from "@/context/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { X, Trash2, ShoppingCart, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { items, removeFromCart, clearCart, totalPrice, discountedPrice, discountRate, savings } = useCart();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // Apply discount to each item
            const bookingsPayload = items.map(item => ({
                ...item,
                price: parseFloat((item.price * (1 - discountRate)).toFixed(2))
            }));

            const res = await fetch('/api/batch_book.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookings: bookingsPayload })
            });
            const result = await res.json();

            if (result.success) {
                alert(result.message);
                clearCart();
                onClose();
                // Optionally redirect to profile/appointments
                router.push('/profile?tab=appointments');
            } else {
                alert("Hata: " + (result.message || "Bilinmeyen hata"));
            }
        } catch (e) {
            console.error(e);
            alert("Bağlantı hatası oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" /> Sepetim
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-20">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Sepetiniz boş.</p>
                            <button onClick={onClose} className="mt-4 text-primary font-bold hover:underline">Derslere Göz At</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="bg-card border border-border p-4 rounded-xl flex justify-between gap-3 group relative">
                                <div>
                                    <h3 className="font-bold">{item.tutor_name}</h3>
                                    <div className="text-sm text-primary font-medium">{item.lesson_name}</div>
                                    {item.booking_date && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(item.booking_date).toLocaleString('tr-TR')}
                                        </div>
                                    )}
                                    {item.note && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">"{item.note}"</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{item.price} TL</div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 p-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Sil"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 bg-muted/20 border-t border-border space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Ara Toplam</span>
                            <span>{totalPrice.toFixed(2)} TL</span>
                        </div>
                        {discountRate > 0 && (
                            <div className="flex justify-between text-sm text-green-500 font-bold">
                                <span>İndirim (%{discountRate * 100})</span>
                                <span>-{savings.toFixed(2)} TL</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                            <span>Toplam</span>
                            <span>{discountedPrice.toFixed(2)} TL</span>
                        </div>

                        {discountRate < 0.25 && (
                            <div className="text-xs text-center text-muted-foreground bg-primary/10 p-2 rounded">
                                %25 indirim için {5 - items.length} ders daha ekleyin!
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'İşleniyor...' : 'Randevu Al & Onayla'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function CartFloatingButton({ onClick }: { onClick: () => void }) {
    const { items } = useCart();
    const { user, loading } = useAuth();

    // Only show for verified students
    if (loading || !user || user.role !== 'user' || !user.is_verified) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center animate-in zoom-in duration-300"
        >
            <ShoppingCart className="h-6 w-6" />
            {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-background">
                    {items.length}
                </span>
            )}
        </button>
    );
}
