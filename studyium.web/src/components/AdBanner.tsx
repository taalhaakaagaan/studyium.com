"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Settings = {
    ad_image_url?: string;
    ad_link_url?: string;
};

export default function AdBanner() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        fetch("/api/get_settings.php")
            .then((res) => res.json())
            .then((data) => setSettings(data))
            .catch((err) => console.error("Ad loading error", err));
    }, []);

    if (!settings) return null;

    const hasAd = settings.ad_image_url && settings.ad_image_url.trim() !== "";

    return (
        <div className="w-full bg-black/5 py-8 mt-12 mb-8 flex justify-center items-center">
            <div className="container mx-auto max-w-4xl px-4 flex flex-col items-center">
                {hasAd ? (
                    <a
                        href={settings.ad_link_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative transition-transform hover:scale-[1.01]"
                    >
                        {/* Ideally verify dimensions, but for now using style to constrain max width/height while keeping aspect ratio */}
                        <img
                            src={settings.ad_image_url}
                            alt="Reklam"
                            className="max-w-full h-auto rounded-lg shadow-lg border border-white/10"
                            style={{ maxHeight: "700px" }}
                        />
                    </a>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 dark:bg-black/20 text-muted-foreground">
                        <span className="text-xl font-semibold">Boş Reklam Alanı</span>
                        <span className="text-sm mt-2">Buraya reklam verebilirsiniz</span>
                    </div>
                )}
            </div>
        </div>
    );
}
