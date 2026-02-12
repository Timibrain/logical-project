'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Send, Paperclip, Minimize2, Headphones, Loader2, Image as ImageIcon } from 'lucide-react';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LiveChatProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function LiveChat({ isOpen, onClose, userId }: LiveChatProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch & Subscribe
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

        const channel = supabase.channel('live-chat')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
                scrollToBottom();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isOpen, userId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // 2. Handle Text Send
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const text = message;
        setMessage('');

        await supabase.from('messages').insert([
            { user_id: userId, content: text, is_admin: false, type: 'text' }
        ]);
    };

    // 3. Handle File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fileName = `${userId}/${Date.now()}_${file.name}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('chat-uploads')
            .upload(fileName, file);

        if (uploadError) {
            alert('Upload failed');
            setIsUploading(false);
            return;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('chat-uploads')
            .getPublicUrl(fileName);

        // Insert Message as 'image'
        await supabase.from('messages').insert([
            { user_id: userId, content: publicUrl, is_admin: false, type: 'image' }
        ]);

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[380px] h-[100vh] md:h-[600px] z-[100] flex flex-col bg-[#F2F4F7] md:rounded-2xl shadow-2xl overflow-hidden font-sans border border-slate-200 ${manrope.className}`}>

            {/* HEADER */}
            <div className="bg-[#0B1C33] p-4 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                            <Headphones size={20} className="text-[#1170FF]" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#12B76A] border-2 border-[#0B1C33] rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Premier Support</h3>
                        <p className="text-[10px] text-slate-400">Typical reply time: 2m</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Minimize2 size={18} className="text-slate-400" />
                </button>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                {/* Welcome Message */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B1C33] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-white">CP</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]">
                        <p className="text-xs text-[#0B1C33] leading-relaxed">
                            Hello! Use the photo icon below to send screenshots or documents.
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 block">Just now</span>
                    </div>
                </div>

                {/* Dynamic Messages */}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${!msg.is_admin ? 'justify-end' : ''}`}>

                        {/* Admin Avatar */}
                        {msg.is_admin && (
                            <div className="w-8 h-8 rounded-full bg-[#0B1C33] flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-white">CP</span>
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`p-3 rounded-2xl shadow-sm border max-w-[80%] ${!msg.is_admin
                                ? 'bg-[#1170FF] text-white rounded-tr-none border-[#1170FF]'
                                : 'bg-white text-[#0B1C33] rounded-tl-none border-slate-100'
                            }`}>
                            {msg.type === 'image' ? (
                                // Image Render
                                <div className="relative">
                                    <img
                                        src={msg.content}
                                        alt="Attachment"
                                        className="rounded-lg max-w-full h-auto max-h-[200px] border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(msg.content, '_blank')}
                                    />
                                </div>
                            ) : (
                                // Text Render
                                <p className="text-xs leading-relaxed">{msg.content}</p>
                            )}

                            <span className={`text-[9px] mt-1 block ${!msg.is_admin ? 'text-blue-100' : 'text-slate-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                    </div>
                ))}

                {isUploading && (
                    <div className="flex justify-end">
                        <div className="bg-[#1170FF]/10 text-[#1170FF] px-3 py-1 rounded-full text-[10px] flex items-center gap-2">
                            <Loader2 size={10} className="animate-spin" /> Uploading photo...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="relative flex items-center gap-2">

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />

                    {/* Paperclip Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-[#1170FF] transition-colors"
                        title="Attach File"
                    >
                        <Paperclip size={20} />
                    </button>

                    {/* NEW: Explicit Image Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-[#1170FF] transition-colors"
                        title="Upload Photo"
                    >
                        <ImageIcon size={20} />
                    </button>

                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-[#F2F4F7] border-none rounded-full py-3 px-4 text-sm text-[#0B1C33] focus:ring-2 focus:ring-[#1170FF] outline-none placeholder-slate-400"
                    />

                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="p-3 bg-[#1170FF] text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}