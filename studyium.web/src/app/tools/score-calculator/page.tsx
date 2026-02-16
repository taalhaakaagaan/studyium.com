'use client';

import { useState, useEffect } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';

type SectionScore = {
    correct: number;
    incorrect: number;
    net: number;
};

// Coefficients (approximate 2024-2025 values)
const COEFFS = {
    tyt: {
        turkish: 3.3,
        math: 3.3,
        social: 3.4,
        science: 3.4
    },
    ayt: {
        math: 3.0,
        physics: 2.85,
        chem: 3.07,
        bio: 3.07,
        literature: 3.0,
        history1: 2.8,
        geography1: 3.33,
        history2: 2.91,
        geography2: 2.91,
        philosophy: 3.0,
        religion: 3.33,
    },
    base: 100
};

export default function ScoreCalculatorPage() {
    const [obp, setObp] = useState<number>(0);

    // TYT Sections
    const [tyt, setTyt] = useState({
        turkish: { c: 0, i: 0 },
        math: { c: 0, i: 0 },
        social: { c: 0, i: 0 },
        science: { c: 0, i: 0 }
    });

    // AYT Sections
    const [ayt, setAyt] = useState({
        math: { c: 0, i: 0 },
        physics: { c: 0, i: 0 },
        chem: { c: 0, i: 0 },
        bio: { c: 0, i: 0 },
        literature: { c: 0, i: 0 },
        history1: { c: 0, i: 0 },
        geography1: { c: 0, i: 0 },
        history2: { c: 0, i: 0 },
        geography2: { c: 0, i: 0 },
        philosophy: { c: 0, i: 0 },
        religion: { c: 0, i: 0 },
    });

    const [results, setResults] = useState({
        tytRaw: 0,
        tytPlacement: 0,
        sayRaw: 0,
        sayPlacement: 0,
        eaRaw: 0,
        eaPlacement: 0,
        sozRaw: 0,
        sozPlacement: 0
    });

    const calculateNet = (correct: number, incorrect: number) => {
        return Math.max(0, correct - (incorrect / 4));
    };

    useEffect(() => {
        // 1. Calculate TYT Score
        const netTytTurkish = calculateNet(tyt.turkish.c, tyt.turkish.i);
        const netTytMath = calculateNet(tyt.math.c, tyt.math.i);
        const netTytSocial = calculateNet(tyt.social.c, tyt.social.i);
        const netTytScience = calculateNet(tyt.science.c, tyt.science.i);

        const scoreTyt = 100 + (netTytTurkish * 3.3) + (netTytMath * 3.3) + (netTytSocial * 3.4) + (netTytScience * 3.4);

        // 2. Calculate AYT Scores (SAY, EA, SOZ)
        const netAytMath = calculateNet(ayt.math.c, ayt.math.i);
        const netAytPhy = calculateNet(ayt.physics.c, ayt.physics.i);
        const netAytChem = calculateNet(ayt.chem.c, ayt.chem.i);
        const netAytBio = calculateNet(ayt.bio.c, ayt.bio.i);

        const netAytLit = calculateNet(ayt.literature.c, ayt.literature.i);
        const netAytHist1 = calculateNet(ayt.history1.c, ayt.history1.i);
        const netAytGeo1 = calculateNet(ayt.geography1.c, ayt.geography1.i);

        const netAytHist2 = calculateNet(ayt.history2.c, ayt.history2.i);
        const netAytGeo2 = calculateNet(ayt.geography2.c, ayt.geography2.i);
        const netAytPhil = calculateNet(ayt.philosophy.c, ayt.philosophy.i);
        const netAytRel = calculateNet(ayt.religion.c, ayt.religion.i);

        // Readjusted Logic
        const tytNetTotal = netTytTurkish + netTytMath + netTytSocial + netTytScience;

        const sayPointsCalc = (netAytMath * 3) + (netAytPhy * 2.85) + (netAytChem * 3.07) + (netAytBio * 3.07);
        const eaPoints = (netAytMath * 3) + (netAytLit * 3) + (netAytHist1 * 2.8) + (netAytGeo1 * 3.33);
        const sozPoints = (netAytLit * 3) + (netAytHist1 * 2.8) + (netAytGeo1 * 3.33) + (netAytHist2 * 2.91) + (netAytGeo2 * 2.91) + (netAytPhil * 3) + (netAytRel * 3.33);

        const finalSay = 100 + (tytNetTotal * 1.33) + sayPointsCalc;
        const finalEa = 100 + (tytNetTotal * 1.33) + eaPoints;
        const finalSoz = 100 + (tytNetTotal * 1.33) + sozPoints;

        setResults({
            tytRaw: scoreTyt,
            tytPlacement: scoreTyt + (obp * 0.6),
            sayRaw: finalSay,
            sayPlacement: finalSay + (obp * 0.6),
            eaRaw: finalEa,
            eaPlacement: finalEa + (obp * 0.6),
            sozRaw: finalSoz,
            sozPlacement: finalSoz + (obp * 0.6)
        });

    }, [tyt, ayt, obp]);

    const handleTytChange = (field: keyof typeof tyt, type: 'c' | 'i', val: number) => {
        setTyt(prev => ({ ...prev, [field]: { ...prev[field], [type]: val } }));
    };
    const handleAytChange = (field: keyof typeof ayt, type: 'c' | 'i', val: number) => {
        setAyt(prev => ({ ...prev, [field]: { ...prev[field], [type]: val } }));
    };

    const InputGroup = ({ label, group, field, max }: { label: string, group: any, field: string, max: number }) => (
        <div className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium w-24">{label}</span>
            <div className="flex items-center gap-1">
                <input
                    type="number" min="0" max={max} placeholder="D"
                    className="w-12 p-1 text-center border rounded bg-background text-sm"
                    value={group[field]?.c || ''}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= max) {
                            if (tyt[field as keyof typeof tyt]) handleTytChange(field as keyof typeof tyt, 'c', val);
                            else handleAytChange(field as keyof typeof ayt, 'c', val);
                        }
                    }}
                />
                <input
                    type="number" min="0" max={max} placeholder="Y"
                    className="w-12 p-1 text-center border rounded bg-background text-sm text-red-500"
                    value={group[field]?.i || ''}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (tyt[field as keyof typeof tyt]) handleTytChange(field as keyof typeof tyt, 'i', val);
                        else handleAytChange(field as keyof typeof ayt, 'i', val);
                    }}
                />
            </div>
        </div>
    );

    const Row = ({ label, state, field, max }: { label: string, state: any, field: string, max: number }) => (
        <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg mb-2 shadow-sm">
            <span className="font-semibold text-sm">{label} <span className="text-muted-foreground text-xs font-normal">({max} Soru)</span></span>
            <div className="flex gap-2">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">Doğru</span>
                    <input type="number" min="0" max={max} className="w-14 p-2 text-center border border-border rounded bg-background font-bold"
                        value={state[field]?.c || ''} onChange={e => (state === tyt ? handleTytChange(field as keyof typeof tyt, 'c', Number(e.target.value)) : handleAytChange(field as keyof typeof ayt, 'c', Number(e.target.value)))} />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">Yanlış</span>
                    <input type="number" min="0" max={max} className="w-14 p-2 text-center border border-border rounded bg-background font-bold text-red-500"
                        value={state[field]?.i || ''} onChange={e => (state === tyt ? handleTytChange(field as keyof typeof tyt, 'i', Number(e.target.value)) : handleAytChange(field as keyof typeof ayt, 'i', Number(e.target.value)))} />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">Net</span>
                    <div className="w-14 p-2 text-center font-bold text-primary">
                        {calculateNet(state[field]?.c || 0, state[field]?.i || 0).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        YKS Puan Hesaplama Robotu
                    </h1>
                    <p className="text-muted-foreground">
                        TYT ve AYT netlerinizi girerek 2024-2025 tahmini puanınızı hesaplayın.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* TYT Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-1 bg-primary rounded-full"></div>
                            <h2 className="text-2xl font-bold">TYT</h2>
                        </div>
                        <Row label="Türkçe" state={tyt} field="turkish" max={40} />
                        <Row label="Matematik" state={tyt} field="math" max={40} />
                        <Row label="Sosyal Bil." state={tyt} field="social" max={20} />
                        <Row label="Fen Bil." state={tyt} field="science" max={20} />

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6">
                            <label className="block text-sm font-bold mb-2">Diploma Puanı (OBP)</label>
                            <input
                                type="number" min="50" max="100"
                                value={obp || ''} onChange={e => setObp(Number(e.target.value))}
                                className="w-full p-3 rounded bg-background border border-border text-lg font-bold"
                                placeholder="Örn: 85"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Diploma notunuzu 100 üzerinden giriniz.</p>
                        </div>
                    </div>

                    {/* AYT Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-1 bg-secondary rounded-full"></div>
                            <h2 className="text-2xl font-bold">AYT</h2>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            <Row label="Matematik" state={ayt} field="math" max={40} />
                            <Row label="Fizik" state={ayt} field="physics" max={14} />
                            <Row label="Kimya" state={ayt} field="chem" max={13} />
                            <Row label="Biyoloji" state={ayt} field="bio" max={13} />
                            <Row label="Edebiyat" state={ayt} field="literature" max={24} />
                            <Row label="Tarih-1" state={ayt} field="history1" max={10} />
                            <Row label="Coğrafya-1" state={ayt} field="geography1" max={6} />
                            <Row label="Tarih-2" state={ayt} field="history2" max={11} />
                            <Row label="Coğrafya-2" state={ayt} field="geography2" max={11} />
                            <Row label="Felsefe Gr." state={ayt} field="philosophy" max={12} />
                            <Row label="Din Kül." state={ayt} field="religion" max={6} />
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:pl-8">
                        <div className="sticky top-24 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                                    <h2 className="text-2xl font-bold">Sonuçlar</h2>
                                </div>
                                <button onClick={() => window.location.reload()} className="p-2 hover:bg-muted rounded-full transition-colors" title="Sıfırla">
                                    <RefreshCw className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6">
                                {/* TYT Result */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">TYT Puanı</h3>
                                        <span className="text-2xl font-black text-primary">{results.tytRaw.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Yerleştirme:</span>
                                        <span className="font-bold text-foreground">{results.tytPlacement.toFixed(2)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(results.tytRaw / 560) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="border-t border-border my-4"></div>

                                {/* SAY Result */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">SAY Puanı</h3>
                                        <span className="text-2xl font-black text-secondary">{results.sayRaw.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Yerleştirme:</span>
                                        <span className="font-bold text-foreground">{results.sayPlacement.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* EA Result */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">EA Puanı</h3>
                                        <span className="text-2xl font-black text-orange-500">{results.eaRaw.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Yerleştirme:</span>
                                        <span className="font-bold text-foreground">{results.eaPlacement.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* SOZ Result */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">SÖZ Puanı</h3>
                                        <span className="text-2xl font-black text-pink-500">{results.sozRaw.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Yerleştirme:</span>
                                        <span className="font-bold text-foreground">{results.sozPlacement.toFixed(2)}</span>
                                    </div>
                                </div>

                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                                <p><strong>Not:</strong> Sonuçlar tahmini olup, ÖSYM verileriyle farklılık gösterebilir. Standart sapma etkisi bu hesaplamaya dahil edilmemiştir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
