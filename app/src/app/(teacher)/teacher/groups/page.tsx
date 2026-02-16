"use client";

import { useEffect, useState, useRef } from "react";
import { chatAPI, useAuthStore } from "@/lib/auth";
import { Loader2, Send, Image as ImageIcon, FileText, Hash } from "lucide-react";

export default function TeacherGroupsPage() {
    const { user } = useAuthStore();
    const [groups, setGroups] = useState<any[]>([]);
    const [activeGroup, setActiveGroup] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const res = await chatAPI.getGroups();
            if (res.success) {
                // TODO: Filter based on teacher's lessons if required stricly.
                // For now showing all as requested "Tüm dersler gözükmeli".
                setGroups(res.groups);
            }
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (!activeGroup) return;

        let isMounted = true;
        const fetchMessages = async () => {
            const res = await chatAPI.getGroupMessages(activeGroup.id);
            if (res.success && isMounted) {
                setMessages(res.messages);
            }
        };

        fetchMessages();
        scrollToBottom();

        const interval = setInterval(fetchMessages, 10000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [activeGroup?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!inputText.trim() || !activeGroup || !user) return;

        const tempMsg = {
            id: Date.now(),
            content: inputText,
            message_type: 'text',
            created_at: new Date().toISOString(),
            sender_id: (user as any).id || 1,
            sender_name: user.name || 'Teacher',
            sender_role: user.role
        };
        setMessages([...messages, tempMsg]);
        setInputText("");
        setTimeout(scrollToBottom, 100);

        await chatAPI.sendGroupMessage(activeGroup.id, (user as any).id || 1, tempMsg.content, 'text');
    };

    const handleFileUpload = (type: 'image' | 'pdf') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : 'application/pdf';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                await chatAPI.sendGroupMessage(activeGroup.id, (user as any).id || 1, base64, type);
                const res = await chatAPI.getGroupMessages(activeGroup.id);
                if (res.success) setMessages(res.messages);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex h-[calc(100vh-100px)] border rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="w-64 border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b font-semibold">Class Groups</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {groups.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setActiveGroup(g)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors ${activeGroup?.id === g.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                            <Hash className="h-4 w-4" />
                            <span className="truncate">{g.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {activeGroup ? (
                    <>
                        <div className="p-4 border-b flex justify-between items-center bg-card">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Hash className="h-5 w-5 text-muted-foreground" />
                                {activeGroup.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">Class Chat</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/10">
                            {messages.map((msg) => {
                                const isMe = (user as any)?.id === msg.sender_id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {!isMe && (
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-xs font-bold opacity-70">{msg.sender_name}</span>
                                                    {(msg.sender_role === 'teacher' || msg.sender_role === 'tutor') && <span className="text-[10px] bg-indigo-500 text-white px-1 rounded">TEACHER</span>}
                                                </div>
                                            )}

                                            {msg.message_type === 'text' && <p>{msg.content}</p>}
                                            {msg.message_type === 'image' && (
                                                <img src={msg.content} alt="Sent image" className="rounded-md max-w-full max-h-60 object-cover" />
                                            )}
                                            {msg.message_type === 'pdf' && (
                                                <a href={msg.content} download="file.pdf" className="flex items-center gap-2 underline text-sm">
                                                    <FileText className="h-4 w-4" />
                                                    Download PDF
                                                </a>
                                            )}

                                            <div className="text-[10px] mt-1 opacity-60 text-right">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t bg-card flex gap-2">
                            <button onClick={() => handleFileUpload('image')} className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleFileUpload('pdf')} className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                                <FileText className="h-5 w-5" />
                            </button>
                            <input
                                className="flex-1 bg-transparent border rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a group
                    </div>
                )}
            </div>
        </div>
    );
}
