"use client";

import { useState, useEffect } from "react";
import { Upload, Save, Trash2 } from "lucide-react";

export default function AdminAdsPage() {
    const [currentAd, setCurrentAd] = useState<string | null>(null);
    const [adLink, setAdLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch("/api/get_settings.php")
            .then(res => res.json())
            .then(data => {
                if (data.ad_image_url) setCurrentAd(data.ad_image_url);
                if (data.ad_link_url) setAdLink(data.ad_link_url);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            await fetch("/api/admin/update_settings.php", {
                method: "POST",
                body: formData
            });
            alert("Reklam ayarları güncellendi!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm("Reklamı kaldırmak istediğinize emin misiniz?")) return;

        const formData = new FormData();
        formData.append("remove_ad", "true");

        await fetch("/api/admin/update_settings.php", {
            method: "POST",
            body: formData
        });
        setCurrentAd(null);
        alert("Reklam kaldırıldı.");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Reklam Yönetimi</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Preview */}
                <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                    <h2 className="mb-4 text-lg font-semibold">Mevcut Reklam</h2>
                    <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black/40 border border-white/5">
                        {currentAd ? (
                            <img src={currentAd} alt="Current Ad" className="h-full w-full object-contain" />
                        ) : (
                            <span className="text-muted-foreground">Aktif reklam yok (Boş Alan Gösteriliyor)</span>
                        )}
                    </div>
                    {currentAd && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-red-500 hover:bg-red-500/20"
                            >
                                <Trash2 className="h-4 w-4" /> Reklamı Kaldır
                            </button>
                        </div>
                    )}
                </div>

                {/* Upload Form */}
                <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                    <h2 className="mb-4 text-lg font-semibold">Reklam Güncelle</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reklam Görseli</label>
                            <input
                                type="file"
                                name="ad_image"
                                accept="image/*"
                                className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary file:text-primary-foreground
                                  hover:file:bg-primary/90"
                            />
                            <p className="text-xs text-muted-foreground">Önerilen Boyut: 500x700px veya benzer dikey format.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hedef URL</label>
                            <input
                                type="url"
                                name="ad_link"
                                value={adLink}
                                onChange={(e) => setAdLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-md border border-white/10 bg-black/20 p-2 focus:border-primary focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isLoading ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
