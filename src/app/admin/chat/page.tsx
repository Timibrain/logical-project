'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
    User, RefreshCw, MessageCircle, DollarSign, ClipboardList, FileText,
    Check, X, LogIn, Eye, EyeOff, Loader2, Search,
    ArrowDownLeft, ArrowUpRight, Clock, Send, Mail, AlertTriangle,
    ShieldCheck, TrendingUp, Users, Activity, Settings, Bitcoin,
    Wallet, Building2, Smartphone, CreditCard, Save
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_PASSWORD_KEY = 'admin_pw_session';

// ─── Design tokens ────────────────────────────────────────────────────────────
const WF = {
    red: '#D71E28', redDark: '#A3151D',
    gold: '#FFCD41',
    black: '#1A1A1A', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function adminFetch(path: string, opts: RequestInit = {}) {
    const pw = sessionStorage.getItem(ADMIN_PASSWORD_KEY) ?? '';
    return fetch(path, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            'x-admin-password': pw,
            ...(opts.headers ?? {}),
        },
    });
}

function daysUntil(dateStr: string) {
    const ms = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        PENDING:   { bg: 'rgba(245,158,11,0.12)',  color: '#92400E' },
        COMPLETED: { bg: 'rgba(22,163,74,0.12)',   color: '#14532D' },
        APPROVED:  { bg: 'rgba(22,163,74,0.12)',   color: '#14532D' },
        REJECTED:  { bg: 'rgba(215,30,40,0.10)',   color: '#991B1B' },
        REFUNDED:  { bg: 'rgba(124,58,237,0.10)',  color: '#4C1D95' },
    };
    const s = map[status] ?? { bg: 'rgba(107,101,96,0.1)', color: WF.muted };
    return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: s.bg, color: s.color }}>
            {status}
        </span>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: WF.muted }}>
            {children}
        </p>
    );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl ${className}`}
            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
            {children}
        </div>
    );
}

function FilterBar({ options, value, onChange, onRefresh }: {
    options: readonly string[]; value: string; onChange: (v: string) => void; onRefresh: () => void;
}) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex gap-2 flex-wrap">
                {options.map(f => (
                    <button key={f} onClick={() => onChange(f)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                            background: value === f ? WF.red : WF.surface,
                            color: value === f ? '#fff' : WF.muted,
                            border: `1px solid ${value === f ? WF.red : WF.border}`,
                        }}>
                        {f}
                    </button>
                ))}
            </div>
            <button onClick={onRefresh}
                className="p-2 rounded-xl transition-all hover:shadow-sm"
                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                <RefreshCw size={14} style={{ color: WF.muted }} />
            </button>
        </div>
    );
}

// ─── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
    const [pw, setPw] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        const res = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw }),
        });
        if (res.ok) { sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw); onAuth(); }
        else setError('Incorrect password. Please try again.');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 font-sans"
            style={{ background: WF.bg }}>
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <span className="font-display text-3xl font-bold italic" style={{ color: WF.red }}>West</span>
                        <span className="font-display text-3xl font-bold" style={{ color: WF.black }}>Bank</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <ShieldCheck size={14} style={{ color: WF.muted }} />
                        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: WF.muted }}>
                            Admin Portal
                        </p>
                    </div>
                </div>

                <Card className="p-8">
                    <h1 className="font-display text-xl font-bold mb-6" style={{ color: WF.black }}>
                        Secure Access
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type={show ? 'text' : 'password'} value={pw}
                                onChange={e => setPw(e.target.value)}
                                placeholder="Admin password"
                                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                                autoFocus
                            />
                            <button type="button" onClick={() => setShow(!show)}
                                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }}>
                                {show ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs px-3 py-2 rounded-lg"
                                style={{ background: 'rgba(215,30,40,0.08)', color: WF.red }}>
                                {error}
                            </p>
                        )}
                        <button type="submit" disabled={loading || !pw}
                            className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                            style={{ background: WF.red }}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                            {loading ? 'Verifying…' : 'Sign In to Admin'}
                        </button>
                    </form>
                </Card>

                <p className="text-center text-xs mt-6" style={{ color: WF.muted }}>
                    West Bank, N.A. — Restricted Access
                </p>
            </div>
        </div>
    );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                {children}
            </div>
        </div>
    );
}

function RejectModal({ tx, onClose, onRejected }: { tx: any; onClose: () => void; onRejected: (txId: string) => void }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) { setError('Please provide a reason.'); return; }
        setLoading(true); setError('');
        const res = await adminFetch('/api/admin/reject-transaction', {
            method: 'POST',
            body: JSON.stringify({ transactionId: tx.id, reason }),
        });
        if (res.ok) { onRejected(tx.id); onClose(); }
        else { const d = await res.json(); setError(d.error ?? 'Failed to reject'); }
        setLoading(false);
    };

    return (
        <ModalShell onClose={onClose}>
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(215,30,40,0.1)' }}>
                    <AlertTriangle size={18} style={{ color: WF.red }} />
                </div>
                <div>
                    <h3 className="font-display font-bold" style={{ color: WF.black }}>Reject Withdrawal</h3>
                    <p className="text-xs" style={{ color: WF.muted }}>
                        ${fmt(tx.amount)} · {tx.user_email}
                    </p>
                </div>
            </div>

            <div className="p-3 rounded-xl mb-5 text-xs leading-relaxed"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#92400E' }}>
                <strong>7-day hold:</strong> Funds will be returned after 7 days. The user will be emailed your reason and the refund date.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
                        Reason for Rejection <span style={{ color: WF.red }}>*</span>
                    </label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Withdrawal details could not be verified."
                        rows={4}
                        className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-all"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                        required autoFocus />
                    <p className="text-[10px] mt-1" style={{ color: WF.muted }}>This message will be sent directly to the user via email.</p>
                </div>
                {error && <p className="text-xs font-medium" style={{ color: WF.red }}>{error}</p>}
                <div className="flex gap-3">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.muted }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || !reason.trim()}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: WF.red }}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        {loading ? 'Rejecting…' : 'Reject & Notify'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function RejectAppModal({ app, onClose, onRejected }: { app: any; onClose: () => void; onRejected: (id: string) => void }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) { setError('Please provide a reason.'); return; }
        setLoading(true); setError('');
        const res = await adminFetch('/api/admin/reject-application', {
            method: 'POST',
            body: JSON.stringify({ applicationId: app.id, reason }),
        });
        if (res.ok) { onRejected(app.id); onClose(); }
        else { const d = await res.json(); setError(d.error ?? 'Failed to reject'); }
        setLoading(false);
    };

    return (
        <ModalShell onClose={onClose}>
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(215,30,40,0.1)' }}>
                    <AlertTriangle size={18} style={{ color: WF.red }} />
                </div>
                <div>
                    <h3 className="font-display font-bold" style={{ color: WF.black }}>
                        Reject {app.type?.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs" style={{ color: WF.muted }}>
                        {app.user_email} · ${fmt(app.requested_amount)}
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
                        Reason <span style={{ color: WF.red }}>*</span>
                    </label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Application did not meet eligibility requirements."
                        rows={4}
                        className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-all"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                        required autoFocus />
                    <p className="text-[10px] mt-1" style={{ color: WF.muted }}>This message will be emailed to the user.</p>
                </div>
                {error && <p className="text-xs font-medium" style={{ color: WF.red }}>{error}</p>}
                <div className="flex gap-3">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.muted }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || !reason.trim()}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: WF.red }}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        {loading ? 'Rejecting…' : 'Reject & Notify'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function ProofLightbox({ url, onClose }: { url: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={onClose}>
            <div className="relative max-w-3xl max-h-[90vh] w-full mx-4" onClick={e => e.stopPropagation()}>
                <button onClick={onClose}
                    className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-bold flex items-center gap-1">
                    <X size={16} /> Close
                </button>
                <img src={url} alt="Payment proof"
                    className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            </div>
        </div>
    );
}

// ─── Sidebar list pane ────────────────────────────────────────────────────────

function SidePane({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-72 flex flex-col flex-shrink-0 overflow-hidden"
            style={{ background: WF.surface, borderRight: `1px solid ${WF.border}` }}>
            {children}
        </div>
    );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedEmail, setSelectedEmail] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState('');

    const fetchConversations = useCallback(async () => {
        const { data: msgs } = await supabase.from('messages')
            .select('user_id, created_at, content, type')
            .order('created_at', { ascending: false });
        if (!msgs) return;
        const uniqueUsers = new Map<string, any>();
        msgs.forEach(msg => { if (!uniqueUsers.has(msg.user_id)) uniqueUsers.set(msg.user_id, msg); });
        const convList = Array.from(uniqueUsers.values());
        const res = await adminFetch('/api/admin/users');
        const usersData = res.ok ? await res.json() : { users: [] };
        const emailMap: Record<string, string> = {};
        (usersData.users ?? []).forEach((u: any) => { emailMap[u.id] = u.email; });
        setConversations(convList.map(c => ({ ...c, email: emailMap[c.user_id] ?? c.user_id.slice(0, 12) + '…' })));
    }, []);

    const fetchMessages = async (userId: string) => {
        const { data } = await supabase.from('messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        setMessages(data || []);
    };

    useEffect(() => {
        fetchConversations();
        const channel = supabase.channel('admin-chat')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchConversations();
                if (selectedUser) fetchMessages(selectedUser);
            }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedUser, fetchConversations]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply || !selectedUser) return;
        await supabase.from('messages').insert([{ user_id: selectedUser, content: reply, is_admin: true, type: 'text' }]);
        setReply('');
    };

    return (
        <div className="flex h-full">
            <SidePane>
                <div className="px-5 py-4 flex justify-between items-center flex-shrink-0"
                    style={{ borderBottom: `1px solid ${WF.border}` }}>
                    <div>
                        <SectionLabel>Conversations</SectionLabel>
                        <p className="text-sm font-bold mt-0.5" style={{ color: WF.black }}>{conversations.length} active</p>
                    </div>
                    <button onClick={fetchConversations}
                        className="p-2 rounded-xl transition-all hover:shadow-sm"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                        <RefreshCw size={13} style={{ color: WF.muted }} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {conversations.length === 0 && (
                        <div className="text-center py-12">
                            <MessageCircle size={24} className="mx-auto mb-2" style={{ color: WF.border }} />
                            <p className="text-xs" style={{ color: WF.muted }}>No conversations yet</p>
                        </div>
                    )}
                    {conversations.map(conv => (
                        <div key={conv.user_id}
                            onClick={() => { setSelectedUser(conv.user_id); setSelectedEmail(conv.email); fetchMessages(conv.user_id); }}
                            className="cursor-pointer transition-all"
                            style={{
                                padding: '14px 20px',
                                borderBottom: `1px solid ${WF.border}`,
                                borderLeft: selectedUser === conv.user_id ? `3px solid ${WF.red}` : '3px solid transparent',
                                background: selectedUser === conv.user_id ? 'rgba(215,30,40,0.04)' : 'transparent',
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                    style={{ background: selectedUser === conv.user_id ? 'rgba(215,30,40,0.1)' : WF.bg, color: selectedUser === conv.user_id ? WF.red : WF.muted }}>
                                    {conv.email?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold truncate" style={{ color: WF.black }}>{conv.email}</p>
                                    <p className="text-[11px] truncate mt-0.5" style={{ color: WF.muted }}>
                                        {conv.type === 'image' ? '📷 Image' : conv.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SidePane>

            <div className="flex-1 flex flex-col" style={{ background: WF.bg }}>
                {selectedUser ? (
                    <>
                        <div className="px-6 py-4 flex-shrink-0"
                            style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ background: `linear-gradient(135deg, ${WF.red}, #7B0F15)` }}>
                                    {selectedEmail?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: WF.black }}>{selectedEmail}</p>
                                    <p className="text-[10px] font-mono" style={{ color: WF.muted }}>{selectedUser}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                    <div className="p-3 rounded-2xl max-w-[72%] text-sm leading-relaxed"
                                        style={{
                                            background: msg.is_admin ? WF.red : WF.surface,
                                            color: msg.is_admin ? '#fff' : WF.black,
                                            border: msg.is_admin ? 'none' : `1px solid ${WF.border}`,
                                            borderBottomRightRadius: msg.is_admin ? 4 : undefined,
                                            borderBottomLeftRadius: !msg.is_admin ? 4 : undefined,
                                        }}>
                                        {msg.type === 'image'
                                            ? <img src={msg.content} className="rounded-xl max-w-full" alt="upload" />
                                            : msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleReply}
                            className="px-6 py-4 flex gap-3 flex-shrink-0"
                            style={{ background: WF.surface, borderTop: `1px solid ${WF.border}` }}>
                            <input
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                                placeholder="Type a reply…"
                                value={reply}
                                onChange={e => setReply(e.target.value)} />
                            <button
                                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 flex items-center gap-2"
                                style={{ background: WF.red }}>
                                <Send size={14} /> Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <MessageCircle size={32} style={{ color: WF.border }} />
                        <p className="text-sm" style={{ color: WF.muted }}>Select a conversation to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Balance Tab ──────────────────────────────────────────────────────────────

function BalanceTab() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newBalance, setNewBalance] = useState('');
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');
    const [search, setSearch] = useState('');
    const [msgSubject, setMsgSubject] = useState('');
    const [msgBody, setMsgBody] = useState('');
    const [msgSending, setMsgSending] = useState(false);
    const [msgResult, setMsgResult] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const res = await adminFetch('/api/admin/users');
        const data = await res.json();
        setUsers(data.users ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleSetBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setSaving(true); setSavedMsg('');
        const res = await adminFetch('/api/admin/set-balance', {
            method: 'POST',
            body: JSON.stringify({ userId: selectedUser.id, balance: parseFloat(newBalance) }),
        });
        if (res.ok) {
            setSavedMsg('Balance updated successfully.');
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: parseFloat(newBalance) } : u));
            setSelectedUser((prev: any) => ({ ...prev, balance: parseFloat(newBalance) }));
            setNewBalance('');
        } else { setSavedMsg('Error saving balance'); }
        setSaving(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser?.email || !msgSubject.trim() || !msgBody.trim()) return;
        setMsgSending(true); setMsgResult('');
        const res = await adminFetch('/api/admin/send-message', {
            method: 'POST',
            body: JSON.stringify({ to: selectedUser.email, subject: msgSubject, message: msgBody }),
        });
        if (res.ok) { setMsgResult('Message sent!'); setMsgSubject(''); setMsgBody(''); }
        else { const d = await res.json(); setMsgResult(d.error ?? 'Failed to send'); }
        setMsgSending(false);
    };

    const filtered = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)
    );

    return (
        <div className="flex h-full">
            <SidePane>
                <div className="px-5 py-4 space-y-3 flex-shrink-0"
                    style={{ borderBottom: `1px solid ${WF.border}` }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <SectionLabel>All Users</SectionLabel>
                            <p className="text-sm font-bold mt-0.5" style={{ color: WF.black }}>{users.length} members</p>
                        </div>
                        <button onClick={loadUsers}
                            className="p-2 rounded-xl transition-all hover:shadow-sm"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <RefreshCw size={13} style={{ color: WF.muted }} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }} />
                        <input placeholder="Search by email…" value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none transition-all"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={18} className="animate-spin" style={{ color: WF.muted }} />
                        </div>
                    )}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Users size={24} className="mx-auto mb-2" style={{ color: WF.border }} />
                            <p className="text-xs" style={{ color: WF.muted }}>No users found</p>
                        </div>
                    )}
                    {filtered.map(user => (
                        <div key={user.id}
                            onClick={() => { setSelectedUser(user); setNewBalance(''); setSavedMsg(''); setMsgResult(''); }}
                            className="cursor-pointer transition-all"
                            style={{
                                padding: '14px 20px',
                                borderBottom: `1px solid ${WF.border}`,
                                borderLeft: selectedUser?.id === user.id ? `3px solid ${WF.red}` : '3px solid transparent',
                                background: selectedUser?.id === user.id ? 'rgba(215,30,40,0.04)' : 'transparent',
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                    style={{ background: selectedUser?.id === user.id ? 'rgba(215,30,40,0.1)' : WF.bg, color: selectedUser?.id === user.id ? WF.red : WF.muted }}>
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold truncate" style={{ color: WF.black }}>{user.email}</p>
                                    <p className="text-[11px] font-mono mt-0.5" style={{ color: WF.muted }}>
                                        ${fmt(user.balance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SidePane>

            <div className="flex-1 overflow-y-auto p-8" style={{ background: WF.bg }}>
                {selectedUser ? (
                    <div className="max-w-lg mx-auto space-y-5">
                        {/* User info card */}
                        <Card className="p-6">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold font-display flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${WF.red}, #7B0F15)` }}>
                                    {selectedUser.email?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-sm" style={{ color: WF.black }}>{selectedUser.email}</p>
                                    <p className="text-[10px] font-mono mt-0.5" style={{ color: WF.muted }}>{selectedUser.id}</p>
                                </div>
                            </div>
                            <div className="pt-5" style={{ borderTop: `1px solid ${WF.border}` }}>
                                <SectionLabel>Current Balance</SectionLabel>
                                <p className="font-display text-3xl font-bold mt-1" style={{ color: WF.black }}>
                                    ${fmt(selectedUser.balance)}
                                </p>
                            </div>
                        </Card>

                        {/* Set balance */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <DollarSign size={16} style={{ color: WF.red }} />
                                <h3 className="font-display font-bold" style={{ color: WF.black }}>Set Balance</h3>
                            </div>
                            <form onSubmit={handleSetBalance} className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: WF.muted }}>$</span>
                                    <input type="number" min="0" step="0.01" value={newBalance}
                                        onChange={e => setNewBalance(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl text-lg font-bold outline-none transition-all"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                                        required />
                                </div>
                                {savedMsg && (
                                    <p className="text-xs font-bold"
                                        style={{ color: savedMsg.includes('Error') ? WF.red : '#16A34A' }}>
                                        {savedMsg}
                                    </p>
                                )}
                                <button type="submit" disabled={saving || !newBalance}
                                    className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                                    style={{ background: WF.red }}>
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    {saving ? 'Saving…' : 'Update Balance'}
                                </button>
                            </form>
                        </Card>

                        {/* Send message */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <Mail size={16} style={{ color: WF.red }} />
                                <h3 className="font-display font-bold" style={{ color: WF.black }}>Send Email to User</h3>
                            </div>
                            <p className="text-xs mb-4" style={{ color: WF.muted }}>
                                Sends a styled email to <strong style={{ color: WF.black }}>{selectedUser.email}</strong>
                            </p>
                            <form onSubmit={handleSendMessage} className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>Subject</label>
                                    <input type="text" value={msgSubject} onChange={e => setMsgSubject(e.target.value)}
                                        placeholder="e.g. Important Account Notice"
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                                        required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>Message</label>
                                    <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)}
                                        placeholder="Type your message here…"
                                        rows={5}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                                        required />
                                </div>
                                {msgResult && (
                                    <p className="text-xs font-bold"
                                        style={{ color: msgResult.includes('sent') ? '#16A34A' : WF.red }}>
                                        {msgResult}
                                    </p>
                                )}
                                <button type="submit" disabled={msgSending || !msgSubject.trim() || !msgBody.trim()}
                                    className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                                    style={{ background: WF.red }}>
                                    {msgSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {msgSending ? 'Sending…' : 'Send Email'}
                                </button>
                            </form>
                        </Card>
                    </div>
                ) : (
                    <div className="flex-1 h-full flex flex-col items-center justify-center gap-3">
                        <Users size={32} style={{ color: WF.border }} />
                        <p className="text-sm" style={{ color: WF.muted }}>Select a user to manage their account</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED' | 'REFUNDED'>('PENDING');
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<any>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [expandedProofs, setExpandedProofs] = useState<Set<string>>(new Set());

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        const res = await adminFetch('/api/admin/transactions');
        const data = await res.json();
        setTransactions(data.transactions ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { loadTransactions(); }, [loadTransactions]);

    const handleApprove = async (txId: string) => {
        setProcessing(txId);
        const res = await adminFetch('/api/admin/approve-transaction', {
            method: 'POST',
            body: JSON.stringify({ transactionId: txId }),
        });
        if (res.ok) setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'COMPLETED' } : tx));
        else { const err = await res.json(); alert(err.error ?? 'Failed to approve'); }
        setProcessing(null);
    };

    const handleRejected = (txId: string) => {
        setTransactions(prev => prev.map(tx => {
            if (tx.id !== txId) return tx;
            const refundAt = new Date();
            refundAt.setDate(refundAt.getDate() + 7);
            return { ...tx, status: 'REJECTED', refund_at: refundAt.toISOString() };
        }));
    };

    const handleReleaseRefund = async (txId: string) => {
        setProcessing(txId);
        const res = await adminFetch('/api/admin/release-refund', {
            method: 'POST',
            body: JSON.stringify({ transactionId: txId }),
        });
        if (res.ok) setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'REFUNDED' } : tx));
        else { const err = await res.json(); alert(err.error ?? 'Cannot release yet'); }
        setProcessing(null);
    };

    const toggleProof = (id: string) => {
        setExpandedProofs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = transactions.filter(tx => filter === 'ALL' || tx.status === filter);
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    return (
        <>
            {rejectTarget && <RejectModal tx={rejectTarget} onClose={() => setRejectTarget(null)} onRejected={handleRejected} />}
            {lightboxUrl && <ProofLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

            <div className="p-8 overflow-y-auto h-full" style={{ background: WF.bg }}>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>Transactions</h2>
                            {pendingCount > 0 && (
                                <p className="text-xs mt-0.5 font-bold" style={{ color: WF.red }}>
                                    {pendingCount} pending review
                                </p>
                            )}
                        </div>
                    </div>

                    <FilterBar
                        options={['PENDING', 'COMPLETED', 'REJECTED', 'REFUNDED', 'ALL']}
                        value={filter}
                        onChange={v => setFilter(v as any)}
                        onRefresh={loadTransactions}
                    />

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin" style={{ color: WF.muted }} />
                        </div>
                    )}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-16">
                            <Activity size={28} className="mx-auto mb-3" style={{ color: WF.border }} />
                            <p className="text-sm font-bold" style={{ color: WF.black }}>No {filter.toLowerCase()} transactions</p>
                            <p className="text-xs mt-1" style={{ color: WF.muted }}>They'll appear here when available.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {filtered.map(tx => {
                            const days = tx.refund_at ? daysUntil(tx.refund_at) : null;
                            const refundReady = days !== null && days <= 0;
                            const isDeposit = tx.direction === 'DEPOSIT';

                            return (
                                <Card key={tx.id} className="p-5">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: isDeposit ? 'rgba(18,183,106,0.1)' : 'rgba(215,30,40,0.08)' }}>
                                                {isDeposit
                                                    ? <ArrowDownLeft size={16} style={{ color: '#12B76A' }} />
                                                    : <ArrowUpRight size={16} style={{ color: WF.red }} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: WF.black }}>
                                                    {tx.direction} — {tx.type?.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: WF.muted }}>{tx.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-bold"
                                                style={{ color: isDeposit ? '#12B76A' : WF.red }}>
                                                {isDeposit ? '+' : '-'}${fmt(tx.amount)}
                                            </p>
                                            <div className="mt-1"><StatusBadge status={tx.status} /></div>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="text-xs space-y-1 mb-4 pt-3"
                                        style={{ borderTop: `1px solid ${WF.border}`, color: WF.muted }}>
                                        <p className="font-mono">ID: {tx.id}</p>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={11} />
                                            <span>{new Date(tx.created_at).toLocaleString()}</span>
                                        </div>
                                        {tx.bank_name && <p>Bank: {tx.bank_name}</p>}
                                        {tx.account_number && <p>Account: {tx.account_number}</p>}
                                        {tx.routing && <p>Routing: {tx.routing}</p>}
                                        {tx.wallet_to && <p className="font-mono break-all">Wallet: {tx.wallet_to}</p>}
                                    </div>

                                    {/* Rejection reason */}
                                    {tx.status === 'REJECTED' && tx.notes && (
                                        <div className="rounded-xl p-3 mb-3 text-xs"
                                            style={{ background: 'rgba(215,30,40,0.06)', border: `1px solid rgba(215,30,40,0.12)` }}>
                                            <SectionLabel>Rejection reason</SectionLabel>
                                            <p className="mt-1" style={{ color: '#991B1B' }}>{tx.notes}</p>
                                        </div>
                                    )}

                                    {/* Refund countdown */}
                                    {tx.status === 'REJECTED' && tx.refund_at && (
                                        <div className="rounded-xl p-3 mb-3 text-xs"
                                            style={{
                                                background: refundReady ? 'rgba(22,163,74,0.08)' : 'rgba(245,158,11,0.08)',
                                                border: `1px solid ${refundReady ? 'rgba(22,163,74,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                            }}>
                                            <p className="font-bold mb-0.5"
                                                style={{ color: refundReady ? '#14532D' : '#92400E' }}>
                                                {refundReady ? '✓ Refund Ready' : `⏳ ${days} day${days !== 1 ? 's' : ''} remaining`}
                                            </p>
                                            <p style={{ color: refundReady ? '#166534' : '#92400E' }}>
                                                {refundReady
                                                    ? 'Hold period ended — release the refund now.'
                                                    : `Available ${new Date(tx.refund_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Proof image */}
                                    {tx.proof_url && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <button onClick={() => toggleProof(tx.id)}
                                                    className="text-xs font-bold flex items-center gap-1.5 hover:underline"
                                                    style={{ color: WF.red }}>
                                                    <Eye size={12} />
                                                    {expandedProofs.has(tx.id) ? 'Hide proof' : 'View proof'}
                                                </button>
                                                <button onClick={() => setLightboxUrl(tx.proof_url)}
                                                    className="text-xs hover:underline" style={{ color: WF.muted }}>
                                                    ↗ Fullscreen
                                                </button>
                                            </div>
                                            {expandedProofs.has(tx.id) && (
                                                <img src={tx.proof_url} alt="Payment proof"
                                                    className="w-full rounded-xl object-contain max-h-64 cursor-zoom-in"
                                                    style={{ border: `1px solid ${WF.border}` }}
                                                    onClick={() => setLightboxUrl(tx.proof_url)} />
                                            )}
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    {tx.status === 'PENDING' && (
                                        <div className="flex gap-2 pt-3" style={{ borderTop: `1px solid ${WF.border}` }}>
                                            <button onClick={() => handleApprove(tx.id)} disabled={processing === tx.id}
                                                className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                                style={{ background: '#12B76A' }}>
                                                {processing === tx.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                                Approve{isDeposit ? ' + Credit' : ''}
                                            </button>
                                            <button onClick={() => setRejectTarget(tx)} disabled={processing === tx.id}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                                style={{ background: 'rgba(215,30,40,0.08)', color: WF.red, border: `1px solid rgba(215,30,40,0.2)` }}>
                                                <X size={14} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {tx.status === 'REJECTED' && (
                                        <div className="pt-3" style={{ borderTop: `1px solid ${WF.border}` }}>
                                            <button onClick={() => handleReleaseRefund(tx.id)}
                                                disabled={!refundReady || processing === tx.id}
                                                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                                style={{
                                                    background: refundReady ? 'rgba(124,58,237,0.1)' : WF.bg,
                                                    color: refundReady ? '#4C1D95' : WF.muted,
                                                    border: `1px solid ${refundReady ? 'rgba(124,58,237,0.2)' : WF.border}`,
                                                    cursor: refundReady ? 'pointer' : 'not-allowed',
                                                }}>
                                                {processing === tx.id && <Loader2 size={12} className="animate-spin" />}
                                                {refundReady ? 'Release Refund to User' : `Refund locked · ${days} day${days !== 1 ? 's' : ''} left`}
                                            </button>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────

function ApplicationsTab() {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<any>(null);
    const [approveAmounts, setApproveAmounts] = useState<Record<string, string>>({});

    const loadApps = useCallback(async () => {
        setLoading(true);
        const res = await adminFetch('/api/admin/applications');
        const data = await res.json();
        setApps(data.applications ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { loadApps(); }, [loadApps]);

    const handleApprove = async (app: any) => {
        const amtStr = approveAmounts[app.id] ?? String(app.requested_amount);
        const amount = parseFloat(amtStr);
        if (isNaN(amount) || amount < 0) { alert('Enter a valid approved amount.'); return; }
        setProcessing(app.id);
        const res = await adminFetch('/api/admin/approve-application', {
            method: 'POST',
            body: JSON.stringify({ applicationId: app.id, approvedAmount: amount }),
        });
        if (res.ok) setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'APPROVED', approved_amount: amount } : a));
        else { const d = await res.json(); alert(d.error ?? 'Failed to approve'); }
        setProcessing(null);
    };

    const handleRejected = (id: string) => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
    };

    const filtered = apps.filter(a => filter === 'ALL' || a.status === filter);
    const pendingCount = apps.filter(a => a.status === 'PENDING').length;

    const typeBadge: Record<string, { bg: string; color: string }> = {
        LOAN:      { bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8' },
        GRANT:     { bg: 'rgba(16,185,129,0.1)',  color: '#065F46' },
        TAX_REFUND:{ bg: 'rgba(124,58,237,0.1)',  color: '#4C1D95' },
    };

    return (
        <>
            {rejectTarget && <RejectAppModal app={rejectTarget} onClose={() => setRejectTarget(null)} onRejected={handleRejected} />}

            <div className="p-8 overflow-y-auto h-full" style={{ background: WF.bg }}>
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>Applications</h2>
                            {pendingCount > 0 && (
                                <p className="text-xs mt-0.5 font-bold" style={{ color: WF.red }}>
                                    {pendingCount} awaiting decision
                                </p>
                            )}
                        </div>
                    </div>

                    <FilterBar
                        options={['PENDING', 'APPROVED', 'REJECTED', 'ALL']}
                        value={filter}
                        onChange={v => setFilter(v as any)}
                        onRefresh={loadApps}
                    />

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin" style={{ color: WF.muted }} />
                        </div>
                    )}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-16">
                            <FileText size={28} className="mx-auto mb-3" style={{ color: WF.border }} />
                            <p className="text-sm font-bold" style={{ color: WF.black }}>No {filter.toLowerCase()} applications</p>
                            <p className="text-xs mt-1" style={{ color: WF.muted }}>They'll appear here when submitted.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {filtered.map(app => {
                            const badge = typeBadge[app.type] ?? { bg: WF.bg, color: WF.muted };
                            return (
                                <Card key={app.id} className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: badge.bg }}>
                                                <FileText size={16} style={{ color: badge.color }} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold" style={{ color: WF.black }}>
                                                        {app.type?.replace(/_/g, ' ')}
                                                    </p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                        style={{ background: badge.bg, color: badge.color }}>
                                                        {app.type?.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-0.5" style={{ color: WF.muted }}>{app.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-bold" style={{ color: WF.black }}>
                                                ${fmt(app.requested_amount)}
                                            </p>
                                            <div className="mt-1"><StatusBadge status={app.status} /></div>
                                        </div>
                                    </div>

                                    <div className="text-xs space-y-1 mb-4 pt-3"
                                        style={{ borderTop: `1px solid ${WF.border}`, color: WF.muted }}>
                                        <p className="font-mono">ID: {app.id}</p>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={11} />
                                            <span>{new Date(app.created_at).toLocaleString()}</span>
                                        </div>
                                        {app.status === 'APPROVED' && app.approved_amount != null && (
                                            <p className="font-bold" style={{ color: '#14532D' }}>
                                                Approved: ${fmt(app.approved_amount)}
                                            </p>
                                        )}
                                    </div>

                                    {app.notes && app.status === 'REJECTED' && (
                                        <div className="rounded-xl p-3 mb-4 text-xs"
                                            style={{ background: 'rgba(215,30,40,0.06)', border: `1px solid rgba(215,30,40,0.12)` }}>
                                            <SectionLabel>Rejection reason</SectionLabel>
                                            <p className="mt-1" style={{ color: '#991B1B' }}>{app.notes}</p>
                                        </div>
                                    )}

                                    {app.status === 'PENDING' && (
                                        <div className="pt-3 space-y-3" style={{ borderTop: `1px solid ${WF.border}` }}>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: WF.muted }}>
                                                    Approved Amount
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: WF.muted }}>$</span>
                                                    <input type="number" min="0" step="0.01"
                                                        value={approveAmounts[app.id] ?? app.requested_amount}
                                                        onChange={e => setApproveAmounts(prev => ({ ...prev, [app.id]: e.target.value }))}
                                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-bold outline-none transition-all"
                                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                                                </div>
                                                <p className="text-[10px] mt-1" style={{ color: WF.muted }}>Edit to override requested amount.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(app)} disabled={processing === app.id}
                                                    className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                                    style={{ background: '#12B76A' }}>
                                                    {processing === app.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                                    Approve & Credit
                                                </button>
                                                <button onClick={() => setRejectTarget(app)} disabled={processing === app.id}
                                                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                                    style={{ background: 'rgba(215,30,40,0.08)', color: WF.red, border: `1px solid rgba(215,30,40,0.2)` }}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Payment Settings Tab ─────────────────────────────────────────────────────

const PAYMENT_FIELDS = [
    {
        group: 'Crypto Wallets',
        icon: Bitcoin,
        accent: '#F7931A',
        fields: [
            { key: 'btc_address',  label: 'Bitcoin (BTC) Address',  placeholder: 'bc1q…',  mono: true },
            { key: 'usdt_address', label: 'Tether (USDT) Address',  placeholder: '0x…',    mono: true },
        ],
    },
    {
        group: 'Wire Transfer',
        icon: Building2,
        accent: WF.red,
        fields: [
            { key: 'wire_bank_name', label: 'Bank Name',       placeholder: 'West Bank, N.A.', mono: false },
            { key: 'wire_routing',   label: 'Routing Number',  placeholder: '021000021',       mono: true  },
            { key: 'wire_account',   label: 'Account Number',  placeholder: '987654321',       mono: true  },
        ],
    },
    {
        group: 'Zelle & QuickPay',
        icon: Smartphone,
        accent: '#6D28D9',
        fields: [
            { key: 'zelle_email',    label: 'Zelle Email',            placeholder: 'pay@westbank.com',      mono: false },
            { key: 'quickpay_email', label: 'Chase QuickPay Email',   placeholder: 'quickpay@westbank.com', mono: false },
        ],
    },
    {
        group: 'ACH Transfer',
        icon: DollarSign,
        accent: '#0369A1',
        fields: [
            { key: 'ach_routing', label: 'ACH Routing', placeholder: '021000021', mono: true },
            { key: 'ach_corp_id', label: 'Corp ID',     placeholder: '99-10293',  mono: true },
        ],
    },
    {
        group: 'Direct Deposit',
        icon: CreditCard,
        accent: '#0F766E',
        fields: [
            { key: 'dd_routing', label: 'Routing Number', placeholder: '021000021', mono: true },
            { key: 'dd_account', label: 'Account Number', placeholder: '987654321', mono: true },
        ],
    },
];

function PaymentSettingsTab() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');
    const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

    const loadSettings = useCallback(async () => {
        setLoading(true);
        const res = await adminFetch('/api/admin/payment-settings');
        if (res.ok) {
            const data = await res.json();
            setSettings(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setChangedKeys(prev => new Set(prev).add(key));
        setSavedMsg('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setSavedMsg('');
        const payload: Record<string, string> = {};
        changedKeys.forEach(k => { if (settings[k] !== undefined) payload[k] = settings[k]; });
        const res = await adminFetch('/api/admin/payment-settings', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setSavedMsg('Payment information saved successfully.');
            setChangedKeys(new Set());
        } else {
            const d = await res.json();
            setSavedMsg('Error: ' + (d.error ?? 'Save failed'));
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin" style={{ color: WF.muted }} />
        </div>
    );

    return (
        <div className="p-8 overflow-y-auto h-full" style={{ background: WF.bg }}>
            <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>Payment Information</h2>
                        <p className="text-xs mt-1" style={{ color: WF.muted }}>
                            These details are shown to users when they deposit funds. Changes take effect immediately.
                        </p>
                    </div>
                    {changedKeys.size > 0 && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#92400E' }}>
                            {changedKeys.size} unsaved change{changedKeys.size !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Field groups */}
                {PAYMENT_FIELDS.map(({ group, icon: Icon, accent, fields }) => (
                    <Card key={group} className="p-6">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: `${accent}15` }}>
                                <Icon size={15} style={{ color: accent }} />
                            </div>
                            <h3 className="font-display font-bold" style={{ color: WF.black }}>{group}</h3>
                        </div>

                        <div className="space-y-4">
                            {fields.map(({ key, label, placeholder, mono }) => {
                                const isDirty = changedKeys.has(key);
                                return (
                                    <div key={key}>
                                        <label className="text-xs font-bold block mb-1.5 flex items-center gap-2"
                                            style={{ color: WF.black }}>
                                            {label}
                                            {isDirty && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                                    style={{ background: 'rgba(245,158,11,0.12)', color: '#92400E' }}>
                                                    modified
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={settings[key] ?? ''}
                                            onChange={e => handleChange(key, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                            style={{
                                                background: WF.bg,
                                                border: `1.5px solid ${isDirty ? accent : WF.border}`,
                                                color: WF.black,
                                                fontFamily: mono ? 'monospace' : 'inherit',
                                                letterSpacing: mono ? '-0.02em' : undefined,
                                                boxShadow: isDirty ? `0 0 0 3px ${accent}15` : undefined,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}

                {/* Result message */}
                {savedMsg && (
                    <p className="text-sm font-bold text-center"
                        style={{ color: savedMsg.startsWith('Error') ? WF.red : '#16A34A' }}>
                        {savedMsg}
                    </p>
                )}

                {/* Save button */}
                <button type="submit" disabled={saving || changedKeys.size === 0}
                    className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: WF.red, boxShadow: '0 8px 20px -6px rgba(215,30,40,0.35)' }}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving…' : changedKeys.size === 0 ? 'No changes to save' : `Save ${changedKeys.size} change${changedKeys.size !== 1 ? 's' : ''}`}
                </button>

                {/* Info note */}
                <div className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: 'rgba(215,30,40,0.05)', border: `1px solid rgba(215,30,40,0.12)` }}>
                    <ShieldCheck size={14} style={{ color: WF.red, flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#7B0F15' }}>
                        Changes are stored in your Supabase database and served live to users.
                        Make sure all addresses and account numbers are correct before saving.
                    </p>
                </div>
            </form>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
    const [authed, setAuthed] = useState(false);
    const [tab, setTab] = useState<'chat' | 'balance' | 'transactions' | 'applications' | 'settings'>('balance');

    useEffect(() => {
        if (sessionStorage.getItem(ADMIN_PASSWORD_KEY)) setAuthed(true);
    }, []);

    if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

    const tabs = [
        { id: 'balance' as const,       label: 'Users',          icon: Users        },
        { id: 'transactions' as const,  label: 'Transactions',   icon: TrendingUp   },
        { id: 'applications' as const,  label: 'Applications',   icon: FileText     },
        { id: 'chat' as const,          label: 'Live Chat',      icon: MessageCircle},
        { id: 'settings' as const,      label: 'Payment Info',   icon: Settings     },
    ];

    return (
        <div className="flex flex-col h-screen font-sans" style={{ background: WF.bg }}>
            {/* Header */}
            <header className="flex-shrink-0 px-8 py-0 flex items-center justify-between"
                style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}`, height: 64 }}>
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="font-display text-xl font-bold italic" style={{ color: WF.red }}>West</span>
                        <span className="font-display text-xl font-bold" style={{ color: WF.black }}>Bank</span>
                    </div>
                    <div className="h-4 w-px mx-1" style={{ background: WF.border }} />
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(215,30,40,0.08)', border: '1px solid rgba(215,30,40,0.15)' }}>
                        <ShieldCheck size={11} style={{ color: WF.red }} />
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: WF.red }}>
                            Admin
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <nav className="flex items-center gap-1">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: tab === t.id ? WF.red : 'transparent',
                                color: tab === t.id ? '#fff' : WF.muted,
                            }}>
                            <t.icon size={14} />
                            {t.label}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {tab === 'chat'         && <ChatTab />}
                {tab === 'balance'      && <BalanceTab />}
                {tab === 'transactions' && <TransactionsTab />}
                {tab === 'settings'     && <PaymentSettingsTab />}
                {tab === 'applications' && <ApplicationsTab />}
            </div>
        </div>
    );
}
