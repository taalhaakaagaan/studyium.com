"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, LayoutGrid, Star } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
// import { TutorBookingModal } from "./tutor-booking-modal";

type Category = "TYT" | "AYT";

interface Lesson {
    id: number;
    name: string;
    category: string;
}

interface Topic {
    id: number;
    lesson_id: number;
    name: string;
}

interface Tutor {
    id: number;
    name: string;
    surname: string;
    bio: string;
    rating: number;
    review_count: number;
    hourly_rate: string;
    subjects: string;
    fake_hourly_rate?: string | null;
}

export function PanelSystem() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Category>("TYT");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    // Flow State
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [showTopicsSheet, setShowTopicsSheet] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loadingTutors, setLoadingTutors] = useState(false);
    // We can reuse the bottom sheet for Tutors list or show it differently. 
    // Let's use a secondary state for Tutors List View within the same container roughly, 
    // or a second bottom sheet level. For simplicity, let's swap the sheet content or use a new sheet.
    // The requirement says: "from topic select -> tutor list appears".
    // Let's make the "Topic Sheet" also handle "Tutor List" view for deeper nav.
    const [viewState, setViewState] = useState<"topics" | "tutors">("topics");

    const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Fetch Lessons when tab changes
    useEffect(() => {
        setLoadingLessons(true);
        fetch(`/api/get_lessons_by_category.php?category=${activeTab}`)
            .then((res) => res.json())
            .then((data) => setLessons(data))
            .catch((err) => console.error(err))
            .finally(() => setLoadingLessons(false));
    }, [activeTab]);

    const handleLessonSelect = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setViewState("topics");
        setLoadingTopics(true);
        setShowTopicsSheet(true);

        fetch(`/api/get_topics_by_lesson.php?lesson_id=${lesson.id}`)
            .then((res) => res.json())
            .then((data) => setTopics(data))
            .catch((err) => console.error(err))
            .finally(() => setLoadingTopics(false));
    };

    const handleTopicSelect = (topic: Topic) => {
        setSelectedTopic(topic);
        setViewState("tutors");
        setLoadingTutors(true);

        fetch(`/api/get_tutors_by_topic.php?topic_id=${topic.id}`)
            .then((res) => res.json())
            .then((data) => setTutors(data))
            .catch((err) => console.error(err))
            .finally(() => setLoadingTutors(false));
    };

    const handleTutorSelect = (tutor: Tutor) => {
        const params = new URLSearchParams();
        params.set('id', tutor.id.toString());
        if (selectedTopic) params.set('topic', selectedTopic.name);
        if (selectedLesson) params.set('lesson', selectedLesson.name);

        router.push(`/tutors/detail?${params.toString()}`);
    };

    const closeSheet = () => {
        setShowTopicsSheet(false);
        // Reset view state after transition
        setTimeout(() => {
            setViewState("topics");
            setSelectedTopic(null);
        }, 300);
    };

    return (
        <section className="py-12 md:py-24 max-w-7xl mx-auto px-4">

            {/* Tab Header */}
            <div className="flex justify-center mb-12">
                <div className="flex bg-muted p-1 rounded-full border border-border/50 shadow-sm">
                    {(["TYT", "AYT"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-12 py-3 rounded-full text-lg font-bold transition-all duration-300 ${activeTab === tab
                                ? "bg-background text-foreground shadow-md scale-105"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lesson Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {loadingLessons ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-muted/40 animate-pulse rounded-2xl" />
                    ))
                ) : (
                    lessons.map((lesson) => (
                        <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-center">{lesson.name}</span>
                        </button>
                    ))
                )}
            </div>

            {/* Bottom Sheet for Topics / Tutors */}
            <BottomSheet
                isOpen={showTopicsSheet}
                onClose={closeSheet}
                title={viewState === "topics" ? `${selectedLesson?.name} Konuları` : `${selectedTopic?.name} Eğitmenleri`}
            >
                {viewState === "topics" ? (
                    <div className="space-y-2">
                        {loadingTopics ? (
                            <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                        ) : topics.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Bu ders için henüz konu eklenmemiş.</div>
                        ) : (
                            topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicSelect(topic)}
                                    className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted rounded-xl transition-colors text-left group"
                                >
                                    <span className="font-medium text-lg">{topic.name}</span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => setViewState("topics")}
                            className="text-sm text-primary mb-2 flex items-center hover:underline"
                        >
                            ← Konulara Dön
                        </button>

                        {loadingTutors ? (
                            <div className="text-center py-8 text-muted-foreground">Eğitmenler aranıyor...</div>
                        ) : tutors.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Bu konuda henüz eğitmen bulunamadı.</div>
                        ) : (
                            tutors.map((tutor) => (
                                <div
                                    key={tutor.id}
                                    onClick={() => handleTutorSelect(tutor)}
                                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                        🎓
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold">{tutor.name} {tutor.surname}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{tutor.subjects}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-xs font-bold">{tutor.rating}</span>
                                            <span className="text-xs text-muted-foreground">({tutor.review_count})</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-primary">{tutor.hourly_rate} TL</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </BottomSheet>

            {/* Booking Modal */}
            {/* Booking Modal removed in favor of page redirect */}

        </section>
    );
}
