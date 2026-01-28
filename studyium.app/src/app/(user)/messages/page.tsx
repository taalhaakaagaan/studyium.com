"use client";

import { useEffect, useState, useRef } from "react";
import { chatAPI, useAuthStore } from "@/lib/auth";
import { Loader2, Send, Image as ImageIcon, FileText, User as UserIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentMessagesPage() {
    const { user } = useAuthStore();
    const [contacts, setContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Contacts (Teachers/Admins)
    useEffect(() => {
        const init = async () => {
            // Assuming chatAPI.getContacts() exists and returns { contacts: [...] }
            // If this fails, user might see empty list. 
            // Logic in main.js "db:get-dm-contacts" exists.
            const res = await chatAPI.getContacts();
            if (res.success) {
                setContacts(res.contacts || []);
                setFilteredContacts(res.contacts || []);
            }
            setLoading(false);
        };
        init();
    }, []);

    // Filter contacts
    useEffect(() => {
        if (!contacts) return;
        setFilteredContacts(
            contacts.filter(c =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, contacts]);

    // Fetch Messages for Active Contact
    useEffect(() => {
        if (!activeContact || !user) return;

        let isMounted = true;
        const fetchMessages = async () => {
            // Using correct API call. fixed main.js to accept contactId.
            const res = await chatAPI.getDMMessages((user as any).id, activeContact.id);
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
    }, [activeContact?.id, (user as any)?.id]);

    // Scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!inputText.trim() || !activeContact || !user) return;

        const content = inputText;
        const tempMsg = {
            id: Date.now(),
            content: content,
            message_type: 'text',
            created_at: new Date().toISOString(),
            sender_id: (user as any).id,
            sender_name: user.name,
        };

        setMessages(prev => [...prev, tempMsg]);
        setInputText("");
        setTimeout(scrollToBottom, 100);

        await chatAPI.sendDMMessage((user as any).id, activeContact.id, content, 'text');
    };

    const handleFileUpload = (type: 'image' | 'pdf') => {
        if (!activeContact || !user) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : 'application/pdf';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                await chatAPI.sendDMMessage((user as any).id, activeContact.id, base64, type);

                const res = await chatAPI.getDMMessages((user as any).id, activeContact.id);
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
            <div className="w-80 border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b space-y-3">
                    <div className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Direct Messages</div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Search people..."
                            className="w-full bg-background border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredContacts.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveContact(c)}
                            className={cn(
                                "w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors",
                                activeContact?.id === c.id ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted bg-card border border-transparent hover:border-border"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                activeContact?.id === c.id ? "bg-primary-foreground/20" : "bg-muted"
                            )}>
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{c.name}</div>
                                <div className={cn("text-xs truncate flex items-center gap-1", activeContact?.id === c.id ? "opacity-80" : "text-muted-foreground")}>
                                    {c.role === 'teacher' ? (
                                        <span className="bg-indigo-500/10 text-indigo-500 px-1 rounded text-[10px]">Teacher</span>
                                    ) : (
                                        <span className="bg-gray-500/10 text-gray-500 px-1 rounded text-[10px]">Admin</span>
                                    )}
                                    <span className="opacity-50">• {c.role}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">No contacts found</div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col bg-background">
                {activeContact ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-semibold">{activeContact.name}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{activeContact.role}</div>
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
                            <UserIcon className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="font-medium">Select a contact to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
