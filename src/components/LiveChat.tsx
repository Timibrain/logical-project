'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Send, Paperclip, Loader2, CheckCheck, ShieldCheck } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LiveChatProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LiveChat({ isOpen, onClose, userId }: LiveChatProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }, []);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });
            setMessages(data || []);
            scrollToBottom();
        };
        fetchMessages();

        const channel = supabase.channel(`chat-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
                setIsTyping(false);
                scrollToBottom();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isOpen, userId, scrollToBottom]);

    // Show typing indicator after user sends a message
    useEffect(() => {
        if (messages.length > 0 && !messages[messages.length - 1]?.is_admin) {
            const t = setTimeout(() => setIsTyping(true), 1200);
            return () => clearTimeout(t);
        } else {
            setIsTyping(false);
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = message.trim();
        if (!text) return;
        setMessage('');
        setIsTyping(false);
        await supabase.from('messages').insert([
            { user_id: userId, content: text, is_admin: false, type: 'text' }
        ]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const fileName = `${userId}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('chat-uploads').upload(fileName, file);
        if (error) { alert('Upload failed'); setIsUploading(false); return; }
        const { data: { publicUrl } } = supabase.storage.from('chat-uploads').getPublicUrl(fileName);
        await supabase.from('messages').insert([
            { user_id: userId, content: publicUrl, is_admin: false, type: 'image' }
        ]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-[100dvh] md:h-[620px] z-[100] flex flex-col bg-white md:rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="bg-[#0B1C33] px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">TC</div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0B1C33] rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-tight">Premier Support</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <p className="text-slate-400 text-[11px]">Online · replies in minutes</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {/* Secure notice */}
            <div className="bg-slate-50 border-b border-gray-100 px-4 py-1.5 flex items-center justify-center gap-1.5">
                <ShieldCheck size={11} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">End-to-end encrypted · Private Banking</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#F8FAFC]">

                {/* Welcome */}
                <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] flex-shrink-0 mb-1">TC</div>
                    <div className="max-w-[78%]">
                        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-800 leading-relaxed">Hi there 👋 Welcome to <strong>Titan // Core</strong> Premier Support. How can we help you today?</p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">Support · Just now</p>
                    </div>
                </div>

                {messages.map((msg, i) => {
                    const isUser = !msg.is_admin;
                    const showAvatar = !isUser && (i === 0 || messages[i - 1]?.is_admin === false);
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser && (
                                <div className={`w-7 h-7 rounded-full flex-shrink-0 mb-1 ${showAvatar ? 'bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px]' : 'opacity-0 pointer-events-none'}`}>
                                    {showAvatar ? 'TC' : ''}
                                </div>
                            )}
                            <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                <div className={`rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'bg-[#1170FF] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                    {msg.type === 'image' ? (
                                        <img src={msg.content} alt="Attachment"
                                            className="rounded-xl max-w-full max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(msg.content, '_blank')} />
                                    ) : (
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    )}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                                    {isUser && <CheckCheck size={12} className="text-blue-400" />}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-end gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] flex-shrink-0 mb-1">TC</div>
                        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1.5">
                                {[0, 150, 300].map(d => (
                                    <span key={d} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className="flex justify-end">
                        <div className="bg-blue-50 text-blue-500 px-4 py-2 rounded-2xl text-xs flex items-center gap-2 border border-blue-100">
                            <Loader2 size={12} className="animate-spin" /> Uploading…
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-[#1170FF] hover:bg-blue-50 transition-colors flex-shrink-0"
                        title="Attach screenshot or file">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text" value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1170FF] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button type="submit" disabled={!message.trim()}
                        className="w-10 h-10 flex items-center justify-center bg-[#1170FF] text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-600 disabled:opacity-40 disabled:shadow-none transition-all flex-shrink-0">
                        <Send size={17} />
                    </button>
                </form>
                <p className="text-center text-[10px] text-gray-300 mt-2">256-bit encrypted · Private Banking</p>
            </div>
        </div>
    );
}
