'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Eye, EyeOff, Shield, CreditCard, Lock, Unlock, Copy, Check } from 'lucide-react';

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

export default function CardsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [cardLocked, setCardLocked] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardNumber = '4532 8308 7741 2954';
    const maskedNumber = '**** **** **** 2954';

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }
            setUser(session.user);
            const { data: profile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
            setBalance(profile?.balance ?? 0);
        };
        init();
    }, [router]);

    const copyCard = () => {
        navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const name = user ? `${user.user_metadata?.first_name ?? ''} ${user.user_metadata?.last_name ?? user.email?.split('@')[0] ?? ''}`.trim().toUpperCase() : '—';

    return (
        <div className="min-h-screen pb-32 font-sans" style={{ background: WF.bg }}>

            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center gap-3">
                <button onClick={() => router.push('/dashboard')}
                    className="p-2 rounded-full border"
                    style={{ background: WF.surface, borderColor: WF.border }}>
                    <ArrowLeft size={18} style={{ color: WF.black }} />
                </button>
                <div>
                    <h1 className="font-display text-xl font-bold" style={{ color: WF.black }}>My Cards</h1>
                    <p className="text-[11px]" style={{ color: WF.muted }}>Manage your West Bank cards</p>
                </div>
            </header>

            <div className="px-6 space-y-6">
                {/* Card */}
                <div className="rounded-[22px] p-6 relative overflow-hidden"
                    style={{
                        background: cardLocked
                            ? 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
                            : 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 60%, #450A0A 100%)',
                        boxShadow: cardLocked
                            ? '0 20px 40px rgba(0,0,0,0.3)'
                            : '0 20px 40px rgba(183,28,28,0.4)',
                        minHeight: 200,
                        transition: 'all 0.4s ease',
                    }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
                        style={{ background: 'rgba(255,205,65,0.08)', filter: 'blur(40px)' }} />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <p className="text-[10px] font-bold tracking-[3px] text-white/50 uppercase">West Bank</p>
                            {cardLocked && <p className="text-[10px] font-bold text-white/40 mt-0.5">CARD LOCKED</p>}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                            style={{ background: 'rgba(255,205,65,0.15)', border: '1px solid rgba(255,205,65,0.3)' }}>
                            <Shield size={11} style={{ color: WF.gold }} />
                            <span className="text-[10px] font-bold" style={{ color: WF.gold }}>SECURE</span>
                        </div>
                    </div>

                    <div className="relative z-10 mb-6">
                        <p className="font-mono text-lg tracking-[3px] text-white mb-1">
                            {showDetails ? cardNumber : maskedNumber}
                        </p>
                        <div className="flex gap-4 text-white/50 text-[11px] font-mono">
                            <span>EXP: {showDetails ? '09/28' : '••/••'}</span>
                            <span>CVV: {showDetails ? '412' : '•••'}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest">Cardholder</p>
                            <p className="text-white text-sm font-bold mt-0.5">{name}</p>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                            alt="Mastercard" className="h-7 opacity-75" />
                    </div>
                </div>

                {/* Card actions */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        {
                            icon: showDetails ? EyeOff : Eye,
                            label: showDetails ? 'Hide Details' : 'Show Details',
                            action: () => setShowDetails(!showDetails),
                            color: WF.red,
                        },
                        {
                            icon: cardLocked ? Unlock : Lock,
                            label: cardLocked ? 'Unlock Card' : 'Lock Card',
                            action: () => setCardLocked(!cardLocked),
                            color: cardLocked ? '#12B76A' : '#F59E0B',
                        },
                        {
                            icon: copied ? Check : Copy,
                            label: copied ? 'Copied!' : 'Copy Number',
                            action: copyCard,
                            color: '#7F56D9',
                        },
                    ].map(({ icon: Icon, label, action, color }) => (
                        <button key={label} onClick={action}
                            className="p-4 rounded-2xl flex flex-col items-center gap-2 text-center transition-all hover:shadow-sm"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                                style={{ background: `${color}14` }}>
                                <Icon size={16} style={{ color }} />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: WF.black }}>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Card info */}
                <div className="rounded-2xl overflow-hidden" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    <div className="px-5 py-4 border-b" style={{ borderColor: WF.border }}>
                        <h3 className="font-display text-sm font-bold" style={{ color: WF.black }}>Card Details</h3>
                    </div>
                    {[
                        { label: 'Card Type', value: 'West Bank Debit Mastercard' },
                        { label: 'Status', value: cardLocked ? '🔒 Locked' : '✅ Active' },
                        { label: 'Available Balance', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                        { label: 'Daily Limit', value: '$5,000.00' },
                        { label: 'International', value: 'Enabled' },
                        { label: 'Contactless', value: 'Enabled' },
                    ].map(({ label, value }) => (
                        <div key={label} className="px-5 py-3.5 flex justify-between items-center border-b last:border-0"
                            style={{ borderColor: WF.border }}>
                            <span className="text-xs" style={{ color: WF.muted }}>{label}</span>
                            <span className="text-xs font-bold" style={{ color: WF.black }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Security notice */}
                <div className="p-4 rounded-2xl flex items-start gap-3"
                    style={{ background: 'rgba(215,30,40,0.04)', border: '1px solid rgba(215,30,40,0.12)' }}>
                    <Shield size={16} style={{ color: WF.red }} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold mb-0.5" style={{ color: WF.black }}>Security Notice</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: WF.muted }}>
                            Never share your card number, CVV, or PIN with anyone — including West Bank staff.
                            Report suspicious activity immediately via Live Chat.
                        </p>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
