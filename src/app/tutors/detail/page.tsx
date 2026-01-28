"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Star, Clock, BookOpen, User, CheckCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface Tutor {
    id: number;
    name: string;
    surname: string;
    subjects: string;
    bio: string;
    hourly_rate: string;
    fake_hourly_rate?: string | null;
    course_details: string;
    rating: number;
    review_count: number;
    topics?: any[];
}

interface Review {
    id: number;
    student_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

function TutorDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const topicParam = searchParams.get("topic");

    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/get_tutor_details.php?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setErrorMsg(data.error);
                } else {
                    const tData = data.tutor || data;
                    if (data.topics) {
                        tData.topics = data.topics;
                    }
                    setTutor(tData);
                    setReviews(data.reviews || []);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setErrorMsg("Veri çekilemedi: " + err.message);
                setLoading(false);
            });
    }, [id]);

    const { addToCart, items } = useCart();

    const handleBook = () => {
        const userStr = localStorage.getItem('studyium_user');
        if (!userStr) {
            alert("Ders eklemek için önce giriş yapmalısınız.");
            window.location.href = '/login';
            return;
        }
        const user = JSON.parse(userStr);

        // Add to Cart Context
        if (!tutor) return;

        // Open a prompt or modal to get date/note? 
        // For detail page, maybe we can just redirect to list page or open a small modal?
        // OR simpler: just add with default date (today) and let them edit in cart?
        // Current requirement: "tıklayıp sepete ekleyecek".
        // The list page had a modal for Date/Note.
        // Let's implement a simple prompt or use a local modal state here too.
        // For now, let's use prompt for note/date or default values to keep it simple, 
        // OR better: Bring the Modal from TutorsPage to here or make it a shared component.
        // Given the time, let's make it add to cart and show alert "Tarih seçmek için sepete gidin" (if we supported editing in cart).
        // BUT CartDrawer doesn't support editing.
        // So we MUST ask for Date.

        // Let's use a browser native date picker trick or just simple prompt is ugly.
        // I will copy the BookingModal logic to here basically or just show a date input before button.

        // Re-using the logic:
        // We will change the UI to show Date Input locally before clicking "Sepete Ekle".
    };

    // New state for local selection
    const [selectedDate, setSelectedDate] = useState("");
    const [note, setNote] = useState("");

    const addToCartAction = () => {
        const userStr = localStorage.getItem('studyium_user');
        if (!userStr) {
            alert("Giriş yapmalısınız.");
            window.location.href = '/login';
            return;
        }
        const user = JSON.parse(userStr);

        if (!selectedDate) {
            alert("Lütfen bir tarih seçiniz.");
            return;
        }

        if (!tutor) return;

        addToCart({
            tutor_id: tutor.id,
            tutor_name: tutor.name + " " + tutor.surname,
            student_id: user.id || 0,
            booking_date: selectedDate,
            note: note,
            price: parseFloat(tutor.hourly_rate),
            lesson_id: 1,
            lesson_name: "Özel Ders"
        });
        alert("Sepete eklendi!");
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20">Yükleniyor...</div>;

    if (errorMsg || !tutor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
                <div className="text-xl font-bold mb-2">Hata</div>
                <div className="text-red-500">{errorMsg || "İçerik bulunamadı."}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-24">

            {/* Context Banner */}
            {topicParam && (
                <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-primary text-primary-foreground rounded-full">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold opacity-70">Seçilen Konu</p>
                        <h2 className="text-xl font-bold">{topicParam}</h2>
                    </div>
                    <div className="ml-auto text-sm font-medium text-primary hidden md:block">
                        En iyi seçim!
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
                        <div className="w-32 h-32 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-primary">
                            {tutor.name[0]}
                        </div>
                        <h1 className="text-2xl font-bold text-center mb-2">{tutor.name} {tutor.surname}</h1>
                        <p className="text-primary text-center font-medium mb-6">{tutor.subjects}</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-yellow-500" /> Puan</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold">{tutor.rating}</span>
                                    <span className="text-xs text-muted-foreground">({tutor.review_count} yorum)</span>
                                </div>
                            </div>

                        </div>

                        {/* Check role for button visibility */}
                        {(() => {
                            if (typeof window !== 'undefined') {
                                const userStr = localStorage.getItem('studyium_user');
                                if (userStr) {
                                    const user = JSON.parse(userStr);
                                    if (user.role === 'tutor') {
                                        return (
                                            <div className="w-full bg-muted text-muted-foreground py-4 rounded-xl font-bold text-center border border-border">
                                                Öğretmenler randevu alamaz
                                            </div>
                                        );
                                    }
                                }
                            }

                            return (
                                <div className="space-y-4">
                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        <h3 className="font-bold mb-3 flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            Ders Konuları
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Aşağıdaki konulardan birini seçerek sepete ekleyebilirsiniz.
                                        </p>

                                        <div className="space-y-2">
                                            {tutor.topics?.map((topic) => (
                                                <button
                                                    key={topic.id}
                                                    onClick={() => {
                                                        const userStr = localStorage.getItem('studyium_user');
                                                        if (!userStr) {
                                                            alert("Giriş yapmalısınız.");
                                                            window.location.href = '/login';
                                                            return;
                                                        }
                                                        const user = JSON.parse(userStr);

                                                        if (!confirm(`${topic.name} konusunu sepete eklemek istiyor musunuz?`)) return;

                                                        addToCart({
                                                            tutor_id: tutor.id,
                                                            tutor_name: tutor.name + " " + tutor.surname,
                                                            student_id: user.id || 0,
                                                            price: parseFloat((topic.price || tutor.hourly_rate).toString()),
                                                            lesson_id: topic.id,
                                                            lesson_name: topic.name,
                                                            booking_date: "",
                                                            note: ""
                                                        });
                                                        alert(`${topic.name} sepete eklendi!`);
                                                    }}
                                                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center group"
                                                >
                                                    <span className="font-medium group-hover:text-primary transition-colors">{topic.name}</span>
                                                    <span className="text-sm font-bold text-primary">
                                                        {topic.price ? `${topic.price} TL` : `${tutor.hourly_rate} TL`}
                                                    </span>
                                                </button>
                                            ))}

                                            {(!tutor.topics || tutor.topics.length === 0) && (
                                                <p className="text-sm text-muted-foreground italic">Bu eğitmen için konu bulunamadı.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" /> Hakkında
                        </h2>
                        <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {tutor.bio || "Eğitmen henüz bir biyografi eklemedi."}
                        </p>
                    </div>

                    {/* Course Details */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-secondary" /> Ders İşleyişi & Detaylar
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            {tutor.course_details ? tutor.course_details : (
                                <p className="opacity-50">Özel ders detayları girilmemiş.</p>
                            )}
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" /> Değerlendirmeler
                        </h2>

                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold">{review.student_name || 'Öğrenci'}</div>
                                            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-xs font-bold">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">{review.comment}</p>
                                        <div className="text-xs text-muted-foreground/50 mt-2">{new Date(review.created_at).toLocaleDateString("tr-TR")}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-muted/30 rounded-xl">
                                <p className="text-muted-foreground">Henüz değerlendirme yapılmamış.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TutorDetailPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
                <TutorDetailContent />
            </Suspense>
        </div>
    );
}
