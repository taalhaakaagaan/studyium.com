"use client";

import { useState, Suspense } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MessageSquare, Paperclip, Send, Users, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LiveRoomContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "student"; // 'teacher' or 'student'

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [messages, setMessages] = useState<{ sender: string, text: string, time: string }[]>([
        { sender: "System", text: "Welcome to the session. Rules: Be respectful.", time: "10:00 AM" }
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([...messages, { sender: "You", text: newMessage, time }]);
        setNewMessage("");
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col bg-zinc-950 text-white overflow-hidden rounded-xl">
            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Stage */}
                <div className="flex-1 p-4 relative flex items-center justify-center bg-zinc-900">
                    <div className="w-full h-full max-w-5xl aspect-video bg-zinc-800 rounded-lg overflow-hidden relative shadow-2xl flex items-center justify-center group">

                        {/* Main Feed */}
                        {isScreenSharing ? (
                            <div className="text-center">
                                <MonitorUp size={64} className="mx-auto text-zinc-600 mb-4 animate-pulse" />
                                <h3 className="text-xl font-medium text-zinc-400">
                                    {role === 'teacher' ? "You are sharing your screen" : "Teacher is sharing screen"}
                                </h3>
                            </div>
                        ) : (
                            <div className="text-center w-full h-full relative">
                                {/* If student, show Teacher's camera main. If teacher, show student grid or specific focus */}
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                                    {role === 'student' ? (
                                        <div className="text-center">
                                            <div className="w-32 h-32 rounded-full bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-indigo-400/20">
                                                T
                                            </div>
                                            <h3 className="text-xl font-medium">Teacher's Camera</h3>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
                                            {[1, 2].map(i => (
                                                <div key={i} className="bg-zinc-700/50 rounded-lg flex items-center justify-center border border-zinc-700 relative">
                                                    <span className="text-zinc-500 font-medium">Student {i}</span>
                                                    <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">Ali Y.</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Self View / PIP */}
                        <div className="absolute bottom-4 right-4 w-48 h-32 bg-zinc-700 rounded-lg shadow-lg overflow-hidden border-2 border-zinc-600 z-10">
                            {!isVideoOff ? (
                                <div className="w-full h-full bg-zinc-600 flex items-center justify-center relative">
                                    <span className="text-xs text-zinc-400">You</span>
                                    {isMuted && <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1"><MicOff size={10} /></div>}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <VideoOff size={24} className="text-red-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Chat) */}
                {isChatOpen && (
                    <div className="w-80 border-l border-zinc-800 bg-zinc-900 flex flex-col">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="font-semibold">Meeting Chat</h3>
                            <div className="flex items-center gap-1">
                                <Users size={14} className="text-zinc-400" />
                                <span className="text-xs text-zinc-400">12</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex flex-col gap-1", msg.sender === "You" ? "items-end" : "items-start")}>
                                    <div className="text-xs text-zinc-500 font-medium">{msg.sender} • {msg.time}</div>
                                    <div className={cn("px-3 py-2 rounded-lg text-sm max-w-[85%]",
                                        msg.sender === "You" ? "bg-indigo-600 text-white rounded-tr-none" :
                                            msg.sender === "System" ? "bg-zinc-800/50 text-zinc-400 italic text-center w-full" :
                                                "bg-zinc-800 text-zinc-200 rounded-tl-none"
                                    )}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-zinc-800">
                            <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-2">
                                <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors">
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-zinc-600 text-zinc-200"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-full transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-2 w-1/4">
                    <div className="text-sm font-medium">
                        Math Analysis - Advanced
                    </div>
                    <div className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                        <span>Live</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={cn(
                            "p-3 rounded-full transition-all duration-200",
                            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-zinc-700 hover:bg-zinc-600"
                        )}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={cn(
                            "p-3 rounded-full transition-all duration-200",
                            isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-zinc-700 hover:bg-zinc-600"
                        )}
                        title={isVideoOff ? "Start Video" : "Stop Video"}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>

                    {role === 'teacher' && (
                        <button
                            onClick={() => setIsScreenSharing(!isScreenSharing)}
                            className={cn(
                                "p-3 rounded-full transition-all duration-200",
                                isScreenSharing ? "bg-green-600 hover:bg-green-700" : "bg-zinc-700 hover:bg-zinc-600"
                            )}
                            title="Share Screen"
                        >
                            <MonitorUp size={20} />
                        </button>
                    )}

                    <button className="p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors" title="Raise Hand">
                        <Hand size={20} />
                    </button>

                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={cn(
                            "p-3 rounded-full transition-all duration-200 relative",
                            isChatOpen ? "bg-indigo-600 hover:bg-indigo-700" : "bg-zinc-700 hover:bg-zinc-600"
                        )}
                        title="Toggle Chat"
                    >
                        <MessageSquare size={20} />
                    </button>
                </div>

                <div className="flex justify-end w-1/4">
                    <Link href={role === 'teacher' ? "/teacher/dashboard" : "/dashboard"} className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors">
                        <PhoneOff size={18} />
                        Leave
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LiveRoomPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-white">Loading session...</div>}>
            <LiveRoomContent />
        </Suspense>
    );
}
