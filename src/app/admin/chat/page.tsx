'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, RefreshCw, Image as ImageIcon } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminChat() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState('');

    useEffect(() => {
        fetchConversations();
        const channel = supabase.channel('admin-chat')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchConversations();
                if (selectedUser) fetchMessages(selectedUser);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedUser]);

    const fetchConversations = async () => {
        const { data } = await supabase.from('messages').select('user_id, created_at, content, type').order('created_at', { ascending: false });
        const uniqueUsers = new Map();
        data?.forEach(msg => {
            if (!uniqueUsers.has(msg.user_id)) {
                uniqueUsers.set(msg.user_id, msg);
            }
        });
        setConversations(Array.from(uniqueUsers.values()));
    };

    const fetchMessages = async (userId: string) => {
        const { data } = await supabase.from('messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        setMessages(data || []);
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply || !selectedUser) return;

        await supabase.from('messages').insert([
            { user_id: selectedUser, content: reply, is_admin: true, type: 'text' }
        ]);
        setReply('');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-black">
            {/* Sidebar */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 font-bold text-lg flex justify-between">
                    Inbox <button onClick={fetchConversations}><RefreshCw size={16} /></button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {conversations.map((conv) => (
                        <div
                            key={conv.user_id}
                            onClick={() => { setSelectedUser(conv.user_id); fetchMessages(conv.user_id); }}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedUser === conv.user_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-gray-900 truncate">User: {conv.user_id.slice(0, 8)}...</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conv.type === 'image' ? '📷 [Image Sent]' : conv.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className="w-2/3 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10">
                            <h3 className="font-bold">Chatting with: {selectedUser}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-[70%] text-sm ${msg.is_admin
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                        }`}>
                                        {msg.type === 'image' ? (
                                            <div className="flex flex-col gap-1">
                                                <img
                                                    src={msg.content}
                                                    className="rounded bg-black/10 max-w-full h-auto"
                                                    alt="User Upload"
                                                />
                                                <a href={msg.content} target="_blank" className="text-xs underline opacity-75">View Full Size</a>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleReply} className="p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Type admin reply..."
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                />
                                <button className="px-6 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Send</button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Select a conversation</div>
                )}
            </div>
        </div>
    );
}