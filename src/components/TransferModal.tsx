'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, Globe, Users, Building2, Bitcoin,
    Smartphone, DollarSign, CreditCard, CheckCircle,
    Loader2, ShieldCheck, AlertCircle, ChevronLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    userEmail?: string;
    balance?: number;
    onBalanceUpdate?: (newBalance: number) => void;
}

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
};

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TRANSFER_TYPES = [
    {
        id: 'LOCAL', title: 'Local Transfer', desc: 'Send to US banks instantly',
        icon: Users, badge: '⚡ Instant', badgeColor: 'rgba(22,163,74,0.1)', badgeText: '#14532D',
    },
    {
        id: 'INTL', title: 'International Wire', desc: 'Global transfers via SWIFT/SEPA',
        icon: Globe, badge: '🕒 1–3 Days', badgeColor: 'rgba(245,158,11,0.1)', badgeText: '#92400E',
    },
];

const METHODS = [
    { id: 'WIRE',     title: 'Wire Transfer',   icon: Building2  },
    { id: 'CRYPTO',   title: 'Cryptocurrency',  icon: Bitcoin    },
    { id: 'PAYPAL',   title: 'PayPal',          icon: CreditCard },
    { id: 'WISE',     title: 'Wise',            icon: Globe      },
    { id: 'CASHAPP',  title: 'Cash App',        icon: Smartphone },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
            {children}{required && <span className="ml-0.5" style={{ color: WF.red }}>*</span>}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black, ...props.style as any }}
        />
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TransferModal({
    isOpen, onClose, userId, userEmail, balance = 0, onBalanceUpdate
}: TransferModalProps) {
    const [step, setStep] = useState(1);
    const [transferType, setTransferType] = useState('');
    const [method, setMethod] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [txId, setTxId] = useState('');

    const [formData, setFormData] = useState({
        amount: '', name: '', bank: '', accountNumber: '',
        routing: '', walletAddress: '',
    });

    const patch = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData(prev => ({ ...prev, [k]: e.target.value }));

    const handleTypeSelect = (id: string) => {
        setTransferType(id); setErrorMsg('');
        setStep(id === 'LOCAL' ? 3 : 2);
    };

    const handleMethodSelect = (id: string) => { setMethod(id); setStep(3); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setErrorMsg('');
        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) { setErrorMsg('Please enter a valid amount.'); return; }
        if (amount > balance) {
            setErrorMsg(`Insufficient funds. Available: $${fmt(balance)}.`); return;
        }
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');
            const res = await fetch('/api/user/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({
                    amount, transferType, method: method || transferType,
                    bankName: formData.bank || null, accountNumber: formData.accountNumber || null,
                    routing: formData.routing || null, walletTo: formData.walletAddress || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setErrorMsg(data.error ?? 'Transfer failed.'); setIsLoading(false); return; }
            setTxId(data.transactionId ?? '');
            if (onBalanceUpdate) onBalanceUpdate(data.newBalance);
            setStep(4);
        } catch (err: any) { setErrorMsg(err.message ?? 'Something went wrong.'); }
        setIsLoading(false);
    };

    const reset = () => {
        setStep(1); setTransferType(''); setMethod(''); setErrorMsg(''); setTxId('');
        setFormData({ amount: '', name: '', bank: '', accountNumber: '', routing: '', walletAddress: '' });
        onClose();
    };

    if (!isOpen) return null;

    const stepLabels: Record<number, string> = {
        1: 'Transfer Type',
        2: 'Payment Method',
        3: 'Withdrawal Details',
        4: 'Confirmation',
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center font-sans">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    className="relative w-full max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
                    style={{ background: WF.bg, maxHeight: '92dvh' }}
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
                        style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}>
                        <div className="flex items-center gap-3">
                            {step > 1 && step < 4 && (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-sm"
                                    style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                    <ChevronLeft size={15} style={{ color: WF.muted }} />
                                </button>
                            )}
                            <div>
                                <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: WF.muted }}>
                                    {stepLabels[step]}
                                </p>
                                <h2 className="font-display text-xl font-bold mt-0.5" style={{ color: WF.black }}>
                                    Send Money
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-sm"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <X size={16} style={{ color: WF.muted }} />
                        </button>
                    </div>

                    {/* Progress bar */}
                    {step < 4 && (
                        <div className="h-0.5 w-full flex-shrink-0" style={{ background: WF.border }}>
                            <div className="h-full transition-all duration-500"
                                style={{ width: `${((step - 1) / 3) * 100}%`, background: WF.red }} />
                        </div>
                    )}

                    {/* Balance pill */}
                    {step < 4 && (
                        <div className="px-6 pt-4 pb-1 flex-shrink-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                <span className="text-[10px]" style={{ color: WF.muted }}>Available:</span>
                                <span className="text-[11px] font-bold" style={{ color: WF.black }}>${fmt(balance)}</span>
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="overflow-y-auto flex-1 p-6">

                        {/* Step 1 — Transfer type */}
                        {step === 1 && (
                            <div className="space-y-4">
                                {TRANSFER_TYPES.map(t => (
                                    <button key={t.id} onClick={() => handleTypeSelect(t.id)}
                                        className="w-full p-5 rounded-2xl flex items-center justify-between group transition-all hover:shadow-md"
                                        style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                                <t.icon size={20} style={{ color: WF.red }} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold" style={{ color: WF.black }}>{t.title}</p>
                                                <p className="text-xs mt-0.5" style={{ color: WF.muted }}>{t.desc}</p>
                                                <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: t.badgeColor, color: t.badgeText }}>
                                                    {t.badge}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} style={{ color: WF.border }}
                                            className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                ))}

                                {/* Security note */}
                                <div className="flex items-start gap-3 p-4 rounded-2xl"
                                    style={{ background: 'rgba(215,30,40,0.05)', border: `1px solid rgba(215,30,40,0.12)` }}>
                                    <ShieldCheck size={16} style={{ color: WF.red, flexShrink: 0, marginTop: 1 }} />
                                    <p className="text-xs leading-relaxed" style={{ color: '#7B0F15' }}>
                                        <strong>Secure Transfer:</strong> All withdrawals are manually reviewed.
                                        You'll receive an email confirmation once submitted.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2 — Method */}
                        {step === 2 && (
                            <div className="space-y-3">
                                {METHODS.map(m => (
                                    <button key={m.id} onClick={() => handleMethodSelect(m.id)}
                                        className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all hover:shadow-md"
                                        style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: WF.bg }}>
                                                <m.icon size={18} style={{ color: WF.muted }} />
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: WF.black }}>{m.title}</span>
                                        </div>
                                        <ChevronRight size={16} style={{ color: WF.border }}
                                            className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 3 — Form */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Amount */}
                                <div className="rounded-2xl p-5" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: WF.muted }}>
                                        Amount to Withdraw
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold" style={{ color: WF.muted }}>$</span>
                                        <input
                                            type="number" min="0.01" step="0.01"
                                            value={formData.amount}
                                            onChange={patch('amount')}
                                            placeholder="0.00"
                                            className="bg-transparent text-3xl font-bold placeholder:text-gray-300 w-full outline-none font-display"
                                            style={{ color: WF.black }}
                                            required autoFocus
                                        />
                                    </div>
                                    {formData.amount && parseFloat(formData.amount) > 0 && (
                                        <p className="text-xs mt-3 pt-3"
                                            style={{ color: WF.muted, borderTop: `1px solid ${WF.border}` }}>
                                            Remaining balance:{' '}
                                            <span className="font-bold" style={{ color: WF.black }}>
                                                ${fmt(Math.max(0, balance - parseFloat(formData.amount)))}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <FieldLabel required>Account Holder Name</FieldLabel>
                                        <Input placeholder="John Doe" value={formData.name} onChange={patch('name')} required />
                                    </div>

                                    {method !== 'CRYPTO' ? (
                                        <>
                                            <div>
                                                <FieldLabel required>Bank Name</FieldLabel>
                                                <Input placeholder="e.g. Chase Bank" value={formData.bank} onChange={patch('bank')} required />
                                            </div>
                                            <div>
                                                <FieldLabel required>Account Number {transferType === 'INTL' ? '/ IBAN' : ''}</FieldLabel>
                                                <Input
                                                    placeholder={transferType === 'INTL' ? 'GB29NWBK6016…' : '000000000000'}
                                                    value={formData.accountNumber} onChange={patch('accountNumber')} required
                                                    style={{ fontFamily: 'monospace' } as any}
                                                />
                                            </div>
                                            {transferType === 'INTL' ? (
                                                <div>
                                                    <FieldLabel required>SWIFT / BIC Code</FieldLabel>
                                                    <Input
                                                        placeholder="CHASUS33"
                                                        value={formData.routing} onChange={patch('routing')} required
                                                        style={{ fontFamily: 'monospace' } as any}
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <FieldLabel>Routing Number</FieldLabel>
                                                    <Input
                                                        placeholder="021000021"
                                                        value={formData.routing} onChange={patch('routing')}
                                                        style={{ fontFamily: 'monospace' } as any}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div>
                                            <FieldLabel required>Your Wallet Address</FieldLabel>
                                            <Input
                                                placeholder="bc1q… or 0x…"
                                                value={formData.walletAddress} onChange={patch('walletAddress')}
                                                required style={{ fontFamily: 'monospace' } as any}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Error */}
                                {errorMsg && (
                                    <div className="flex items-center gap-2.5 p-4 rounded-2xl text-xs"
                                        style={{ background: 'rgba(215,30,40,0.06)', border: `1px solid rgba(215,30,40,0.2)`, color: '#7B0F15' }}>
                                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                        <p className="font-medium">{errorMsg}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: WF.red, boxShadow: `0 8px 20px -6px rgba(215,30,40,0.4)` }}>
                                    {isLoading
                                        ? <><Loader2 size={18} className="animate-spin" /> Processing…</>
                                        : 'Confirm Withdrawal'}
                                </button>
                            </form>
                        )}

                        {/* Step 4 — Success */}
                        {step === 4 && (
                            <div className="flex flex-col items-center text-center py-8 gap-4">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(22,163,74,0.1)' }}>
                                    <CheckCircle size={40} style={{ color: '#16A34A' }} />
                                </div>

                                <div>
                                    <h3 className="font-display text-2xl font-bold" style={{ color: WF.black }}>
                                        Withdrawal Submitted
                                    </h3>
                                    <p className="text-sm mt-2 leading-relaxed" style={{ color: WF.muted }}>
                                        Your withdrawal of{' '}
                                        <span className="font-bold" style={{ color: WF.black }}>
                                            ${fmt(parseFloat(formData.amount))}
                                        </span>{' '}
                                        is pending review by West Bank.
                                    </p>
                                </div>

                                {userEmail && (
                                    <p className="text-xs" style={{ color: WF.muted }}>
                                        Confirmation sent to <span className="font-bold" style={{ color: WF.black }}>{userEmail}</span>
                                    </p>
                                )}

                                {txId && (
                                    <p className="text-[10px] font-mono px-3 py-1.5 rounded-lg"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.muted }}>
                                        Ref: {txId}
                                    </p>
                                )}

                                <div className="w-full flex items-start gap-3 p-4 rounded-2xl mt-2"
                                    style={{ background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.2)` }}>
                                    <ShieldCheck size={15} style={{ color: '#92400E', flexShrink: 0, marginTop: 1 }} />
                                    <p className="text-xs leading-relaxed text-left" style={{ color: '#92400E' }}>
                                        Withdrawals are manually reviewed within 1–3 business days.
                                        You'll be notified by email once it's processed.
                                    </p>
                                </div>

                                <button onClick={reset}
                                    className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 mt-2"
                                    style={{ background: WF.black }}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
