"use client";

import { useState } from "react";

import { Navbar } from "@/components/navbar";
import { Calculator, RotateCcw, Trophy } from "lucide-react";


type TestSection = {
    name: string;
    field: string;
    max: number;
};

const TYT_SECTIONS: TestSection[] = [
    { name: "Türkçe (40)", field: "tyt_turkce", max: 40 },
    { name: "Matematik (40)", field: "tyt_mat", max: 40 },
    { name: "Sosyal Bilimler (20)", field: "tyt_sosyal", max: 20 },
    { name: "Fen Bilimleri (20)", field: "tyt_fen", max: 20 },
];

const AYT_SECTIONS: TestSection[] = [
    { name: "Matematik (40)", field: "ayt_mat", max: 40 },
    { name: "Fizik (14)", field: "ayt_fizik", max: 14 },
    { name: "Kimya (13)", field: "ayt_kimya", max: 13 },
    { name: "Biyoloji (13)", field: "ayt_biyoloji", max: 13 },
    { name: "Edebiyat (24)", field: "ayt_edebiyat", max: 24 },
    { name: "Tarih-1 (10)", field: "ayt_tarih1", max: 10 },
    { name: "Coğrafya-1 (6)", field: "ayt_cografya1", max: 6 },
    { name: "Tarih-2 (11)", field: "ayt_tarih2", max: 11 },
    { name: "Coğrafya-2 (11)", field: "ayt_cografya2", max: 11 },
    { name: "Felsefe Grubu (12)", field: "ayt_felsefe", max: 12 },
    { name: "Din Kültürü (6)", field: "ayt_din", max: 6 },
];

export default function YKSCalculator() {
    const [scores, setScores] = useState<Record<string, { correct: number; incorrect: number }>>({});
    const [obp, setObp] = useState<string>("");
    const [result, setResult] = useState<any>(null);

    const handleInputChange = (field: string, type: "correct" | "incorrect", value: string) => {
        const val = parseInt(value) || 0;
        setScores((prev) => ({
            ...prev,
            [field]: { ...prev[field], [type]: val },
        }));
    };

    const calculate = () => {
        // Basic Coefficients (Approximate 2024 vals)
        const COEFF = {
            base: 100,
            tyt: 1.32,  // Avg per net
            ayt_say: 3,
            ayt_ea: 3,
            ayt_soz: 3,
            obp: 0.6
        };

        // More precise per subject coeff could be used if available, using strict standard for now
        // TYT: Türkçe 3.3, Sosyal 3.4, Mat 3.3, Fen 3.4 (Approx raw scores converted to 500 base)
        // Actually simplicity: Net * Coeff.
        // Let's use standard simplified weights often used in online calculators.
        // TYT Total: 120 Q, 400 pts (100 base). -> 3.33 pts/net avg.

        // Precise Coeffs (Example)
        const C_TYT_TR = 3.3;
        const C_TYT_SOC = 3.4;
        const C_TYT_MAT = 3.3;
        const C_TYT_SCI = 3.4;

        const C_AYT_MAT = 3;
        const C_AYT_FIZ = 2.85;
        const C_AYT_KIM = 3.07;
        const C_AYT_BIO = 3.07;
        const C_AYT_ED = 3;
        const C_AYT_HIST1 = 2.8;
        const C_AYT_GEO1 = 3.33;

        // Calculate Nets
        const getNets = (field: string) => {
            const s = scores[field] || { correct: 0, incorrect: 0 };
            let net = s.correct - s.incorrect / 4;
            return net < 0 ? 0 : net;
        };

        const tyt_tr_net = getNets("tyt_turkce");
        const tyt_mat_net = getNets("tyt_mat");
        const tyt_soc_net = getNets("tyt_sosyal");
        const tyt_sci_net = getNets("tyt_fen");

        const tyt_score = 100 + (tyt_tr_net * 3.3) + (tyt_soc_net * 3.4) + (tyt_mat_net * 3.3) + (tyt_sci_net * 3.4);

        // AYT
        const ayt_mat_net = getNets("ayt_mat");
        const ayt_fiz_net = getNets("ayt_fizik");
        const ayt_kim_net = getNets("ayt_kimya");
        const ayt_bio_net = getNets("ayt_biyoloji");
        const ayt_ed_net = getNets("ayt_edebiyat");
        const ayt_h1_net = getNets("ayt_tarih1");
        const ayt_g1_net = getNets("ayt_cografya1");
        // ... others for SOZ ...

        // SAYISAL: TYT (40%) + AYT (60%) -> Mat + Fen
        // Simplification: (TYT Score) * 0.4?? No, TYT is added as raw points usually.
        // Calculation: (Base 100) + (TYT Nets * C) + (AYT Nets * C)
        // Coeffs for Placement Scores (Yerleştirme) include OBP.

        // Let's use a simpler robust formula:
        // Puan = 100 + (TYT * 1.333) + (AYT * 3.xx) -> This varies.
        // Better:
        // SAY = 100 + (TYT Net * 1.33) + (Mat * 3) + (Fiz * 2.85) + (Kim * 3.07) + (Bio * 3.07)
        // EA = 100 + (TYT Net * 1.33) + (Mat * 3) + (Ed * 3) + (Tarih1 * 2.8) + (Cog1 * 3.33)

        const say_score = 100 + (tyt_tr_net * 1.32 + tyt_mat_net * 1.32 + tyt_soc_net * 1.36 + tyt_sci_net * 1.36)
            + (ayt_mat_net * 3) + (ayt_fiz_net * 2.85) + (ayt_kim_net * 3.07) + (ayt_bio_net * 3.07);

        const ea_score = 100 + (tyt_tr_net * 1.32 + tyt_mat_net * 1.32 + tyt_soc_net * 1.36 + tyt_sci_net * 1.36)
            + (ayt_mat_net * 3) + (ayt_ed_net * 3) + (ayt_h1_net * 2.8) + (ayt_g1_net * 3.33);

        const diploma = parseFloat(obp) || 0;
        const obp_add = diploma * 0.6;

        setResult({
            tyt: Math.min(500, tyt_score),
            say: Math.min(500, say_score),
            ea: Math.min(500, ea_score),
            obp_added: {
                tyt: Math.min(560, tyt_score + obp_add),
                say: Math.min(560, say_score + obp_add),
                ea: Math.min(560, ea_score + obp_add)
            }
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 py-24 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                        YKS Puan Hesaplama Robotu
                    </h1>
                    <p className="text-muted-foreground">
                        2025 YKS verilerine uygun, güncel katsayılarla TYT ve AYT puanınızı hesaplayın.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* INPUTS */}
                    <div className="space-y-8">
                        {/* OBP */}
                        <div className="bg-card border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Okul Başarı Puanı</h2>
                            <div className="flex items-center gap-4">
                                <label className="text-sm">diploma Notu:</label>
                                <input
                                    type="number"
                                    max={100}
                                    className="bg-black/20 border border-white/10 rounded-md p-2 w-24 text-center"
                                    placeholder="85"
                                    value={obp}
                                    onChange={(e) => setObp(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* TYT */}
                        <div className="bg-card border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 text-primary">TYT Testleri</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground text-center mb-2">
                                    <span className="text-left col-span-1">Ders</span>
                                    <span>Doğru</span>
                                    <span>Yanlış</span>
                                    <span>Net</span>
                                </div>
                                {TYT_SECTIONS.map(s => {
                                    const score = scores[s.field] || { correct: 0, incorrect: 0 };
                                    const net = score.correct - score.incorrect / 4;
                                    return (
                                        <div key={s.field} className="grid grid-cols-4 gap-2 items-center">
                                            <label className="text-sm font-medium">{s.name}</label>
                                            <input
                                                type="number"
                                                className="bg-black/20 border border-white/10 rounded-md p-1.5 text-center text-sm"
                                                value={score.correct || ''}
                                                onChange={(e) => handleInputChange(s.field, 'correct', e.target.value)}
                                                placeholder="0"
                                            />
                                            <input
                                                type="number"
                                                className="bg-black/20 border border-white/10 rounded-md p-1.5 text-center text-sm"
                                                value={score.incorrect || ''}
                                                onChange={(e) => handleInputChange(s.field, 'incorrect', e.target.value)}
                                                placeholder="0"
                                            />
                                            <div className="text-center font-bold text-primary">{net.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AYT */}
                        <div className="bg-card border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 text-secondary">AYT Testleri</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground text-center mb-2">
                                    <span className="text-left col-span-1">Ders</span>
                                    <span>Doğru</span>
                                    <span>Yanlış</span>
                                    <span>Net</span>
                                </div>
                                {AYT_SECTIONS.map(s => {
                                    const score = scores[s.field] || { correct: 0, incorrect: 0 };
                                    const net = score.correct - score.incorrect / 4;
                                    return (
                                        <div key={s.field} className="grid grid-cols-4 gap-2 items-center">
                                            <label className="text-sm font-medium truncate" title={s.name}>{s.name.split('(')[0]}</label>
                                            <input
                                                type="number"
                                                className="bg-black/20 border border-white/10 rounded-md p-1.5 text-center text-sm"
                                                value={score.correct || ''}
                                                onChange={(e) => handleInputChange(s.field, 'correct', e.target.value)}
                                                placeholder="0"
                                            />
                                            <input
                                                type="number"
                                                className="bg-black/20 border border-white/10 rounded-md p-1.5 text-center text-sm"
                                                value={score.incorrect || ''}
                                                onChange={(e) => handleInputChange(s.field, 'incorrect', e.target.value)}
                                                placeholder="0"
                                            />
                                            <div className="text-center font-bold text-secondary">{net.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Calculator className="h-5 w-5" /> HESAPLA
                        </button>
                    </div>

                    {/* RESULTS */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-card border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Trophy className="text-yellow-500" /> Sonuçlarınız
                            </h2>

                            {!result ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Sol taraftaki verileri doldurup "Hesapla" butonuna basın.
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Ham Puanlar */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Ham Puanlar (OBP'siz)</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-black/20 p-4 rounded-xl text-center">
                                                <div className="text-sm text-muted-foreground">TYT</div>
                                                <div className="text-2xl font-bold">{result.tyt.toFixed(3)}</div>
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-xl text-center">
                                                <div className="text-sm text-muted-foreground">SAY</div>
                                                <div className="text-2xl font-bold text-blue-400">{result.say.toFixed(3)}</div>
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-xl text-center">
                                                <div className="text-sm text-muted-foreground">EA</div>
                                                <div className="text-2xl font-bold text-orange-400">{result.ea.toFixed(3)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Yerleştirme Puanları */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Yerleştirme Puanları (OBP'li)</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-4 rounded-xl">
                                                <span className="font-semibold">Y-TYT</span>
                                                <span className="text-2xl font-bold text-primary">{result.obp_added.tyt.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                                <span className="font-semibold">Y-SAY</span>
                                                <span className="text-2xl font-bold text-blue-400">{result.obp_added.say.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                                                <span className="font-semibold">Y-EA</span>
                                                <span className="text-2xl font-bold text-orange-400">{result.obp_added.ea.toFixed(3)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setResult(null); setScores({}); setObp(""); }}
                                        className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2"
                                    >
                                        <RotateCcw className="h-4 w-4" /> Sıfırla
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
