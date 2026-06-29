'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CheckCircle, ChevronRight, ChevronLeft, TrendingUp,
    Shield, BarChart3, Zap, Loader2, Check, AlertCircle, Info
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
};

interface Portfolio {
    id: string;
    label: string;
    tagline: string;
    expectedReturn: string;
    risk: string;
    riskColor: string;
    icon: any;
    accent: string;
    accentBg: string;
    minAmount: number;
    allocation: { label: string; pct: number; color: string }[];
}

const PORTFOLIOS: Portfolio[] = [
    {
        id: 'conservative',
        label: 'Conservative',
        tagline: 'Stability & income preservation',
        expectedReturn: '3–5% / yr',
        risk: 'Low Risk',
        riskColor: '#16A34A',
        icon: Shield,
        accent: '#0369A1',
        accentBg: 'rgba(3,105,161,0.06)',
        minAmount: 10000,
        allocation: [
            { label: 'Bonds', pct: 60, color: '#0369A1' },
            { label: 'Money Market', pct: 25, color: '#7DD3FC' },
            { label: 'Equities', pct: 15, color: '#BAE6FD' },
        ],
    },
    {
        id: 'balanced',
        label: 'Balanced',
        tagline: 'Growth with moderate risk',
        expectedReturn: '7–9% / yr',
        risk: 'Medium Risk',
        riskColor: '#D97706',
        icon: BarChart3,
        accent: WF.red,
        accentBg: 'rgba(215,30,40,0.05)',
        minAmount: 10000,
        allocation: [
            { label: 'Equities', pct: 50, color: WF.red },
            { label: 'Bonds', pct: 35, color: '#FCA5A5' },
            { label: 'Alternatives', pct: 15, color: '#FED7AA' },
        ],
    },
    {
        id: 'aggressive',
        label: 'Aggressive',
        tagline: 'Maximum growth potential',
        expectedReturn: '12–18% / yr',
        risk: 'High Risk',
        riskColor: '#DC2626',
        icon: Zap,
        accent: '#7F56D9',
        accentBg: 'rgba(127,86,217,0.05)',
        minAmount: 50000,
        allocation: [
            { label: 'Growth Stocks', pct: 70, color: '#7F56D9' },
            { label: 'Crypto', pct: 20, color: '#A78BFA' },
            { label: 'Bonds', pct: 10, color: '#DDD6FE' },
        ],
    },
];

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userBalance?: number;
    currentBalance?: number;
    onRequestDeposit?: () => void;
}

function StepBar({ total, current }: { total: number; current: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-7">
            {Array.from({ length: total }, (_, i) => i + 1).map(s => (
                <React.Fragment key={s}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                            background: current > s ? WF.red : current === s ? WF.red : WF.bg,
                            color: current >= s ? '#fff' : WF.muted,
                            border: current < s ? `1.5px solid ${WF.border}` : 'none',
                        }}>
                        {current > s ? <Check size={13} /> : s}
                    </div>
                    {s < total && (
                        <div className="w-10 h-0.5 rounded-full transition-all"
                            style={{ background: current > s ? WF.red : WF.border }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default function InvestmentModal({ isOpen, onClose, userId, userBalance, currentBalance, onRequestDeposit }: InvestmentModalProps) {
    const balance = currentBalance ?? userBalance ?? 0;
    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const portfolio = PORTFOLIOS.find(p => p.id === selected) ?? null;
    const amountNum = parseFloat(amount) || 0;
    const insufficientFunds = portfolio ? amountNum > balance : false;

    const isStep1Valid = selected !== null;
    const isStep2Valid = portfolio !== null && amountNum >= (portfolio?.minAmount ?? 0) && !insufficientFunds && agreed;

    const handleConfirm = async () => {
        if (!isStep2Valid || !portfolio) return;
        setLoading(true);

        const { error } = await supabase.from('investments').insert([{
            user_id: userId,
            portfolio_id: portfolio.id,
            portfolio_label: portfolio.label,
            amount: amountNum,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
        }]);

        setLoading(false);
        if (error) alert('Investment failed. Please try again.');
        else setSuccess(true);
    };

    if (!isOpen) return null;

    const stepLabels = ['Select Portfolio', 'Amount & Review'];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 font-sans">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                <motion.div
                    initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="relative w-full max-w-2xl md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
                    style={{ background: WF.bg, maxHeight: '92dvh' }}>

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
                        style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                <TrendingUp size={18} style={{ color: WF.red }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: WF.muted }}>
                                    {success ? 'Confirmed' : stepLabels[step - 1]}
                                </p>
                                <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>
                                    Invest with West Bank
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <X size={16} style={{ color: WF.muted }} />
                        </button>
                    </div>

                    {!success && (
                        <div className="h-0.5 w-full flex-shrink-0" style={{ background: WF.border }}>
                            <div className="h-full transition-all duration-500"
                                style={{ width: `${(step / 2) * 100}%`, background: WF.red }} />
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {success ? (
                            <div className="flex flex-col items-center text-center py-8 gap-4">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(22,163,74,0.1)' }}>
                                    <CheckCircle size={40} style={{ color: '#16A34A' }} />
                                </div>
                                <h3 className="font-display text-2xl font-bold" style={{ color: WF.black }}>Investment Activated!</h3>
                                <p className="text-sm max-w-xs leading-relaxed" style={{ color: WF.muted }}>
                                    <strong style={{ color: WF.black }}>${amountNum.toLocaleString()}</strong> has been allocated to the{' '}
                                    <strong style={{ color: WF.black }}>{portfolio?.label}</strong> portfolio.
                                    Track performance from your dashboard.
                                </p>

                                {portfolio && (
                                    <div className="w-full max-w-xs p-4 rounded-2xl text-left"
                                        style={{ background: portfolio.accentBg, border: `1px solid ${portfolio.accent}20` }}>
                                        <p className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: portfolio.accent }}>Portfolio Mix</p>
                                        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                                            {portfolio.allocation.map(a => (
                                                <div key={a.label} style={{ width: `${a.pct}%`, background: a.color }} />
                                            ))}
                                        </div>
                                        {portfolio.allocation.map(a => (
                                            <div key={a.label} className="flex items-center justify-between text-xs mb-1">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                                                    <span style={{ color: WF.muted }}>{a.label}</span>
                                                </span>
                                                <span className="font-bold" style={{ color: WF.black }}>{a.pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button onClick={onClose}
                                    className="w-full max-w-xs py-4 rounded-2xl text-white font-bold transition-all hover:opacity-90"
                                    style={{ background: WF.black }}>
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <StepBar total={2} current={step} />

                                {/* Step 1: Portfolio Selection */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <p className="text-sm" style={{ color: WF.muted }}>
                                            Choose a portfolio strategy that matches your financial goals and risk tolerance.
                                        </p>
                                        {PORTFOLIOS.map(p => {
                                            const Icon = p.icon;
                                            const isSelected = selected === p.id;
                                            return (
                                                <button key={p.id} onClick={() => setSelected(p.id)}
                                                    className="w-full text-left p-5 rounded-2xl transition-all"
                                                    style={{
                                                        background: isSelected ? p.accentBg : WF.surface,
                                                        border: `2px solid ${isSelected ? p.accent : WF.border}`,
                                                        boxShadow: isSelected ? `0 4px 20px -8px ${p.accent}40` : 'none',
                                                    }}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                                style={{ background: `${p.accent}15` }}>
                                                                <Icon size={18} style={{ color: p.accent }} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold" style={{ color: WF.black }}>{p.label}</p>
                                                                <p className="text-xs" style={{ color: WF.muted }}>{p.tagline}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all`}
                                                            style={{
                                                                borderColor: isSelected ? p.accent : WF.border,
                                                                background: isSelected ? p.accent : 'transparent',
                                                            }}>
                                                            {isSelected && <Check size={11} color="#fff" />}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex gap-3">
                                                        <div className="flex-1 p-3 rounded-xl text-center"
                                                            style={{ background: WF.bg }}>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: WF.muted }}>Est. Return</p>
                                                            <p className="text-sm font-bold" style={{ color: WF.black }}>{p.expectedReturn}</p>
                                                        </div>
                                                        <div className="flex-1 p-3 rounded-xl text-center"
                                                            style={{ background: WF.bg }}>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: WF.muted }}>Risk Level</p>
                                                            <p className="text-sm font-bold" style={{ color: p.riskColor }}>{p.risk}</p>
                                                        </div>
                                                        <div className="flex-1 p-3 rounded-xl text-center"
                                                            style={{ background: WF.bg }}>
                                                            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: WF.muted }}>Min. Amount</p>
                                                            <p className="text-sm font-bold" style={{ color: WF.black }}>${p.minAmount.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Allocation bar */}
                                                    <div className="mt-3">
                                                        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                                                            {p.allocation.map(a => (
                                                                <div key={a.label} style={{ width: `${a.pct}%`, background: a.color }} />
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 mt-2">
                                                            {p.allocation.map(a => (
                                                                <span key={a.label} className="flex items-center gap-1 text-[10px]" style={{ color: WF.muted }}>
                                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                                                                    {a.label} {a.pct}%
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Step 2: Amount & Review */}
                                {step === 2 && portfolio && (
                                    <div className="space-y-5">
                                        {/* Selected portfolio recap */}
                                        <div className="flex items-center gap-3 p-4 rounded-2xl"
                                            style={{ background: portfolio.accentBg, border: `1px solid ${portfolio.accent}20` }}>
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `${portfolio.accent}15` }}>
                                                <portfolio.icon size={16} style={{ color: portfolio.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold" style={{ color: WF.black }}>{portfolio.label} Portfolio</p>
                                                <p className="text-[10px]" style={{ color: WF.muted }}>
                                                    {portfolio.expectedReturn} expected · {portfolio.risk}
                                                </p>
                                            </div>
                                            <button onClick={() => setStep(1)} className="text-[10px] font-bold underline" style={{ color: portfolio.accent }}>
                                                Change
                                            </button>
                                        </div>

                                        {/* Amount input */}
                                        <div>
                                            <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
                                                Investment Amount <span style={{ color: WF.red }}>*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: WF.muted }}>$</span>
                                                <input
                                                    type="number"
                                                    placeholder={`Min $${portfolio.minAmount.toLocaleString()}`}
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none font-display text-2xl font-bold transition-all"
                                                    style={{ background: WF.bg, border: `1px solid ${insufficientFunds ? WF.red : WF.border}`, color: WF.black }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <p className="text-[10px]" style={{ color: WF.muted }}>
                                                    Available balance: <strong style={{ color: WF.black }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                                                </p>
                                                {amountNum > 0 && amountNum < portfolio.minAmount && (
                                                    <p className="text-[10px]" style={{ color: '#D97706' }}>
                                                        Min ${portfolio.minAmount.toLocaleString()} required
                                                    </p>
                                                )}
                                            </div>

                                            {/* Insufficient funds */}
                                            {insufficientFunds && (
                                                <div className="mt-3 p-4 rounded-2xl flex items-start gap-3"
                                                    style={{ background: 'rgba(215,30,40,0.06)', border: `1px solid rgba(215,30,40,0.15)` }}>
                                                    <AlertCircle size={15} style={{ color: WF.red, flexShrink: 0 }} />
                                                    <div>
                                                        <p className="text-xs font-bold" style={{ color: WF.red }}>Insufficient Funds</p>
                                                        <p className="text-xs mt-0.5" style={{ color: '#991B1B' }}>
                                                            You need ${(amountNum - balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} more.{' '}
                                                            {onRequestDeposit && (
                                                                <button onClick={() => { onClose(); onRequestDeposit(); }}
                                                                    className="font-bold underline">
                                                                    Deposit funds →
                                                                </button>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick amounts */}
                                        <div className="flex gap-2 flex-wrap">
                                            {[portfolio.minAmount, portfolio.minAmount * 2, portfolio.minAmount * 5, portfolio.minAmount * 10].map(q => (
                                                <button key={q} onClick={() => setAmount(String(q))}
                                                    className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
                                                    style={{
                                                        background: amountNum === q ? WF.red : WF.surface,
                                                        color: amountNum === q ? '#fff' : WF.muted,
                                                        border: `1px solid ${amountNum === q ? WF.red : WF.border}`,
                                                    }}>
                                                    ${q.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Risk disclaimer */}
                                        <div className="flex items-start gap-3 p-4 rounded-2xl"
                                            style={{ background: 'rgba(107,101,96,0.05)', border: `1px solid ${WF.border}` }}>
                                            <Info size={14} style={{ color: WF.muted, flexShrink: 0, marginTop: 1 }} />
                                            <p className="text-[10px] leading-relaxed" style={{ color: WF.muted }}>
                                                Investments involve risk, including possible loss of principal. Past performance is not indicative of future results.
                                                West Bank investment products are not FDIC insured, not bank guaranteed, and may lose value.
                                            </p>
                                        </div>

                                        {/* Consent checkbox */}
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div onClick={() => setAgreed(a => !a)}
                                                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                                                style={{
                                                    background: agreed ? WF.red : WF.surface,
                                                    border: `2px solid ${agreed ? WF.red : WF.border}`,
                                                }}>
                                                {agreed && <Check size={11} color="#fff" />}
                                            </div>
                                            <span className="text-xs leading-relaxed" style={{ color: WF.muted }}>
                                                I understand the risks and agree to the{' '}
                                                <span className="font-bold" style={{ color: WF.black }}>West Bank Investment Terms</span>{' '}
                                                and authorize this investment from my account.
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!success && (
                        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0"
                            style={{ background: WF.surface, borderTop: `1px solid ${WF.border}` }}>
                            {step > 1 ? (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="flex items-center gap-1.5 text-sm font-bold"
                                    style={{ color: WF.muted }}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            ) : <div />}

                            {step < 2 ? (
                                <button onClick={() => setStep(2)} disabled={!isStep1Valid}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{
                                        background: isStep1Valid ? WF.red : WF.border,
                                        color: isStep1Valid ? '#fff' : WF.muted,
                                    }}>
                                    Review <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button onClick={handleConfirm} disabled={!isStep2Valid || loading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{
                                        background: isStep2Valid ? WF.black : WF.border,
                                        color: isStep2Valid ? '#fff' : WF.muted,
                                        boxShadow: isStep2Valid ? '0 8px 20px -6px rgba(26,26,26,0.4)' : 'none',
                                    }}>
                                    {loading && <Loader2 size={15} className="animate-spin" />}
                                    {loading ? 'Processing…' : 'Confirm Investment'}
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
