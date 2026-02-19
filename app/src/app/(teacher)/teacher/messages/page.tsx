"use client";

import { useEffect, useState, useRef } from "react";
import { chatAPI, useAuthStore } from "@/lib/auth";
import { Loader2, Send, Image as ImageIcon, FileText, Search, User as UserIcon } from "lucide-react";

export default function TeacherMessagesPage() {
    const { user } = useAuthStore();
    const [contacts, setContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load Contacts
    useEffect(() => {
        const fetchContacts = async () => {
            const res = await chatAPI.getDMContacts();
            if (res.success) {
                setContacts(res.contacts);
                setFilteredContacts(res.contacts);
            }
            setLoading(false);
        };
        fetchContacts();
    }, []);

    // Filter Contacts
    useEffect(() => {
        if (!searchText) {
            setFilteredContacts(contacts);
        } else {
            const lower = searchText.toLowerCase();
            setFilteredContacts(contacts.filter(c =>
                c.name?.toLowerCase().includes(lower) ||
                c.email?.toLowerCase().includes(lower)
            ));
        }
    }, [searchText, contacts]);

    // Load Messages
    useEffect(() => {
        if (!activeContact || !user) return;
        const fetchMessages = async () => {
            const res = await chatAPI.getDMMessages((user as any).id || 1, activeContact.id);
            if (res.success) setMessages(res.messages);
            scrollToBottom();
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [activeContact, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!inputText.trim() || !activeContact || !user) return;

        const tempMsg = {
            id: Date.now(),
            content: inputText,
            message_type: 'text',
            created_at: new Date().toISOString(),
            sender_id: (user as any).id || 1,
            sender_name: user.name
        };
        setMessages([...messages, tempMsg]);
        setInputText("");
        setTimeout(scrollToBottom, 100);

        await chatAPI.sendDMMessage((user as any).id || 1, activeContact.id, tempMsg.content, 'text');
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
                await chatAPI.sendDMMessage((user as any).id || 1, activeContact.id, base64, type);
                const res = await chatAPI.getDMMessages((user as any).id || 1, activeContact.id);
                if (res.success) setMessages(res.messages);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex h-[calc(100vh-100px)] border rounded-xl overflow-hidden shadow-sm bg-card">
            {/* Sidebar Contact List */}
            <div className="w-72 border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b space-y-2">
                    <div className="font-semibold">Messages</div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                        <input
                            className="w-full bg-background border rounded-md pl-8 pr-2 py-1 text-sm focus:outline-none"
                            placeholder="Search people..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredContacts.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveContact(c)}
                            className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-colors ${activeContact?.id === c.id ? 'bg-primary/10 border-primary/20 border' : 'hover:bg-muted'}`}
                        >
                            <div className={`mt-1 p-2 rounded-full ${activeContact?.id === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <UserIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-semibold truncate">{c.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                                <div className="mt-1 inline-flex text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                                    {c.role}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeContact ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-card">
                            <h3 className="font-semibold flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                                {activeContact.name}
                                <span className="text-xs font-normal text-muted-foreground ml-2">({activeContact.role})</span>
                            </h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/10">
                            {messages.map((msg) => {
                                const isMe = (user as any)?.id === msg.sender_id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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

                        {/* Input */}
                        <div className="p-4 border-t bg-card flex gap-2">
                            <button onClick={() => handleFileUpload('image')} className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleFileUpload('pdf')} className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                                <FileText className="h-5 w-5" />
                            </button>
                            <input
                                className="flex-1 bg-transparent border rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Message..."
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
                        Select a person to message
                    </div>
                )}
            </div>
        </div>
    );
}
