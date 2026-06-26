'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, ChevronRight, DollarSign, Building2, Smartphone,
    FileCheck, Bitcoin, Wallet, CreditCard, Copy, Check,
    Gift, AlertTriangle, Lock, ChevronLeft, ShieldCheck
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
};

// Default fallbacks (overridden by live fetch)
const DEFAULT_SETTINGS: Record<string, string> = {
    btc_address:    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    usdt_address:   '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    wire_routing:   '021000021',
    wire_account:   '987654321',
    wire_bank_name: 'West Bank, N.A.',
    zelle_email:    'pay@westbank.com',
    quickpay_email: 'quickpay@westbank.com',
    ach_routing:    '021000021',
    ach_corp_id:    '99-10293',
    dd_routing:     '021000021',
    dd_account:     '987654321',
};

const DEPOSIT_OPTIONS = [
    { id: 'BTC',      label: 'Bitcoin (BTC)',     icon: Bitcoin,   desc: 'Instant crypto deposit',     accent: '#F7931A', accentBg: 'rgba(247,147,26,0.08)', locked: false },
    { id: 'USDT',     label: 'Tether (USDT)',     icon: Wallet,    desc: 'ERC-20 network',             accent: '#26A17B', accentBg: 'rgba(38,161,123,0.08)', locked: false },
    { id: 'GIFT',     label: 'Gift Card',         icon: Gift,      desc: 'Redeem code or card photo',  accent: '#EC4899', accentBg: 'rgba(236,72,153,0.08)', locked: false },
    { id: 'WIRE',     label: 'Wire Transfer',     icon: Building2, desc: 'Domestic & international',   accent: WF.red,    accentBg: 'rgba(215,30,40,0.08)',  locked: false },
    { id: 'ZELLE',    label: 'Zelle',             icon: Smartphone,desc: 'Instant P2P',               accent: '#6D28D9', accentBg: 'rgba(109,40,217,0.08)', locked: false },
    { id: 'QUICKPAY', label: 'Chase QuickPay',    icon: Smartphone,desc: 'Direct transfer',            accent: '#1C64F2', accentBg: 'rgba(28,100,242,0.08)', locked: false },
    { id: 'ACH',      label: 'ACH Transfer',      icon: DollarSign,desc: '3–5 business days',         accent: WF.muted,  accentBg: 'rgba(107,101,96,0.08)', locked: false },
    { id: 'DD',       label: 'Direct Deposit',    icon: CreditCard,desc: 'Payroll / benefits',         accent: WF.muted,  accentBg: 'rgba(107,101,96,0.08)', locked: false },
    { id: 'CHECK',    label: 'Mobile Check',      icon: FileCheck, desc: 'Not yet available',          accent: WF.muted,  accentBg: 'rgba(107,101,96,0.06)', locked: true  },
];

function getInstructions(optionId: string, s: Record<string, string>): string {
    switch (optionId) {
        case 'BTC':      return s.btc_address;
        case 'USDT':     return s.usdt_address;
        case 'GIFT':     return 'Enter the card code below or upload a photo of the back of the card.';
        case 'WIRE':     return `Routing: ${s.wire_routing} · Account: ${s.wire_account} · ${s.wire_bank_name}`;
        case 'ZELLE':    return s.zelle_email;
        case 'QUICKPAY': return s.quickpay_email;
        case 'ACH':      return `West Bank LLC · Corp ID: ${s.ach_corp_id} · Routing: ${s.ach_routing}`;
        case 'DD':       return `Routing: ${s.dd_routing} · Account: ${s.dd_account}`;
        default:         return '';
    }
}

export default function BankingSidebar({ isOpen, onClose, userId }: SidebarProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [giftCode, setGiftCode] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [ineligibleModal, setIneligibleModal] = useState(false);
    const [paySettings, setPaySettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);

    // Fetch live payment settings when sidebar opens
    useEffect(() => {
        if (!isOpen) return;
        fetch('/api/payment-settings')
            .then(r => r.json())
            .then(data => setPaySettings({ ...DEFAULT_SETTINGS, ...data }))
            .catch(() => {}); // silently fall back to defaults
    }, [isOpen]);

    const option = DEPOSIT_OPTIONS.find(o => o.id === selectedOption);
    const instructionText = selectedOption ? getInstructions(selectedOption, paySettings) : '';
    const isCrypto = selectedOption === 'BTC' || selectedOption === 'USDT';
    const isGift = selectedOption === 'GIFT';

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSelect = (id: string) => {
        const opt = DEPOSIT_OPTIONS.find(o => o.id === id);
        if (opt?.locked) { setIneligibleModal(true); return; }
        setSelectedOption(id);
        setFile(null);
        setGiftCode('');
    };

    const handleBack = () => {
        setSelectedOption(null);
        setFile(null);
        setGiftCode('');
        setAmount('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !selectedOption) return;
        if (!isGift && !file) { alert('A screenshot or proof of payment is required.'); return; }
        if (isGift && !file && !giftCode) { alert('Enter the gift card code or upload a photo.'); return; }

        setUploading(true);
        let proofUrl: string | null = null;

        if (file) {
            const fileName = `${userId}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);
            if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploading(false); return; }
            const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
            proofUrl = data.publicUrl;
        }

        const { error: dbError } = await supabase.from('transactions').insert([{
            user_id: userId,
            direction: 'DEPOSIT',
            type: selectedOption,
            amount: parseFloat(amount),
            status: 'PENDING',
            proof_url: proofUrl,
            notes: isGift && giftCode ? `Gift Code: ${giftCode}` : null,
        }]);

        if (dbError) {
            alert('Transaction failed: ' + dbError.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedOption(null);
                setAmount('');
                setGiftCode('');
                setFile(null);
            }, 2200);
        }
        setUploading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[400px] z-[60] shadow-2xl flex flex-col"
                        style={{ background: WF.bg, borderLeft: `1px solid ${WF.border}`, maxHeight: '100dvh' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 pt-6 pb-4 flex-shrink-0"
                            style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}>
                            <div className="flex items-center gap-3">
                                {selectedOption && (
                                    <button onClick={handleBack}
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-sm"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                        <ChevronLeft size={15} style={{ color: WF.muted }} />
                                    </button>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: WF.muted }}>
                                        {selectedOption ? option?.desc : 'Deposit Funds'}
                                    </p>
                                    <h2 className="font-display text-xl font-bold mt-0.5" style={{ color: WF.black }}>
                                        {selectedOption ? option?.label : 'Add Money'}
                                    </h2>
                                </div>
                            </div>
                            <button onClick={onClose}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-sm"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                <X size={16} style={{ color: WF.muted }} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10" style={{ WebkitOverflowScrolling: 'touch' }}>

                            {/* ── Method list ─────────────────────────────────────────── */}
                            {!selectedOption && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[2px] mb-4" style={{ color: WF.muted }}>
                                        Select Deposit Method
                                    </p>
                                    {DEPOSIT_OPTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => handleSelect(opt.id)}
                                            disabled={opt.locked}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl group transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: opt.accentBg }}>
                                                    {opt.locked
                                                        ? <Lock size={16} style={{ color: WF.muted }} />
                                                        : <opt.icon size={16} style={{ color: opt.accent }} />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold" style={{ color: opt.locked ? WF.muted : WF.black }}>
                                                        {opt.label}
                                                    </p>
                                                    <p className="text-[10px] mt-0.5" style={{ color: WF.muted }}>{opt.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={15} style={{ color: WF.border }}
                                                className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── Deposit form ─────────────────────────────────────────── */}
                            {selectedOption && (
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* Amount */}
                                    <div className="rounded-2xl p-5" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                        <p className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: WF.muted }}>
                                            Deposit Amount (USD)
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold" style={{ color: WF.muted }}>$</span>
                                            <input
                                                type="number" min="0.01" step="0.01"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="bg-transparent text-3xl font-bold placeholder:text-gray-300 w-full outline-none font-display"
                                                style={{ color: WF.black }}
                                                required autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* QR for crypto */}
                                    {isCrypto && (
                                        <div className="rounded-2xl p-5 flex flex-col items-center"
                                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                            <div className="w-36 h-36 p-2 rounded-xl mb-3"
                                                style={{ background: '#fff', border: `2px solid ${WF.border}` }}>
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${instructionText}`}
                                                    alt="QR"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold" style={{ color: WF.muted }}>
                                                Scan to pay · {selectedOption} Network
                                            </p>
                                        </div>
                                    )}

                                    {/* Payment details / address (non-gift) */}
                                    {!isGift && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: WF.muted }}>
                                                {isCrypto ? 'Wallet Address' : 'Payment Details'}
                                            </p>
                                            <div
                                                onClick={() => handleCopy(instructionText)}
                                                className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
                                                style={{
                                                    background: WF.surface,
                                                    border: `1.5px solid ${copied ? (option?.accent ?? WF.red) : WF.border}`,
                                                }}>
                                                <p className="flex-1 text-xs font-mono leading-relaxed break-all" style={{ color: WF.black }}>
                                                    {instructionText}
                                                </p>
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                                    style={{ background: WF.bg, color: copied ? (option?.accent ?? WF.red) : WF.muted }}>
                                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-center mt-1.5 transition-colors"
                                                style={{ color: copied ? (option?.accent ?? WF.red) : WF.muted }}>
                                                {copied ? '✓ Copied to clipboard' : 'Tap to copy'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Gift card section */}
                                    {isGift && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
                                                    Option 1: Card Code
                                                </label>
                                                <input
                                                    type="text" value={giftCode}
                                                    onChange={e => setGiftCode(e.target.value)}
                                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono transition-all"
                                                    style={{ background: WF.surface, border: `1px solid ${WF.border}`, color: WF.black }}
                                                />
                                            </div>
                                            <div className="text-center text-xs" style={{ color: WF.muted }}>— or —</div>
                                            <div>
                                                <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
                                                    Option 2: Upload Card Photo
                                                </label>
                                                <div className="relative group">
                                                    <input type="file" accept="image/*"
                                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                    <div className="rounded-xl p-5 flex flex-col items-center gap-2 transition-all"
                                                        style={{
                                                            border: `2px dashed ${file ? '#EC4899' : WF.border}`,
                                                            background: file ? 'rgba(236,72,153,0.04)' : WF.surface,
                                                        }}>
                                                        <Upload size={18} style={{ color: file ? '#EC4899' : WF.muted }} />
                                                        <span className="text-xs" style={{ color: file ? WF.black : WF.muted }}>
                                                            {file ? file.name : 'Upload card image'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Proof upload (crypto + standard) */}
                                    {!isGift && (
                                        <div>
                                            <label className="text-xs font-bold flex items-center gap-1.5 mb-1.5"
                                                style={{ color: WF.red }}>
                                                <AlertTriangle size={12} />
                                                Proof of Payment <span style={{ color: WF.muted, fontWeight: 400 }}>(required)</span>
                                            </label>
                                            <div className="relative group">
                                                <input type="file" accept="image/*"
                                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <div className="rounded-xl p-5 flex flex-col items-center gap-2 transition-all"
                                                    style={{
                                                        border: `2px dashed ${file ? WF.red : 'rgba(215,30,40,0.3)'}`,
                                                        background: file ? 'rgba(215,30,40,0.04)' : WF.surface,
                                                    }}>
                                                    <Upload size={18} style={{ color: file ? WF.red : WF.muted }} />
                                                    <span className="text-xs" style={{ color: file ? WF.black : WF.muted }}>
                                                        {file ? file.name : 'Upload payment screenshot or receipt'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security note */}
                                    <div className="flex items-start gap-3 p-4 rounded-2xl"
                                        style={{ background: 'rgba(215,30,40,0.05)', border: `1px solid rgba(215,30,40,0.12)` }}>
                                        <ShieldCheck size={14} style={{ color: WF.red, flexShrink: 0, marginTop: 1 }} />
                                        <p className="text-[10px] leading-relaxed" style={{ color: '#7B0F15' }}>
                                            Your deposit will be reviewed by West Bank and credited to your account within 1–3 business days.
                                        </p>
                                    </div>

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={uploading || success}
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                        style={{
                                            background: success ? '#16A34A' : WF.red,
                                            boxShadow: `0 8px 20px -6px ${success ? 'rgba(22,163,74,0.4)' : 'rgba(215,30,40,0.4)'}`,
                                        }}>
                                        {success
                                            ? <><Check size={18} /> Deposit Submitted!</>
                                            : uploading
                                                ? 'Processing…'
                                                : 'Submit Deposit Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>

                    {/* Ineligible modal (mobile check) */}
                    <AnimatePresence>
                        {ineligibleModal && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                    onClick={() => setIneligibleModal(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    className="relative z-[80] w-full max-w-sm rounded-3xl p-7 shadow-2xl"
                                    style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                                        style={{ background: 'rgba(215,30,40,0.08)' }}>
                                        <Lock size={26} style={{ color: WF.red }} />
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-center mb-2" style={{ color: WF.black }}>
                                        Feature Locked
                                    </h3>
                                    <p className="text-sm text-center leading-relaxed mb-7" style={{ color: WF.muted }}>
                                        Mobile Check Deposit is not yet available for your account. Build your account history with
                                        Wire or Crypto deposits to unlock this feature.
                                    </p>
                                    <button onClick={() => setIneligibleModal(false)}
                                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90"
                                        style={{ background: WF.black }}>
                                        Got It
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
