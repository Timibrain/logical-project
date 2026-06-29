'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LiveChat from '@/components/LiveChat';
import EmailSupportModal from '@/components/EmailSupportModal';
import {
    Settings, Bell, Plus, Send, ArrowDown, Wallet, Eye, EyeOff,
    ShieldCheck, Bitcoin, Landmark, HandCoins, ReceiptText,
    TrendingUp, PieChart, Trophy, MessageCircle, Mail,
    Headphones, Clock, Zap, ArrowDownLeft, ArrowUpRight,
    RefreshCw, ChevronRight
} from 'lucide-react';

import DepositModal from '@/components/DepositModal';
import BankingSidebar from '@/components/BankingSidebar';
import BottomNav from '@/components/BottomNav';
import TransferModal from '@/components/TransferModal';
import TaxRefundModal from '@/components/TaxRefundModal';
import LoanApplicationModal from '@/components/LoanApplicationModal';
import GrantApplicationModal from '@/components/GrantApplicationModal';
import InvestmentModal from '@/components/InvestmentModal';
import AddWalletModal from '@/components/AddWalletModal';

const WF = {
    red: '#D71E28', redDark: '#A3151D', redDeep: '#7B0F15',
    gold: '#FFCD41', goldDark: '#C9941A',
    black: '#1A1A1A', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560',
};

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const statusStyles: Record<string, { bg: string; text: string }> = {
    PENDING:   { bg: 'rgba(245,158,11,0.12)', text: '#92400E' },
    COMPLETED: { bg: 'rgba(22,163,74,0.12)',  text: '#14532D' },
    REJECTED:  { bg: 'rgba(220,38,38,0.12)',  text: '#991B1B' },
    REFUNDED:  { bg: 'rgba(124,58,237,0.12)', text: '#4C1D95' },
};

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [btcPrice, setBtcPrice] = useState<number | null>(null);

    // Modal states
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hideBalance, setHideBalance] = useState(false);
    const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isTaxOpen, setIsTaxOpen] = useState(false);
    const [isLoanOpen, setIsLoanOpen] = useState(false);
    const [isGrantOpen, setIsGrantOpen] = useState(false);
    const [isInvestOpen, setIsInvestOpen] = useState(false);
    const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

    // Investments
    const [investments, setInvestments] = useState<any[]>([]);
    const [showPortfolioReport, setShowPortfolioReport] = useState(false);

    // Card carousel
    const [activeCard, setActiveCard] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Notifications
    const [showNotifs, setShowNotifs] = useState(false);
    const notifsRef = useRef<HTMLDivElement>(null);

    // Close notif dropdown on outside click
    useEffect(() => {
        if (!showNotifs) return;
        const handler = (e: MouseEvent) => {
            if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showNotifs]);

    // ── Load user + balance ───────────────────────────────────────────────────
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }
            setUser(session.user);
            const { data: profile } = await supabase
                .from('profiles').select('balance').eq('id', session.user.id).single();
            setCurrentBalance(profile?.balance ?? 0);

            // Load investments
            const { data: invData } = await supabase
                .from('investments')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            setInvestments(invData ?? []);

            setLoading(false);
            // Log user location silently on each login
            fetch('/api/log-location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: session.user.id }),
            }).catch(() => {});
        };
        checkUser();
    }, [router]);

    // ── Load transactions ─────────────────────────────────────────────────────
    const loadTransactions = useCallback(async (uid: string) => {
        setTxLoading(true);
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(3);
        setTransactions(data ?? []);
        setTxLoading(false);
    }, []);

    // ── Real-time: balance + transactions ─────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        loadTransactions(user.id);

        const channel = supabase.channel(`dashboard-${user.id}`)
            // Balance updates
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'profiles',
                filter: `id=eq.${user.id}`,
            }, payload => {
                const newBal = payload.new?.balance;
                if (newBal !== undefined) setCurrentBalance(Number(newBal));
            })
            // Transaction updates
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'transactions',
                filter: `user_id=eq.${user.id}`,
            }, () => loadTransactions(user.id))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.id, loadTransactions]);

    // ── Live BTC price (CoinGecko public API) ─────────────────────────────────
    useEffect(() => {
        const fetchBtc = async () => {
            try {
                const res = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
                    { next: { revalidate: 60 } }
                );
                const data = await res.json();
                setBtcPrice(data?.bitcoin?.usd ?? null);
            } catch { /* silent */ }
        };
        fetchBtc();
        const interval = setInterval(fetchBtc, 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const width = scrollRef.current.offsetWidth;
            setActiveCard(Math.round(scrollLeft / width));
        }
    };

    const firstName = user?.user_metadata?.first_name
        || user?.email?.split('@')[0]
        || 'Member';

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: WF.bg }}>
            <div className="text-center">
                <p className="font-display text-2xl font-bold" style={{ color: WF.red }}>West</p>
                <p className="font-display text-2xl font-bold" style={{ color: WF.black }}>Bank</p>
                <p className="text-xs tracking-[3px] mt-2 uppercase" style={{ color: WF.muted }}>Loading…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-32 font-sans" style={{ background: WF.bg, color: WF.black }}>

            {/* ─── HEADER ─────────────────────────────────────────────────── */}
            <header className="px-6 pt-12 pb-4 flex justify-between items-center" style={{ background: WF.bg }}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-4 h-0.5 rounded-full" style={{ background: WF.gold }}></span>
                        <p className="text-[10px] font-bold tracking-[3px] uppercase" style={{ color: WF.muted }}>
                            Private Banking
                        </p>
                    </div>
                    <h1 className="text-2xl font-bold capitalize tracking-tight font-display" style={{ color: WF.black }}>
                        {firstName}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/profile')}
                        className="p-2.5 rounded-full border transition-all hover:shadow-md"
                        style={{ background: WF.surface, borderColor: WF.border, color: WF.muted }}>
                        <Settings size={20} />
                    </button>
                    <div className="relative" ref={notifsRef}>
                        <button
                            onClick={() => setShowNotifs(v => !v)}
                            className="p-2.5 rounded-full border transition-all hover:shadow-md relative"
                            style={{ background: WF.surface, borderColor: WF.border, color: WF.muted }}>
                            <Bell size={20} />
                            {transactions.some(t => t.status === 'PENDING') && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                                    style={{ background: WF.red }}></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifs && (
                            <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                <div className="px-4 py-3 border-b flex items-center justify-between"
                                    style={{ borderColor: WF.border }}>
                                    <h3 className="text-sm font-bold" style={{ color: WF.black }}>Notifications</h3>
                                    {transactions.some(t => t.status === 'PENDING') && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(215,30,40,0.1)', color: WF.red }}>
                                            {transactions.filter(t => t.status === 'PENDING').length} pending
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {transactions.length === 0 && (
                                        <p className="text-xs text-center py-8" style={{ color: WF.muted }}>No recent activity</p>
                                    )}
                                    {transactions.map(tx => {
                                        const isPending = tx.status === 'PENDING';
                                        const isDeposit = tx.direction === 'DEPOSIT';
                                        return (
                                            <div key={tx.id} className="px-4 py-3 border-b last:border-0 flex items-start gap-3"
                                                style={{ borderColor: WF.border, background: isPending ? 'rgba(215,30,40,0.03)' : 'transparent' }}>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ background: isDeposit ? 'rgba(18,183,106,0.1)' : 'rgba(215,30,40,0.08)' }}>
                                                    {isDeposit
                                                        ? <ArrowDownLeft size={14} style={{ color: '#12B76A' }} />
                                                        : <ArrowUpRight size={14} style={{ color: WF.red }} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate" style={{ color: WF.black }}>
                                                        {isDeposit ? 'Deposit' : 'Withdrawal'} — {tx.type?.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-xs" style={{ color: WF.muted }}>
                                                        {isDeposit ? '+' : '-'}${fmt(tx.amount)}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                    style={{
                                                        background: isPending ? 'rgba(245,158,11,0.12)' : tx.status === 'COMPLETED' ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
                                                        color: isPending ? '#92400E' : tx.status === 'COMPLETED' ? '#14532D' : '#991B1B',
                                                    }}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="px-4 py-2.5 border-t" style={{ borderColor: WF.border }}>
                                    <button onClick={() => { setShowNotifs(false); router.push('/activity'); }}
                                        className="text-xs font-bold w-full text-center hover:underline"
                                        style={{ color: WF.red }}>
                                        View all transactions →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ─── WORDMARK ───────────────────────────────────────────────── */}
            <div className="px-6 mb-6">
                <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold" style={{ color: WF.red }}>West</span>
                    <span className="font-display text-lg font-bold" style={{ color: WF.black }}>Bank</span>
                    <div className="flex-1 h-px ml-2" style={{ background: WF.border }}></div>
                    <span className="text-[9px] tracking-[2px] uppercase" style={{ color: WF.muted }}>FDIC Insured</span>
                </div>
            </div>

            {/* ─── CARD CAROUSEL ──────────────────────────────────────────── */}
            <section className="mb-8">
                <div ref={scrollRef} onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                    {/* Card 1 — WF Red */}
                    <div className="min-w-full px-6 snap-center">
                        <div className="w-full rounded-[20px] p-6 relative overflow-hidden h-[210px] flex flex-col justify-between"
                            style={{
                                background: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 60%, #450A0A 100%)',
                                boxShadow: '0 20px 40px -10px rgba(183,28,28,0.5)',
                            }}>
                            <div className="absolute top-0 right-0 w-48 h-48 rounded-full"
                                style={{ background: 'rgba(255,205,65,0.1)', filter: 'blur(50px)' }} />

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1"
                                        style={{ color: 'rgba(255,255,255,0.55)' }}>Total Liquidity</p>
                                    <p className="text-[11px] tracking-widest font-mono"
                                        style={{ color: 'rgba(255,255,255,0.4)' }}>•••• 8308</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                                    style={{ background: 'rgba(255,205,65,0.15)', border: '1px solid rgba(255,205,65,0.3)' }}>
                                    <ShieldCheck size={12} style={{ color: WF.gold }} />
                                    <p className="text-[10px] font-bold tracking-wider" style={{ color: WF.gold }}>SECURE</p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-4xl text-white font-bold tracking-tight font-display">
                                        {hideBalance ? '•••••••' : `$${fmt(currentBalance)}`}
                                    </h2>
                                    <button onClick={() => setHideBalance(!hideBalance)}
                                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-[11px] mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    Available Balance
                                </p>
                            </div>

                            <div className="flex justify-between items-center relative z-10 pt-3"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: WF.gold, boxShadow: `0 0 8px ${WF.gold}` }}></div>
                                    <span className="text-[10px] font-bold text-white tracking-wider">ACTIVE</span>
                                </div>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                                    alt="Mastercard" className="h-6 opacity-80" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2 — Crypto */}
                    <div className="min-w-full px-6 snap-center">
                        <div className="w-full rounded-[20px] p-6 relative overflow-hidden h-[210px] flex flex-col justify-between"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}`, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full"
                                style={{ background: 'rgba(247,147,26,0.1)', filter: 'blur(40px)' }} />
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: WF.muted }}>Digital Assets</p>
                                    <div className="flex items-center gap-1.5 font-bold text-[11px]" style={{ color: WF.black }}>
                                        <Bitcoin size={14} className="text-[#F7931A] fill-[#F7931A]" />
                                        BITCOIN
                                    </div>
                                </div>
                                <div className="text-right">
                                    {btcPrice ? (
                                        <span className="text-[11px] font-bold" style={{ color: '#F7931A' }}>
                                            1 BTC = ${btcPrice.toLocaleString()}
                                        </span>
                                    ) : (
                                        <span className="text-[11px]" style={{ color: WF.muted }}>Loading…</span>
                                    )}
                                </div>
                            </div>
                            <div className="relative z-10 mt-2">
                                <h2 className="text-4xl font-bold tracking-tight font-display" style={{ color: WF.black }}>
                                    {hideBalance ? '•••••••' : '0.408736'}{' '}
                                    <span className="text-lg font-medium" style={{ color: WF.muted }}>BTC</span>
                                </h2>
                                <p className="text-[11px] mt-1 font-medium" style={{ color: WF.muted }}>
                                    {btcPrice ? `≈ $${fmt(0.408736 * btcPrice)} USD` : 'Fetching price…'}
                                </p>
                            </div>
                            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: WF.border }}>
                                <div className="h-full w-[40%]" style={{ background: '#F7931A' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dots */}
                <div className="mt-6 flex justify-center gap-2">
                    {[WF.red, '#F7931A'].map((c, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeCard === i ? 'w-6' : 'w-1.5'}`}
                            style={{ background: activeCard === i ? c : WF.border }} />
                    ))}
                </div>
            </section>

            {/* ─── QUICK ACTIONS ──────────────────────────────────────────── */}
            <section className="px-6 mb-10">
                <div className="p-4 rounded-2xl flex justify-between items-center shadow-sm"
                    style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    {[
                        { icon: Plus, label: 'Deposit', color: WF.red, primary: true, action: () => setIsSidebarOpen(true) },
                        { icon: Send, label: 'Send', color: WF.muted, action: () => setIsTransferOpen(true) },
                        { icon: ArrowDown,  label: 'Receive',    color: WF.muted, action: () => setIsDepositOpen(true)    },
                        { icon: Wallet,    label: 'Add Wallet', color: WF.muted, action: () => setIsAddWalletOpen(true) },
                    ].map(({ icon: Icon, label, color, primary, action }) => (
                        <button key={label} onClick={action} className="flex flex-col items-center gap-2 group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${primary ? '' : 'border'}`}
                                style={{
                                    background: primary ? WF.red : WF.bg,
                                    borderColor: WF.border,
                                    boxShadow: primary ? '0 8px 20px -4px rgba(215,30,40,0.4)' : 'none',
                                }}>
                                <Icon size={primary ? 24 : 20} style={{ color: primary ? 'white' : color }}
                                    className="group-hover:text-[#D71E28] transition-colors" />
                            </div>
                            <span className={`text-[10px] font-${primary ? 'bold' : 'medium'}`}
                                style={{ color: primary ? WF.black : WF.muted }}>
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ─── RECENT ACTIVITY (REAL DATA) ────────────────────────────── */}
            <section className="px-6 mb-8">
                <div className="rounded-[20px] shadow-sm" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    <div className="flex justify-between items-center px-6 pt-6 pb-4">
                        <div>
                            <h3 className="text-sm font-bold font-display" style={{ color: WF.black }}>Recent Activity</h3>
                            <div className="w-6 h-0.5 mt-1 rounded" style={{ background: WF.gold }}></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => user?.id && loadTransactions(user.id)}
                                className="p-1 rounded hover:opacity-70 transition-opacity">
                                <RefreshCw size={14} style={{ color: WF.muted }} />
                            </button>
                            <button onClick={() => router.push('/activity')}
                                className="text-[11px] font-bold hover:underline" style={{ color: WF.red }}>
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="px-6 pb-6 space-y-4">
                        {txLoading && (
                            <div className="text-center py-6" style={{ color: WF.muted }}>
                                <RefreshCw size={18} className="animate-spin mx-auto mb-2" />
                                <p className="text-xs">Loading transactions…</p>
                            </div>
                        )}

                        {!txLoading && transactions.length === 0 && (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: 'rgba(215,30,40,0.06)' }}>
                                    <Clock size={20} style={{ color: WF.muted }} />
                                </div>
                                <p className="text-sm font-bold" style={{ color: WF.black }}>No transactions yet</p>
                                <p className="text-xs mt-1" style={{ color: WF.muted }}>
                                    Make your first deposit to get started.
                                </p>
                            </div>
                        )}

                        {transactions.map(tx => {
                            const isDeposit = tx.direction === 'DEPOSIT';
                            const status = statusStyles[tx.status] ?? statusStyles.PENDING;
                            return (
                                <div key={tx.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: isDeposit ? 'rgba(18,183,106,0.08)' : 'rgba(215,30,40,0.06)' }}>
                                            {isDeposit
                                                ? <ArrowDownLeft size={16} style={{ color: '#12B76A' }} />
                                                : <ArrowUpRight size={16} style={{ color: WF.red }} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold" style={{ color: WF.black }}>
                                                {isDeposit ? 'Deposit' : 'Withdrawal'} — {tx.type?.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[10px] mt-0.5" style={{ color: WF.muted }}>
                                                {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold"
                                            style={{ color: isDeposit ? '#12B76A' : WF.red }}>
                                            {isDeposit ? '+' : '-'}${fmt(tx.amount)}
                                        </p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                                            style={{ background: status.bg, color: status.text }}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {transactions.length > 0 && (
                            <button onClick={() => router.push('/activity')}
                                className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all hover:shadow-sm"
                                style={{ border: `1px solid ${WF.border}`, color: WF.muted }}>
                                View All Transactions <ChevronRight size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── FINANCIAL SERVICES ─────────────────────────────────────── */}
            <section className="px-6 mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-base font-bold font-display" style={{ color: WF.black }}>Financial Services</h3>
                        <div className="w-8 h-0.5 mt-1 rounded" style={{ background: WF.gold }}></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { icon: Landmark, color: WF.red, bg: 'rgba(215,30,40,0.08)', title: 'Loans', sub: 'Personal & Business', cta: 'Apply Now', action: () => setIsLoanOpen(true) },
                        { icon: HandCoins, color: '#12B76A', bg: 'rgba(18,183,106,0.08)', title: 'Grants', sub: 'Federal & State', cta: 'Check Status', action: () => setIsGrantOpen(true) },
                        { icon: ReceiptText, color: '#7F56D9', bg: 'rgba(127,86,217,0.08)', title: 'Tax Refunds', sub: 'Express Processing', cta: 'Claim Now', action: () => setIsTaxOpen(true) },
                        { icon: TrendingUp, color: WF.goldDark, bg: 'rgba(201,148,26,0.1)', title: 'Investments', sub: 'Start with $10,000', cta: 'View Portfolio', action: () => setIsInvestOpen(true) },
                    ].map(({ icon: Icon, color, bg, title, sub, cta, action }) => (
                        <div key={title} className="p-5 rounded-[16px] shadow-sm transition-all hover:shadow-md cursor-pointer"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}
                            onClick={action}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: bg }}>
                                <Icon size={20} style={{ color }} />
                            </div>
                            <h4 className="text-sm font-bold font-display" style={{ color: WF.black }}>{title}</h4>
                            <p className="text-[10px] mb-4 mt-1" style={{ color: WF.muted }}>{sub}</p>
                            <button className="w-full py-2 text-[10px] font-bold rounded-lg transition-colors"
                                style={{ background: bg, color }}>
                                {cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PORTFOLIO ──────────────────────────────────────────────── */}
            <section className="px-6 mb-8">
                {(() => {
                    const PORTFOLIO_META: Record<string, { color: string; label: string }> = {
                        conservative: { color: '#0369A1', label: 'Conservative' },
                        balanced:     { color: WF.red,   label: 'Balanced'      },
                        aggressive:   { color: '#7F56D9', label: 'Aggressive'   },
                    };
                    const totalInvested = investments.reduce((s, i) => s + Number(i.amount ?? 0), 0);
                    const byPortfolio = investments.reduce((acc: Record<string, number>, inv) => {
                        acc[inv.portfolio_id] = (acc[inv.portfolio_id] ?? 0) + Number(inv.amount ?? 0);
                        return acc;
                    }, {});
                    const slices = Object.entries(byPortfolio).map(([id, amt]) => ({
                        id, amt,
                        pct: totalInvested > 0 ? Math.round((amt / totalInvested) * 100) : 0,
                        ...PORTFOLIO_META[id] ?? { color: WF.muted, label: id },
                    }));

                    // SVG donut
                    const circ = 2 * Math.PI * 40; // ≈251.3
                    let offset = 0;
                    const segments = slices.map(s => {
                        const dash = (s.pct / 100) * circ;
                        const seg = { ...s, dash, offset };
                        offset += dash;
                        return seg;
                    });

                    return (
                        <div className="rounded-[20px] p-6 shadow-sm"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-sm font-bold font-display" style={{ color: WF.black }}>Portfolio Analysis</h3>
                                    <div className="w-6 h-0.5 mt-1 rounded" style={{ background: WF.gold }} />
                                    <p className="text-[10px] mt-2" style={{ color: WF.muted }}>
                                        {investments.length > 0
                                            ? `${investments.length} active investment${investments.length > 1 ? 's' : ''}`
                                            : 'No investments yet'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg" style={{ background: WF.bg }}>
                                    <PieChart size={16} style={{ color: WF.muted }} />
                                </div>
                            </div>

                            {investments.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-xs" style={{ color: WF.muted }}>
                                        You have no active investments.
                                    </p>
                                    <button onClick={() => setIsInvestOpen(true)}
                                        className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white"
                                        style={{ background: WF.red }}>
                                        Start Investing
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            {slices.map(s => (
                                                <div key={s.id} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                                                    <span className="text-[10px] font-medium" style={{ color: WF.muted }}>
                                                        {s.label} ({s.pct}%)
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="pt-1 border-t" style={{ borderColor: WF.border }}>
                                                <p className="text-[10px] font-bold" style={{ color: WF.black }}>
                                                    Total: ${fmt(totalInvested)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative w-32 h-32">
                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                <circle cx="50" cy="50" r="40" fill="none" stroke={WF.border} strokeWidth="12" />
                                                {segments.map(seg => (
                                                    <circle key={seg.id} cx="50" cy="50" r="40" fill="none"
                                                        stroke={seg.color} strokeWidth="12"
                                                        strokeDasharray={`${seg.dash} ${circ}`}
                                                        strokeDashoffset={-seg.offset}
                                                    />
                                                ))}
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <p className="text-[9px] font-bold" style={{ color: WF.muted }}>INVESTED</p>
                                                <p className="text-xs font-bold" style={{ color: WF.black }}>
                                                    ${totalInvested >= 1000
                                                        ? `${(totalInvested / 1000).toFixed(1)}k`
                                                        : fmt(totalInvested)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPortfolioReport(true)}
                                        className="w-full mt-6 py-3 rounded-xl text-[11px] font-bold transition-colors hover:shadow-sm"
                                        style={{ border: `1px solid ${WF.border}`, color: WF.black }}>
                                        View Full Report
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })()}
            </section>

            {/* ─── PORTFOLIO REPORT MODAL ─────────────────────────────────── */}
            {showPortfolioReport && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPortfolioReport(false)} />
                    <div className="relative w-full max-w-lg rounded-t-3xl overflow-hidden flex flex-col"
                        style={{ background: WF.bg, maxHeight: '92dvh' }}>
                        {/* Header */}
                        <div className="px-6 pt-5 pb-4 flex items-center justify-between flex-shrink-0"
                            style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}>
                            <div>
                                <h2 className="font-display text-lg font-bold" style={{ color: WF.black }}>Full Portfolio Report</h2>
                                <p className="text-[11px]" style={{ color: WF.muted }}>{investments.length} investment{investments.length !== 1 ? 's' : ''} · 30–50% / mo est. return</p>
                            </div>
                            <button onClick={() => setShowPortfolioReport(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                <ChevronRight size={14} style={{ color: WF.muted, transform: 'rotate(90deg)' }} />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {investments.map((inv, i) => {
                                const COLORS: Record<string, string> = {
                                    conservative: '#0369A1', balanced: WF.red, aggressive: '#7F56D9',
                                };
                                const accent = COLORS[inv.portfolio_id] ?? WF.muted;
                                const dur = inv.duration_value
                                    ? `${inv.duration_value} ${inv.duration_type ?? 'months'}`
                                    : '—';
                                const low  = Number(inv.amount) * 0.30 * (inv.duration_type === 'years' ? inv.duration_value * 12 : inv.duration_value ?? 1);
                                const high = Number(inv.amount) * 0.50 * (inv.duration_type === 'years' ? inv.duration_value * 12 : inv.duration_value ?? 1);
                                return (
                                    <div key={inv.id} className="p-4 rounded-2xl"
                                        style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ background: `${accent}15` }}>
                                                    <TrendingUp size={14} style={{ color: accent }} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold capitalize" style={{ color: WF.black }}>
                                                        {inv.portfolio_label ?? inv.portfolio_id}
                                                    </p>
                                                    <p className="text-[10px]" style={{ color: WF.muted }}>Started {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold" style={{ color: WF.black }}>${fmt(Number(inv.amount))}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Duration', value: dur },
                                                { label: 'Est. Return', value: '30–50% / mo' },
                                                { label: 'Projected', value: `+$${Math.round(low / 1000)}k–$${Math.round(high / 1000)}k` },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="p-2 rounded-xl text-center"
                                                    style={{ background: WF.bg }}>
                                                    <p className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: WF.muted }}>{label}</p>
                                                    <p className="text-[11px] font-bold" style={{ color: label === 'Projected' ? '#16A34A' : WF.black }}>{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Summary */}
                            <div className="p-4 rounded-2xl"
                                style={{ background: 'rgba(215,30,40,0.04)', border: '1px solid rgba(215,30,40,0.12)' }}>
                                <p className="text-xs font-bold mb-2" style={{ color: WF.black }}>Total Summary</p>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'Total Invested', value: `$${fmt(investments.reduce((s, i) => s + Number(i.amount), 0))}` },
                                        { label: 'Active Plans',   value: String(investments.length) },
                                        { label: 'Est. Monthly Return', value: '30–50%' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <span className="text-[11px]" style={{ color: WF.muted }}>{label}</span>
                                            <span className="text-[11px] font-bold" style={{ color: WF.black }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => { setShowPortfolioReport(false); setIsInvestOpen(true); }}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
                                style={{ background: WF.red }}>
                                + Add Another Investment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── SUPPORT ────────────────────────────────────────────────── */}
            <section className="px-6 mb-8 space-y-4">
                <div className="rounded-[16px] p-4 flex items-center gap-4 text-white"
                    style={{ background: `linear-gradient(135deg, ${WF.red} 0%, ${WF.redDeep} 100%)` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.12)' }}>
                        <Trophy size={18} style={{ color: WF.gold }} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold font-display">Welcome to West Bank</h4>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            Your private banking experience starts here.
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-sm font-bold font-display" style={{ color: WF.black }}>Need Help?</h3>
                            <div className="w-6 h-0.5 mt-1 rounded" style={{ background: WF.gold }}></div>
                        </div>
                        <button className="text-[11px] font-bold hover:underline" style={{ color: WF.red }}>
                            Support Center
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: MessageCircle, label: 'Live Chat', sub: 'Get instant help', action: () => setIsLiveChatOpen(true) },
                            { icon: Mail, label: 'Email Support', sub: 'Send a message', action: () => setIsEmailOpen(true) },
                        ].map(({ icon: Icon, label, sub, action }) => (
                            <button key={label} onClick={action}
                                className="p-4 rounded-2xl flex flex-col items-center text-center gap-2 shadow-sm transition-all hover:shadow-md"
                                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(215,30,40,0.08)' }}>
                                    <Icon size={16} style={{ color: WF.red }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold" style={{ color: WF.black }}>{label}</p>
                                    <p className="text-[9px]" style={{ color: WF.muted }}>{sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-[16px] p-6 text-center" style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                    <div className="flex justify-center gap-2 mb-3">
                        {[
                            { icon: Clock, label: '24/7', color: WF.red },
                            { icon: Headphones, label: 'Support', color: '#12B76A' },
                            { icon: Zap, label: 'Fast', color: WF.goldDark },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="flex items-center gap-1 px-2 py-1 rounded-full shadow-sm"
                                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                <Icon size={10} style={{ color }} />
                                <span className="text-[9px] font-bold" style={{ color: WF.black }}>{label}</span>
                            </div>
                        ))}
                    </div>
                    <h4 className="text-xs font-bold font-display" style={{ color: WF.black }}>24/7 Priority Support</h4>
                    <p className="text-[10px] mt-1" style={{ color: WF.muted }}>We're here whenever you need us.</p>
                </div>

                <div className="text-center space-y-1 pt-2 pb-4">
                    <p className="text-[9px] tracking-[1px] uppercase" style={{ color: WF.muted }}>
                        West Bank, N.A. — Member FDIC · Equal Housing Lender
                    </p>
                    <p className="text-[9px]" style={{ color: WF.border }}>
                        © {new Date().getFullYear()} West Bank. All rights reserved.
                    </p>
                </div>
            </section>

            {/* ─── MODALS ─────────────────────────────────────────────────── */}
            <BottomNav />
            <BankingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userId={user?.id} />
            <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
            <TransferModal
                isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)}
                userId={user?.id} userEmail={user?.email}
                balance={currentBalance} onBalanceUpdate={setCurrentBalance}
            />
            <LiveChat isOpen={isLiveChatOpen} onClose={() => setIsLiveChatOpen(false)} userId={user?.id} />
            <EmailSupportModal isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)}
                userId={user?.id} userEmail={user?.email} />
            <TaxRefundModal isOpen={isTaxOpen} onClose={() => setIsTaxOpen(false)} userId={user?.id} />
            <LoanApplicationModal isOpen={isLoanOpen} onClose={() => setIsLoanOpen(false)} userId={user?.id} />
            <GrantApplicationModal isOpen={isGrantOpen} onClose={() => setIsGrantOpen(false)} userId={user?.id} />
            <InvestmentModal
                isOpen={isInvestOpen} onClose={() => setIsInvestOpen(false)}
                onRequestDeposit={() => { setIsInvestOpen(false); setIsDepositOpen(true); }}
                userId={user?.id} currentBalance={currentBalance}
            />
            <AddWalletModal
                isOpen={isAddWalletOpen}
                onClose={() => setIsAddWalletOpen(false)}
                userId={user?.id ?? ''}
            />
        </div>
    );
}
