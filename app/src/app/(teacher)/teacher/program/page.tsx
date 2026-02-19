"use client";

import { useEffect, useState, Suspense } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Save, Plus, X, Trash2, ArrowLeft } from "lucide-react";
import { authAPI } from "@/lib/auth";
import { scheduleAPI } from "@/lib/schedule";

// Simple Button Component
const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }: any) => {
    const base = "px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center justify-center";
    const variants: any = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

// Simple Modal Component
const Modal = ({ isOpen, onClose, children, title }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

function ScheduleContent() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null); // { day, start, end, note, is_live }

    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');
    const studentName = searchParams.get('studentName');

    // Init Data
    useEffect(() => {
        const init = async () => {
            try {
                const session = await authAPI.checkSession();
                if (session.success) {
                    setCurrentUser(session);
                    if (studentId) {
                        loadSchedule(session.id, studentId);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        init();
    }, [studentId]);

    const loadSchedule = async (teacherId: number, sId: string) => {
        try {
            const res = await scheduleAPI.getTeacherSchedule(teacherId, sId);
            if (res.success) {
                setSchedule(res.schedule || []);
            }
        } catch (e) {
            console.error("Failed to load schedule", e);
        }
    };

    const handleSave = async () => {
        if (!currentUser || !studentId) return;
        setLoading(true);
        try {
            const res = await scheduleAPI.saveWeeklySchedule(currentUser.id, schedule, studentId);
            if (res.success) {
                alert("Program başarıyla kaydedildi!");
            } else {
                alert("Hata: " + res.message);
            }
        } catch (error) {
            alert("Kaydedilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = (day: string, hour: number) => {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
        setSelectedSlot({
            day_of_week: day,
            start_time: start,
            end_time: end,
            note: '',
            is_live: false,
            isNew: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (slot: any) => {
        setSelectedSlot({ ...slot, isNew: false });
        setIsModalOpen(true);
    };

    const saveSlot = () => {
        if (selectedSlot.isNew) {
            setSchedule([...schedule, {
                day_of_week: selectedSlot.day_of_week,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
                note: selectedSlot.note,
                is_live: selectedSlot.is_live
            }]);
        } else {
            const newSchedule = schedule.map(s =>
                (s === selectedSlot || (s.day_of_week === selectedSlot.day_of_week && s.start_time === selectedSlot.start_time))
                    ? selectedSlot
                    : s
            );
            setSchedule(newSchedule);
        }
        setIsModalOpen(false);
    };

    const removeSlot = () => {
        const newSchedule = schedule.filter(s => s !== selectedSlot && !(s.day_of_week === selectedSlot.day_of_week && s.start_time === selectedSlot.start_time));
        setSchedule(newSchedule);
        setIsModalOpen(false);
    };

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
        return {
            name: format(date, 'EEEE', { locale: tr }),
            dbKey: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
        };
    });

    const hours = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 - 24:00

    if (!studentId) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-xl font-semibold">Öğrenci Seçilmedi</h2>
                <p className="text-muted-foreground">Lütfen önce bir öğrenci seçiniz.</p>
                <Button onClick={() => window.history.back()} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Listeye Dön
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {studentName ? `${studentName} - Haftalık Program` : 'Haftalık Program'}
                    </h1>
                    <p className="text-muted-foreground">
                        {studentName ? `${studentName} için haftalık ders programını düzenliyorsunuz.` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => window.history.back()} variant="outline">Geri Dön</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Kaydediliyor..." : "Programı Kaydet"}
                    </Button>
                </div>
            </div>

            <div className="border rounded-xl bg-card shadow-sm overflow-hidden overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 border-b divide-x bg-muted/50">
                        <div className="p-3 text-center text-xs font-semibold text-muted-foreground w-20">Saat</div>
                        {days.map(day => (
                            <div key={day.dbKey} className="p-3 text-center text-sm font-semibold capitalize">
                                {day.name}
                            </div>
                        ))}
                    </div>
                    <div className="divide-y relative">
                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-8 divide-x min-h-[80px]">
                                <div className="p-2 text-center text-xs font-medium text-muted-foreground flex items-center justify-center bg-muted/20 w-20">
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                </div>
                                {days.map(day => {
                                    const slot = schedule.find(s =>
                                        s.day_of_week === day.dbKey &&
                                        parseInt(s.start_time?.split(':')[0]) === hour
                                    );

                                    return (
                                        <div key={day.dbKey} className="relative group p-1 transition-colors hover:bg-muted/10">
                                            {slot ? (
                                                <div
                                                    className={`w-full h-full rounded p-2 text-xs flex flex-col gap-1 cursor-pointer border ${slot.is_live ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20'}`}
                                                    onClick={() => openEditModal(slot)}
                                                >
                                                    <div className="font-semibold truncate">{slot.note || 'Ders'}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                    </div>
                                                    {slot.is_live && <div className="text-[10px] font-bold text-red-600">CANLI</div>}
                                                </div>
                                            ) : (
                                                <div
                                                    className="w-full h-full rounded border-2 border-dashed border-transparent hover:border-primary/20 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => openAddModal(day.dbKey, hour)}
                                                >
                                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedSlot?.isNew ? "Yeni Ders Ekle" : "Ders Düzenle"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Başlangıç</label>
                            <input
                                type="time"
                                className="w-full p-2 border rounded-md bg-transparent"
                                value={selectedSlot?.start_time || ''}
                                onChange={e => setSelectedSlot({ ...selectedSlot, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bitiş</label>
                            <input
                                type="time"
                                className="w-full p-2 border rounded-md bg-transparent"
                                value={selectedSlot?.end_time || ''}
                                onChange={e => setSelectedSlot({ ...selectedSlot, end_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ders Notu / Başlık</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md bg-transparent"
                            placeholder="Örn: Matematik - Türev"
                            value={selectedSlot?.note || ''}
                            onChange={e => setSelectedSlot({ ...selectedSlot, note: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isLive"
                            className="w-4 h-4"
                            checked={selectedSlot?.is_live || false}
                            onChange={e => setSelectedSlot({ ...selectedSlot, is_live: e.target.checked })}
                        />
                        <label htmlFor="isLive" className="text-sm font-medium">Canlı Ders Yapılacak</label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={saveSlot} className="flex-1">Kaydet</Button>
                        {!selectedSlot?.isNew && (
                            <Button onClick={removeSlot} variant="destructive" className="flex-1">
                                <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default function TeacherSchedulePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ScheduleContent />
        </Suspense>
    );
}
