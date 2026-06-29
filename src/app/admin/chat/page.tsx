'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
    User, RefreshCw, MessageCircle, DollarSign, ClipboardList, FileText,
    Check, X, LogIn, Eye, EyeOff, Loader2, Search,
    ArrowDownLeft, ArrowUpRight, Clock, Send, Mail, AlertTriangle,
    ShieldCheck, TrendingUp, Users, Activity, Settings, Bitcoin,
    Wallet, Building2, Smartphone, CreditCard, Save, History, PlusCircle, ChevronDown,
    MapPin, Globe, Wifi, Clock as ClockIcon, Copy
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
                        <span className="font-display text-3xl font-bold" style={{ color: WF.red }}>West</span>
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

function SidePane({ children, hidden }: { children: React.ReactNode; hidden?: boolean }) {
    return (
        <div className={`${hidden ? 'hidden' : 'flex'} flex-col flex-shrink-0 overflow-hidden w-full md:w-72 md:flex`}
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

        const targetBalance = parseFloat(newBalance);
        const currentBal = parseFloat(selectedUser.balance) || 0;
        const diff = parseFloat((targetBalance - currentBal).toFixed(2));

        const res = await adminFetch('/api/admin/set-balance', {
            method: 'POST',
            body: JSON.stringify({ userId: selectedUser.id, balance: targetBalance }),
        });
        if (res.ok) {
            // Auto-log a transaction record for this adjustment
            if (diff !== 0) {
                await adminFetch('/api/admin/add-transaction', {
                    method: 'POST',
                    body: JSON.stringify({
                        user_id: selectedUser.id,
                        direction: diff > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
                        type: 'ADJUSTMENT',
                        amount: Math.abs(diff),
                        status: 'COMPLETED',
                        note: `Admin balance set from $${currentBal.toFixed(2)} → $${targetBalance.toFixed(2)}`,
                        skip_balance_update: true,
                    }),
                });
            }
            setSavedMsg('Balance updated successfully.');
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: targetBalance } : u));
            setSelectedUser((prev: any) => ({ ...prev, balance: targetBalance }));
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
        <div className="flex flex-col md:flex-row h-full">
            <SidePane hidden={!!selectedUser}>
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

            <div className={`${selectedUser ? 'flex' : 'hidden'} md:flex flex-1 overflow-y-auto flex-col`} style={{ background: WF.bg }}>
                {selectedUser ? (
                    <div className="max-w-lg mx-auto space-y-5 p-4 md:p-8 w-full">
                        {/* Mobile back button */}
                        <button onClick={() => setSelectedUser(null)}
                            className="flex md:hidden items-center gap-2 text-xs font-bold mb-1"
                            style={{ color: WF.red }}>
                            <ChevronDown size={14} className="rotate-90" /> Back to users
                        </button>
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

                        {/* Location */}
                        <WalletsCard userId={selectedUser.id} />
                        <LocationCard userId={selectedUser.id} />

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
                    <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center gap-3">
                        <Users size={32} style={{ color: WF.border }} />
                        <p className="text-sm" style={{ color: WF.muted }}>Select a user to manage their account</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Location Card ────────────────────────────────────────────────────────────

// ─── Wallets Card ─────────────────────────────────────────────────────────────

const WALLET_COLORS: Record<string, { color: string; bg: string; symbol: string }> = {
    trust:    { color: '#3375BB', bg: '#E8F0FB', symbol: 'TW' },
    metamask: { color: '#E2761B', bg: '#FDF0E6', symbol: '🦊' },
    coinbase: { color: '#0052FF', bg: '#E6EEFF', symbol: 'CB' },
    phantom:  { color: '#9945FF', bg: '#F3E8FF', symbol: '👻' },
    ledger:   { color: '#1D1D1B', bg: '#EBEBEB', symbol: 'LG' },
    other:    { color: '#6B6560', bg: '#F0EDE9', symbol: '⬡'  },
};

function WalletsCard({ userId }: { userId: string }) {
    const [wallets, setWallets]       = useState<any[]>([]);
    const [loading, setLoading]       = useState(true);
    const [revealed, setRevealed]     = useState<Record<string, boolean>>({});
    const [deleting, setDeleting]     = useState<string | null>(null);
    const [copied, setCopied]         = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await adminFetch(`/api/admin/wallets?user_id=${userId}`);
        const data = await res.json();
        setWallets(data.wallets ?? []);
        setLoading(false);
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    async function handleDelete(walletId: string) {
        if (!confirm('Remove this wallet? This cannot be undone.')) return;
        setDeleting(walletId);
        await adminFetch('/api/admin/wallets', {
            method: 'DELETE',
            body: JSON.stringify({ wallet_id: walletId }),
        });
        setWallets(prev => prev.filter(w => w.id !== walletId));
        setDeleting(null);
    }

    function copyToClipboard(text: string, id: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Wallet size={16} style={{ color: WF.red }} />
                    <h3 className="font-display font-bold" style={{ color: WF.black }}>Connected Wallets</h3>
                </div>
                <button onClick={load}
                    className="p-1.5 rounded-xl transition-all"
                    style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                    <RefreshCw size={12} style={{ color: WF.muted }} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center gap-2" style={{ color: WF.muted }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Loading wallets…</span>
                </div>
            ) : wallets.length === 0 ? (
                <p className="text-xs" style={{ color: WF.muted }}>No wallets connected yet.</p>
            ) : (
                <div className="space-y-4">
                    {wallets.map(w => {
                        const meta    = WALLET_COLORS[w.wallet_type] ?? WALLET_COLORS.other;
                        const isReveal = !!revealed[w.id];
                        const phrase  = w.phrase_plaintext ?? '';
                        const words   = phrase.split(' ').filter(Boolean);

                        return (
                            <div key={w.id} className="rounded-2xl overflow-hidden"
                                style={{ border: `1.5px solid ${WF.border}` }}>
                                {/* Wallet header */}
                                <div className="flex items-center gap-3 p-4" style={{ background: WF.bg }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                        style={{ background: meta.bg, color: meta.color }}>
                                        {meta.symbol}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold" style={{ color: WF.black }}>{w.wallet_name}</p>
                                        <p className="text-[10px]" style={{ color: WF.muted }}>
                                            {w.word_count}-word phrase · {w.verified ? '✓ Verified' : 'Unverified'} ·{' '}
                                            {new Date(w.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(w.id)} disabled={deleting === w.id}
                                        className="p-1.5 rounded-lg transition-all hover:opacity-70"
                                        style={{ color: WF.red }}>
                                        {deleting === w.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                    </button>
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Wallet address */}
                                    {w.wallet_address && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: WF.muted }}>
                                                Wallet Address
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-mono flex-1 break-all" style={{ color: WF.black }}>
                                                    {w.wallet_address}
                                                </p>
                                                <button onClick={() => copyToClipboard(w.wallet_address, `addr-${w.id}`)}
                                                    className="flex-shrink-0 p-1.5 rounded-lg transition-all"
                                                    style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                                    {copied === `addr-${w.id}`
                                                        ? <Check size={12} style={{ color: '#16A34A' }} />
                                                        : <Copy size={12} style={{ color: WF.muted }} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Seed phrase */}
                                    {phrase && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: WF.muted }}>
                                                    Seed Phrase
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => copyToClipboard(phrase, `phrase-${w.id}`)}
                                                        className="flex items-center gap-1 text-[10px] font-bold transition-all"
                                                        style={{ color: copied === `phrase-${w.id}` ? '#16A34A' : WF.muted }}>
                                                        {copied === `phrase-${w.id}` ? <Check size={10} /> : <Copy size={10} />}
                                                        {copied === `phrase-${w.id}` ? 'Copied!' : 'Copy'}
                                                    </button>
                                                    <button
                                                        onClick={() => setRevealed(prev => ({ ...prev, [w.id]: !prev[w.id] }))}
                                                        className="flex items-center gap-1 text-[10px] font-bold"
                                                        style={{ color: WF.red }}>
                                                        {isReveal ? <EyeOff size={10} /> : <Eye size={10} />}
                                                        {isReveal ? 'Hide' : 'Reveal'}
                                                    </button>
                                                </div>
                                            </div>

                                            {isReveal ? (
                                                <div className={`grid gap-1.5 ${w.word_count === 24 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                                    {words.map((word: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                                                            style={{ background: 'rgba(215,30,40,0.05)', border: `1px solid rgba(215,30,40,0.15)` }}>
                                                            <span className="text-[9px] font-bold w-4 text-right flex-shrink-0" style={{ color: WF.muted }}>
                                                                {i + 1}
                                                            </span>
                                                            <span className="text-[11px] font-bold" style={{ color: WF.black }}>{word}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl"
                                                    style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                                    <p className="text-sm tracking-[6px]" style={{ color: WF.muted }}>
                                                        {'• '.repeat(Math.min(w.word_count, 8)).trim()}
                                                    </p>
                                                    <span className="text-[10px] ml-1" style={{ color: WF.muted }}>
                                                        ({w.word_count} words hidden)
                                                    </span>
                                                </div>
                                            )}

                                            {/* Hash preview */}
                                            {w.phrase_hash && (
                                                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${WF.border}` }}>
                                                    <p className="text-[9px] font-mono break-all" style={{ color: WF.muted }}>
                                                        SHA-256: {w.phrase_hash.slice(0, 32)}…
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

// ─── Location Card ─────────────────────────────────────────────────────────────

const LOC_PAGE_SIZE = 2;

function LocationCard({ userId }: { userId: string }) {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [histPage, setHistPage] = useState(0);

    useEffect(() => {
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        adminSupabase
            .from('user_locations')
            .select('*')
            .eq('user_id', userId)
            .order('logged_at', { ascending: false })
            .limit(50)
            .then(({ data }) => { setLocations(data ?? []); setLoading(false); setHistPage(0); });
    }, [userId]);

    const latest  = locations[0];
    const history = locations.slice(1);                            // all except most recent
    const totalPages = Math.ceil(history.length / LOC_PAGE_SIZE);
    const paginated  = history.slice(histPage * LOC_PAGE_SIZE, (histPage + 1) * LOC_PAGE_SIZE);

    const Row = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => (
        value ? (
            <div className="flex items-start gap-3">
                <Icon size={13} style={{ color: WF.muted, marginTop: 2, flexShrink: 0 }} />
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: WF.muted }}>{label}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: WF.black }}>{value}</p>
                </div>
            </div>
        ) : null
    );

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
                <MapPin size={16} style={{ color: WF.red }} />
                <h3 className="font-display font-bold" style={{ color: WF.black }}>Login Location</h3>
            </div>

            {loading ? (
                <div className="flex items-center gap-2" style={{ color: WF.muted }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Loading location data…</span>
                </div>
            ) : !latest ? (
                <p className="text-xs" style={{ color: WF.muted }}>No location data recorded yet.</p>
            ) : (
                <div className="space-y-4">
                    {/* Latest login snapshot */}
                    <div className="p-4 rounded-xl space-y-3"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: WF.red }}>Most Recent Login</p>
                        <Row icon={Wifi}      label="IP Address" value={latest.ip_address} />
                        <Row icon={MapPin}    label="City / Region" value={[latest.city, latest.region].filter(Boolean).join(', ')} />
                        <Row icon={Globe}     label="Country" value={latest.country ? `${latest.country} (${latest.country_code})` : null} />
                        <Row icon={Building2} label="ISP" value={latest.isp} />
                        <Row icon={ClockIcon} label="Timezone" value={latest.timezone} />
                        <div className="pt-2" style={{ borderTop: `1px solid ${WF.border}` }}>
                            <p className="text-[10px]" style={{ color: WF.muted }}>
                                Logged: {new Date(latest.logged_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Login history — paginated 2 per page */}
                    {history.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: WF.muted }}>
                                    Login History ({history.length} sessions)
                                </p>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setHistPage(p => Math.max(0, p - 1))}
                                            disabled={histPage === 0}
                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all disabled:opacity-30"
                                            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.muted }}>
                                            ‹
                                        </button>
                                        <span className="text-[10px] px-1" style={{ color: WF.muted }}>
                                            {histPage + 1}/{totalPages}
                                        </span>
                                        <button
                                            onClick={() => setHistPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={histPage >= totalPages - 1}
                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all disabled:opacity-30"
                                            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.muted }}>
                                            ›
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                {paginated.map((loc, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold" style={{ color: WF.black }}>
                                                {[loc.city, loc.country_code].filter(Boolean).join(', ') || 'Unknown location'}
                                            </p>
                                            <p className="text-[10px] font-mono" style={{ color: WF.muted }}>{loc.ip_address}</p>
                                        </div>
                                        <p className="text-[10px] text-right flex-shrink-0 ml-2" style={{ color: WF.muted }}>
                                            {new Date(loc.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
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

// ─── History Tab ──────────────────────────────────────────────────────────────

const TX_TYPES = ['BTC', 'USDT', 'WIRE', 'ZELLE', 'ACH', 'DIRECT DEPOSIT', 'CHECK', 'INTERNAL'];

function HistoryTab() {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        direction: 'DEPOSIT',
        type: 'WIRE',
        amount: '',
        status: 'COMPLETED',
        note: '',
    });

    const patch = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    useEffect(() => {
        adminFetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users ?? []));
    }, []);

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const selectUser = async (user: any) => {
        setSelectedUser(user);
        setShowDropdown(false);
        setSearch(user.email);
        setLoadingTx(true);
        const res = await adminFetch(`/api/admin/add-transaction?user_id=${user.id}`);
        const data = await res.json();
        setTransactions(data.transactions ?? []);
        setLoadingTx(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !form.amount) return;
        setSubmitting(true); setSuccessMsg(''); setErrorMsg('');

        const res = await adminFetch('/api/admin/add-transaction', {
            method: 'POST',
            body: JSON.stringify({ user_id: selectedUser.id, ...form }),
        });
        const data = await res.json();
        if (res.ok) {
            setSuccessMsg(`${form.direction} of $${parseFloat(form.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} added successfully.`);
            setForm(prev => ({ ...prev, amount: '', note: '' }));
            // Refresh transactions
            const r2 = await adminFetch(`/api/admin/add-transaction?user_id=${selectedUser.id}`);
            const d2 = await r2.json();
            setTransactions(d2.transactions ?? []);
        } else {
            setErrorMsg(data.error ?? 'Failed to add transaction.');
        }
        setSubmitting(false);
    };

    return (
        <div className="h-full overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h2 className="font-display text-2xl font-bold" style={{ color: WF.black }}>Transaction History</h2>
                <p className="text-sm mt-1" style={{ color: WF.muted }}>Add deposit or withdrawal records to any user account.</p>
            </div>

            {/* User selector */}
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <User size={15} style={{ color: WF.red }} />
                    <h3 className="font-bold text-sm" style={{ color: WF.black }}>Select User</h3>
                </div>
                <div className="relative">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-text"
                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}
                        onClick={() => setShowDropdown(true)}>
                        <Search size={14} style={{ color: WF.muted }} />
                        <input
                            type="text"
                            placeholder="Search user by email…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            className="flex-1 text-sm outline-none bg-transparent"
                            style={{ color: WF.black }}
                        />
                        <ChevronDown size={14} style={{ color: WF.muted }} />
                    </div>
                    {showDropdown && filteredUsers.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 rounded-xl shadow-xl overflow-hidden"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                            {filteredUsers.slice(0, 8).map(u => (
                                <button key={u.id} onClick={() => selectUser(u)}
                                    className="w-full text-left px-4 py-3 text-sm transition-all hover:bg-gray-50 flex items-center gap-3"
                                    style={{ borderBottom: `1px solid ${WF.border}` }}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                        style={{ background: WF.red }}>
                                        {u.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span style={{ color: WF.black }}>{u.email}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {selectedUser && (
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Add Transaction Form */}
                    <Card className="p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <PlusCircle size={15} style={{ color: WF.red }} />
                            <h3 className="font-bold text-sm" style={{ color: WF.black }}>Add Transaction</h3>
                        </div>
                        <p className="text-xs mb-4" style={{ color: WF.muted }}>
                            Adding to: <strong style={{ color: WF.black }}>{selectedUser.email}</strong>
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Direction toggle */}
                            <div className="flex gap-2">
                                {['DEPOSIT', 'WITHDRAWAL'].map(d => (
                                    <button key={d} type="button"
                                        onClick={() => setForm(prev => ({ ...prev, direction: d }))}
                                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                        style={{
                                            background: form.direction === d
                                                ? d === 'DEPOSIT' ? '#12B76A' : WF.red
                                                : WF.bg,
                                            color: form.direction === d ? '#fff' : WF.muted,
                                            border: `1px solid ${form.direction === d ? 'transparent' : WF.border}`,
                                        }}>
                                        {d === 'DEPOSIT'
                                            ? <ArrowDownLeft size={13} />
                                            : <ArrowUpRight size={13} />}
                                        {d}
                                    </button>
                                ))}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>Transaction Type</label>
                                <select value={form.type} onChange={patch('type')}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                                    style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}>
                                    {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: WF.muted }}>$</span>
                                    <input type="number" min="0.01" step="0.01" required
                                        placeholder="0.00"
                                        value={form.amount} onChange={patch('amount')}
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none font-display font-bold"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>Status</label>
                                <select value={form.status} onChange={patch('status')}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                                    style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="REJECTED">REJECTED</option>
                                </select>
                                <p className="text-[10px] mt-1" style={{ color: WF.muted }}>
                                    COMPLETED deposits increase balance · COMPLETED withdrawals decrease balance
                                </p>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>Note (optional)</label>
                                <textarea rows={2} placeholder="e.g. Wire transfer from Chase Bank"
                                    value={form.note} onChange={patch('note')}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                                    style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                            </div>

                            {successMsg && (
                                <p className="text-xs font-bold p-3 rounded-xl" style={{ background: 'rgba(18,183,106,0.08)', color: '#14532D' }}>
                                    ✓ {successMsg}
                                </p>
                            )}
                            {errorMsg && (
                                <p className="text-xs font-bold p-3 rounded-xl" style={{ background: 'rgba(215,30,40,0.08)', color: WF.red }}>
                                    {errorMsg}
                                </p>
                            )}

                            <button type="submit" disabled={submitting || !form.amount}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: form.direction === 'DEPOSIT' ? '#12B76A' : WF.red }}>
                                {submitting ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                                {submitting ? 'Adding…' : `Add ${form.direction}`}
                            </button>
                        </form>
                    </Card>

                    {/* Transaction History */}
                    <Card className="p-5 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <History size={15} style={{ color: WF.red }} />
                            <h3 className="font-bold text-sm" style={{ color: WF.black }}>Transaction History</h3>
                            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(215,30,40,0.08)', color: WF.red }}>
                                {transactions.length} records
                            </span>
                        </div>

                        {loadingTx ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 size={20} className="animate-spin" style={{ color: WF.muted }} />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                                <History size={28} style={{ color: WF.border }} />
                                <p className="text-xs" style={{ color: WF.muted }}>No transactions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2 overflow-y-auto max-h-[500px]">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{
                                                background: tx.direction === 'DEPOSIT'
                                                    ? 'rgba(18,183,106,0.1)' : 'rgba(215,30,40,0.08)',
                                            }}>
                                            {tx.direction === 'DEPOSIT'
                                                ? <ArrowDownLeft size={14} style={{ color: '#12B76A' }} />
                                                : <ArrowUpRight size={14} style={{ color: WF.red }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate" style={{ color: WF.black }}>
                                                {tx.type} {tx.direction}
                                            </p>
                                            <p className="text-[10px]" style={{ color: WF.muted }}>
                                                {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold"
                                                style={{ color: tx.direction === 'DEPOSIT' ? '#12B76A' : WF.red }}>
                                                {tx.direction === 'DEPOSIT' ? '+' : '-'}${fmt(tx.amount)}
                                            </p>
                                            <StatusBadge status={tx.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {!selectedUser && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <History size={36} style={{ color: WF.border }} />
                    <p className="text-sm" style={{ color: WF.muted }}>Search and select a user above to view or add transactions</p>
                </div>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
    const [authed, setAuthed] = useState(false);
    const [tab, setTab] = useState<'chat' | 'balance' | 'transactions' | 'applications' | 'settings' | 'history'>('balance');

    useEffect(() => {
        if (sessionStorage.getItem(ADMIN_PASSWORD_KEY)) setAuthed(true);
    }, []);

    if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

    const tabs = [
        { id: 'balance' as const,       label: 'Users',          icon: Users        },
        { id: 'transactions' as const,  label: 'Transactions',   icon: TrendingUp   },
        { id: 'history' as const,       label: 'History',        icon: History      },
        { id: 'applications' as const,  label: 'Applications',   icon: FileText     },
        { id: 'chat' as const,          label: 'Live Chat',      icon: MessageCircle},
        { id: 'settings' as const,      label: 'Payment Info',   icon: Settings     },
    ];

    return (
        <div className="flex flex-col h-screen font-sans" style={{ background: WF.bg }}>
            {/* Header */}
            <header className="flex-shrink-0 px-4 md:px-8 flex items-center justify-between gap-2"
                style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}`, height: 56 }}>
                {/* Logo */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        <span className="font-display text-lg font-bold" style={{ color: WF.red }}>West</span>
                        <span className="font-display text-lg font-bold" style={{ color: WF.black }}>Bank</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(215,30,40,0.08)', border: '1px solid rgba(215,30,40,0.15)' }}>
                        <ShieldCheck size={10} style={{ color: WF.red }} />
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: WF.red }}>Admin</span>
                    </div>
                </div>

                {/* Tabs — scrollable on mobile */}
                <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 justify-end">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="flex items-center gap-1.5 px-2.5 md:px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                            style={{
                                background: tab === t.id ? WF.red : 'transparent',
                                color: tab === t.id ? '#fff' : WF.muted,
                            }}>
                            <t.icon size={13} />
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {tab === 'chat'         && <ChatTab />}
                {tab === 'balance'      && <BalanceTab />}
                {tab === 'transactions' && <TransactionsTab />}
                {tab === 'history'      && <HistoryTab />}
                {tab === 'settings'     && <PaymentSettingsTab />}
                {tab === 'applications' && <ApplicationsTab />}
            </div>
        </div>
    );
}
