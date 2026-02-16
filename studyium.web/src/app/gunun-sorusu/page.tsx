"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Trophy, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type QuestionData = {
    id: number;
    question_date: string;
    pdf_url: string;
};

type UserStatus = {
    given_answer: string;
    is_correct: number;
    answered_at: string;
} | null;

type LeaderboardEntry = {
    name: string;
    surname: string;
    answered_at: string;
};

export default function DailyQuestionPage() {
    const { user } = useAuth();
    const isAuthenticated = !!user;
    const router = useRouter();

    const [question, setQuestion] = useState<QuestionData | null>(null);
    const [userStatus, setUserStatus] = useState<UserStatus>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        // If not authenticated, we could redirect, but let's show a "Login Required" screen instead for better UX
        // We need to wait for user load check? useAuth has loading state.
        // But user is null initially. 
        // Let's rely on useAuth loading if exposed, but for now checking user triggers effect.
    }, [isAuthenticated, user?.id]);

    // Add effect to fetch data when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchData();
        } else {
            // If not authenticated, stop loading if we were assuming auth would happen.
            // Actually, useAuth has a loading state. I should import it.
            // But existing code didn't import loading from useAuth.
            // Let's just handle loading locally.
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);


    const fetchData = async () => {
        try {
            setLoading(true);
            // Pass user_id to check if they answered
            const userIdParam = user?.id ? `?user_id=${user.id}` : "";
            const res = await fetch(`/api/daily_question.php${userIdParam}`);
            const data = await res.json();

            if (data.status === 'success') {
                setQuestion(data.question);
                setUserStatus(data.user_status);
                setLeaderboard(data.leaderboard);
            } else if (data.status === 'no_question') {
                setError("Bugün için bir soru bulunamadı.");
            }
        } catch (err) {
            console.error(err);
            setError("Veriler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedOption || !question || !user?.id) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/daily_question.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    question_id: question.id,
                    answer: selectedOption
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                // Refresh data to show result and leaderboard
                await fetchData();
                if (data.is_correct) {
                    setSuccessMsg("Tebrikler! Doğru cevap.");
                } else {
                    setError(`Yanlış cevap. Doğru cevap: ${data.correct_answer}`);
                }
            } else {
                setError(data.message || "Bir hata oluştu.");
            }
        } catch (err) {
            setError("Bağlantı hatası.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-card border border-border p-8 rounded-3xl max-w-md text-center shadow-2xl">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                            <AlertCircle size={32} />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Giriş Yapmalısınız</h1>
                        <p className="text-muted-foreground mb-8">
                            Günün sorusunu çözmek ve sıralamaya girmek için lütfen giriş yapın.
                        </p>
                        <Link href="/login" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform inline-block">
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading && !question && !error) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="container mx-auto px-4 py-8 flex-1">
                <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">

                    {/* Left: Question Area */}
                    <div className="flex-1 bg-card border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="text-primary" /> Günün Sorusu ({question?.question_date})
                            </h1>
                            <div className="text-sm text-yellow-500 font-medium animate-pulse">
                                Kapanış: 00:00
                            </div>
                        </div>

                        {error && !question ? (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                {error}
                            </div>
                        ) : (
                            <div className="flex-1 bg-black/20 relative">
                                {/* PDF Viewer - Using Object or Iframe */}
                                {question?.pdf_url ? (
                                    <iframe
                                        src={`${question.pdf_url}#toolbar=0`}
                                        className="w-full h-full min-h-[500px]"
                                        title="Daily Question"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">PDF Yüklenemedi</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Answer & Leaderboard */}
                    <div className="w-full md:w-[400px] flex flex-col gap-6">

                        {/* Answer Card */}
                        <div className="bg-card border border-white/10 rounded-3xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold mb-6">Cevabınız</h2>

                            {userStatus ? (
                                <div className={`p-6 rounded-2xl border flex flex-col items-center gap-4 text-center ${userStatus.is_correct ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                    {userStatus.is_correct ? <CheckCircle size={48} /> : <XCircle size={48} />}
                                    <div>
                                        <div className="text-xl font-bold">{userStatus.is_correct ? 'DOĞRU!' : 'YANLIŞ'}</div>
                                        <div className="text-sm opacity-80 mt-1">Verdiğiniz Cevap: <span className="font-bold">{userStatus.given_answer}</span></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {error && <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg mb-4">{error}</div>}
                                    <div className="grid grid-cols-5 gap-2 mb-6">
                                        {['A', 'B', 'C', 'D', 'E'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setSelectedOption(opt)}
                                                className={`aspect-square rounded-xl font-bold text-lg transition-all border-2 ${selectedOption === opt
                                                    ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-lg shadow-primary/25'
                                                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selectedOption || submitting}
                                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                                        {submitting ? 'Gönderiliyor...' : 'Cevabı Onayla'}
                                    </button>
                                    <p className="text-xs text-center mt-4 text-muted-foreground">Dikkat: Cevabınızı sadece 1 kez gönderebilirsiniz.</p>
                                </>
                            )}
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-card border border-white/10 rounded-3xl p-6 shadow-xl flex-1">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-secondary" /> En Hızlılar
                            </h2>
                            <div className="space-y-3">
                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm">Henüz kimse doğru cevaplamadı. <br />İlk sen ol!</div>
                                ) : (
                                    leaderboard.map((entry, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="font-medium text-sm">
                                                    {entry.name} {entry.surname?.[0]}.
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono">
                                                {new Date(entry.answered_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
