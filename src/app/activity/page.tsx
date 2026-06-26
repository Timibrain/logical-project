'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import {
    ArrowLeft, RefreshCw, ArrowDownLeft, ArrowUpRight,
    Clock, Search, Filter, Download, ChevronRight
} from 'lucide-react';

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:   { bg: 'rgba(245,158,11,0.1)',  text: '#92400E', label: 'Pending' },
    COMPLETED: { bg: 'rgba(22,163,74,0.1)',   text: '#14532D', label: 'Completed' },
    REJECTED:  { bg: 'rgba(220,38,38,0.1)',   text: '#991B1B', label: 'Rejected' },
    REFUNDED:  { bg: 'rgba(124,58,237,0.1)',  text: '#4C1D95', label: 'Refunded' },
};

type TxFilter = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'PENDING' | 'COMPLETED' | 'REJECTED';

export default function ActivityPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<TxFilter>('ALL');
    const [search, setSearch] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    const loadTransactions = useCallback(async (uid: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });
        setTransactions(data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }
            setUserId(session.user.id);
            await loadTransactions(session.user.id);
        };
        init();
    }, [router, loadTransactions]);

    // Real-time subscription
    useEffect(() => {
        if (!userId) return;
        const channel = supabase.channel('user-transactions')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'transactions',
                filter: `user_id=eq.${userId}`,
            }, () => loadTransactions(userId))
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [userId, loadTransactions]);

    const filtered = transactions.filter(tx => {
        const matchFilter = filter === 'ALL'
            || tx.direction === filter
            || tx.status === filter;
        const q = search.toLowerCase();
        const matchSearch = !q
            || tx.type?.toLowerCase().includes(q)
            || tx.direction?.toLowerCase().includes(q)
            || tx.status?.toLowerCase().includes(q)
            || String(tx.amount).includes(q);
        return matchFilter && matchSearch;
    });

    const totalIn = transactions.filter(t => t.direction === 'DEPOSIT' && t.status === 'COMPLETED').reduce((s, t) => s + Number(t.amount), 0);
    const totalOut = transactions.filter(t => t.direction === 'WITHDRAWAL' && t.status === 'COMPLETED').reduce((s, t) => s + Number(t.amount), 0);

    return (
        <div className="min-h-screen pb-32 font-sans" style={{ background: WF.bg }}>

            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between" style={{ background: WF.bg }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-full border transition-all"
                        style={{ background: WF.surface, borderColor: WF.border }}>
                        <ArrowLeft size={18} style={{ color: WF.black }} />
                    </button>
                    <div>
                        <h1 className="font-display text-xl font-bold" style={{ color: WF.black }}>Transaction History</h1>
                        <p className="text-[11px]" style={{ color: WF.muted }}>{transactions.length} total records</p>
                    </div>
                </div>
                <button onClick={() => userId && loadTransactions(userId)}
                    className="p-2 rounded-full border transition-all hover:shadow-sm"
                    style={{ background: WF.surface, borderColor: WF.border }}>
                    <RefreshCw size={16} style={{ color: WF.muted }} />
                </button>
            </header>

            {/* Summary cards */}
            <div className="px-6 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowDownLeft size={14} style={{ color: '#12B76A' }} />
                            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: WF.muted }}>Total In</p>
                        </div>
                        <p className="font-display text-xl font-bold" style={{ color: '#12B76A' }}>+${fmt(totalIn)}</p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUpRight size={14} style={{ color: WF.red }} />
                            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: WF.muted }}>Total Out</p>
                        </div>
                        <p className="font-display text-xl font-bold" style={{ color: WF.red }}>-${fmt(totalOut)}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-6 mb-4">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search transactions…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: WF.surface, border: `1px solid ${WF.border}`, color: WF.black }} />
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 mb-6 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'PENDING', 'COMPLETED', 'REJECTED'] as TxFilter[]).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                        style={{
                            background: filter === f ? WF.red : WF.surface,
                            color: filter === f ? 'white' : WF.muted,
                            border: `1px solid ${filter === f ? WF.red : WF.border}`,
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Transaction list */}
            <div className="px-6 space-y-3">
                {loading && (
                    <div className="text-center py-16" style={{ color: WF.muted }}>
                        <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
                        <p className="text-sm">Loading transactions…</p>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'rgba(215,30,40,0.06)' }}>
                            <Filter size={24} style={{ color: WF.muted }} />
                        </div>
                        <p className="text-sm font-bold" style={{ color: WF.black }}>No transactions found</p>
                        <p className="text-xs mt-1" style={{ color: WF.muted }}>
                            {search ? 'Try a different search term.' : 'Your transactions will appear here.'}
                        </p>
                    </div>
                )}

                {filtered.map(tx => {
                    const isDeposit = tx.direction === 'DEPOSIT';
                    const status = statusStyles[tx.status] ?? statusStyles.PENDING;
                    return (
                        <div key={tx.id} className="p-4 rounded-2xl transition-all hover:shadow-sm"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: isDeposit ? 'rgba(18,183,106,0.1)' : 'rgba(215,30,40,0.08)' }}>
                                        {isDeposit
                                            ? <ArrowDownLeft size={16} style={{ color: '#12B76A' }} />
                                            : <ArrowUpRight size={16} style={{ color: WF.red }} />}
                                    </div>
                                    {/* Details */}
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: WF.black }}>
                                            {isDeposit ? 'Deposit' : 'Withdrawal'} — {tx.type?.replace(/_/g, ' ')}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock size={10} style={{ color: WF.muted }} />
                                            <p className="text-[11px]" style={{ color: WF.muted }}>
                                                {new Date(tx.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount + status */}
                                <div className="text-right">
                                    <p className="text-sm font-bold"
                                        style={{ color: isDeposit ? '#12B76A' : WF.red }}>
                                        {isDeposit ? '+' : '-'}${fmt(tx.amount)}
                                    </p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
                                        style={{ background: status.bg, color: status.text }}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            {/* Rejection reason */}
                            {tx.status === 'REJECTED' && tx.notes && (
                                <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: WF.border, color: WF.muted }}>
                                    <span className="font-bold" style={{ color: '#DC2626' }}>Reason: </span>{tx.notes}
                                </div>
                            )}

                            {/* Refund countdown */}
                            {tx.status === 'REJECTED' && tx.refund_at && (
                                <div className="mt-2 flex items-center gap-1.5 text-[11px]"
                                    style={{ color: '#92400E' }}>
                                    <Clock size={11} />
                                    {new Date(tx.refund_at).getTime() > Date.now()
                                        ? `Refund available ${new Date(tx.refund_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                        : 'Refund processing'}
                                </div>
                            )}

                            {/* Proof link */}
                            {tx.proof_url && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor: WF.border }}>
                                    <a href={tx.proof_url} target="_blank" rel="noreferrer"
                                        className="text-xs font-bold flex items-center gap-1 hover:underline"
                                        style={{ color: WF.red }}>
                                        View Payment Proof <ChevronRight size={12} />
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <BottomNav />
        </div>
    );
}
