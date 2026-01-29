"use client";

import { useEffect, useState, useRef } from "react";
import { chatAPI, useAuthStore } from "@/lib/auth";
import { Loader2, Send, Image as ImageIcon, FileText, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentGroupsPage() {
    const { user } = useAuthStore();
    const [groups, setGroups] = useState<any[]>([]);
    const [activeGroup, setActiveGroup] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Groups
    useEffect(() => {
        const init = async () => {
            const res = await chatAPI.getGroups();
            if (res.success) {
                setGroups(res.groups || []);
            }
            setLoading(false);
        };
        init();

        const interval = setInterval(init, 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Messages for Active Group
    useEffect(() => {
        if (!activeGroup) return;

        let isMounted = true;
        const fetchMessages = async () => {
            const res = await chatAPI.getGroupMessages(activeGroup.id);
            if (res.success && isMounted) {
                setMessages(res.messages || []);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [activeGroup?.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!inputText.trim() || !activeGroup || !user) return;

        const content = inputText;
        const tempMsg = {
            id: Date.now(),
            content: content,
            message_type: 'text',
            created_at: new Date().toISOString(),
            sender_id: (user as any).id,
            sender_name: user.name,
            sender_role: user.role
        };

        setMessages(prev => [...prev, tempMsg]);
        setInputText("");
        setTimeout(scrollToBottom, 100);

        await chatAPI.sendGroupMessage(activeGroup.id, (user as any).id, content, 'text');
    };

    const handleFileUpload = (type: 'image' | 'pdf') => {
        if (!activeGroup || !user) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : 'application/pdf';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;

                // Optimistic UI could be added here if needed, but file upload usually takes time anyway
                // We'll trust the poll/refetch in this case or manual fetch

                await chatAPI.sendGroupMessage(activeGroup.id, (user as any).id, base64, type);

                // Instant refresh
                const res = await chatAPI.getGroupMessages(activeGroup.id);
                if (res.success) setMessages(res.messages);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="flex h-[calc(100vh-100px)] border rounded-xl overflow-hidden shadow-sm bg-card">
            {/* Sidebar */}
            <div className="w-64 shrink-0 border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b font-semibold text-sm uppercase tracking-wide text-muted-foreground">Class Groups</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {groups.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setActiveGroup(g)}
                            className={cn(
                                "w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-colors",
                                activeGroup?.id === g.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center",
                                activeGroup?.id === g.id ? "bg-primary-foreground/20" : "bg-muted-foreground/10"
                            )}>
                                <Hash className="h-4 w-4" />
                            </div>
                            <span className="truncate">{g.name}</span>
                        </button>
                    ))}
                    {groups.length === 0 && (
                        <div className="p-4 text-xs text-center text-muted-foreground">No groups found</div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col bg-background">
                {activeGroup ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Hash className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-semibold">{activeGroup.name}</div>
                                    <div className="text-xs text-muted-foreground">Class Chat</div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/5">
                            {messages.map((msg) => {
                                const isMe = (user as any)?.id === msg.sender_id;
                                return (
                                    <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                                            isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-white border rounded-bl-none"
                                        )}>
                                            {!isMe && (
                                                <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                                                    <span className="font-bold">{msg.sender_name}</span>
                                                    {msg.sender_role === 'teacher' && (
                                                        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-200">
                                                            TEACHER
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {msg.message_type === 'text' && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                            {msg.message_type === 'image' && (
                                                <img src={msg.content} alt="Content" className="rounded-lg max-w-full max-h-60 object-cover mt-1" />
                                            )}
                                            {msg.message_type === 'pdf' && (
                                                <a href={msg.content} download="file.pdf" className="flex items-center gap-2 p-2 bg-background/10 rounded border border-white/20 mt-1 hover:bg-background/20 transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                    <span className="text-sm underline">Download PDF</span>
                                                </a>
                                            )}

                                            <div className={cn(
                                                "text-[10px] mt-1 text-right",
                                                isMe ? "opacity-70" : "text-muted-foreground"
                                            )}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t bg-card">
                            <div className="flex items-center gap-2 max-w-4xl mx-auto">
                                <button onClick={() => handleFileUpload('image')} className="p-2.5 rounded-full hover:bg-muted text-muted-foreground transition-colors" title="Send Image">
                                    <ImageIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleFileUpload('pdf')} className="p-2.5 rounded-full hover:bg-muted text-muted-foreground transition-colors" title="Send PDF">
                                    <FileText className="h-5 w-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        className="w-full bg-muted/50 border-transparent hover:border-muted active:border-primary focus:border-primary rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Type a message..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputText.trim()}
                                        className="absolute right-1 top-1 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Hash className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="font-medium">Select a group to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
