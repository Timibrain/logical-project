'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Copy, Check, X, Bitcoin, Wallet, ChevronLeft, ScanLine, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
};

const WALLET_META = {
    BTC: {
        id: 'BTC', label: 'Bitcoin', symbol: 'BTC',
        network: 'Bitcoin Network', color: '#F7931A',
        bg: 'rgba(247,147,26,0.08)', icon: Bitcoin, minConfirm: '3 confirmations',
    },
    USDT: {
        id: 'USDT', label: 'Tether', symbol: 'USDT',
        network: 'ERC-20 (Ethereum)', color: '#26A17B',
        bg: 'rgba(38,161,123,0.08)', icon: Wallet, minConfirm: '12 confirmations',
    },
};

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [selected, setSelected] = useState<'BTC' | 'USDT'>('BTC');
    const [copied, setCopied] = useState(false);
    const [addresses, setAddresses] = useState({
        BTC:  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        USDT: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    });

    // Fetch live addresses whenever modal opens
    useEffect(() => {
        if (!isOpen) return;
        fetch('/api/payment-settings')
            .then(r => r.json())
            .then(data => {
                setAddresses(prev => ({
                    BTC:  data.btc_address  || prev.BTC,
                    USDT: data.usdt_address || prev.USDT,
                }));
            })
            .catch(() => {});
    }, [isOpen]);

    const wallet = { ...WALLET_META[selected], address: addresses[selected] };

    const handleCopy = () => {
        navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center font-sans">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Sheet */}
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
                        <div>
                            <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: WF.muted }}>
                                Crypto Deposit
                            </p>
                            <h2 className="font-display text-xl font-bold mt-0.5" style={{ color: WF.black }}>
                                Receive Funds
                            </h2>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-sm"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <X size={16} style={{ color: WF.muted }} />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
                        {/* Asset selector */}
                        <div className="flex gap-2">
                            {Object.values(WALLET_META).map(w => (
                                <button key={w.id} onClick={() => setSelected(w.id as 'BTC' | 'USDT')}
                                    className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                    style={{
                                        background: selected === w.id ? WF.surface : 'transparent',
                                        border: `1.5px solid ${selected === w.id ? w.color : WF.border}`,
                                        color: selected === w.id ? w.color : WF.muted,
                                        boxShadow: selected === w.id ? `0 4px 12px -4px ${w.color}40` : 'none',
                                    }}>
                                    <w.icon size={15} />
                                    {w.symbol}
                                </button>
                            ))}
                        </div>

                        {/* Network info */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                            style={{ background: wallet.bg, border: `1px solid ${wallet.color}20` }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: wallet.bg, border: `1px solid ${wallet.color}30` }}>
                                <wallet.icon size={16} style={{ color: wallet.color }} />
                            </div>
                            <div>
                                <p className="text-xs font-bold" style={{ color: WF.black }}>
                                    {wallet.label} ({wallet.symbol})
                                </p>
                                <p className="text-[10px]" style={{ color: WF.muted }}>
                                    Network: {wallet.network} · {wallet.minConfirm}
                                </p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="rounded-2xl p-5 flex flex-col items-center"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                            <div className="w-40 h-40 p-2 rounded-xl mb-3"
                                style={{ background: '#fff', border: `2px solid ${WF.border}` }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet.address}`}
                                    alt={`${wallet.symbol} QR`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold"
                                style={{ color: WF.muted }}>
                                <ScanLine size={12} />
                                Scan to deposit {wallet.symbol}
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: WF.muted }}>
                                Wallet Address
                            </p>
                            <div
                                onClick={handleCopy}
                                className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all group hover:shadow-sm"
                                style={{ background: WF.surface, border: `1.5px solid ${copied ? wallet.color : WF.border}` }}>
                                <p className="flex-1 text-xs font-mono break-all leading-relaxed"
                                    style={{ color: WF.black }}>
                                    {wallet.address}
                                </p>
                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                    style={{ background: copied ? wallet.bg : WF.bg, color: copied ? wallet.color : WF.muted }}>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </div>
                            </div>
                            <p className="text-[10px] text-center mt-2 transition-colors"
                                style={{ color: copied ? wallet.color : WF.muted }}>
                                {copied ? '✓ Copied to clipboard' : 'Tap to copy address'}
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="px-4 py-3 rounded-2xl text-xs leading-relaxed"
                            style={{ background: 'rgba(215,30,40,0.06)', border: `1px solid rgba(215,30,40,0.12)`, color: '#991B1B' }}>
                            <strong>Important:</strong> Only send <strong>{wallet.symbol}</strong> via the{' '}
                            <strong>{wallet.network}</strong>. Sending any other asset or using the wrong network
                            may result in permanent loss of funds.
                        </div>

                        {/* Security note */}
                        <div className="flex items-center gap-2 pb-2">
                            <ShieldCheck size={13} style={{ color: WF.muted }} />
                            <p className="text-[10px]" style={{ color: WF.muted }}>
                                Deposits are processed after {wallet.minConfirm} and reviewed by West Bank.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
