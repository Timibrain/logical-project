'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ChevronRight, DollarSign, Building2, Smartphone, FileCheck, Bitcoin, Wallet, CreditCard, Copy, Check, Gift, AlertTriangle, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

// --- 🔧 ADMIN CONFIGURATION ---
const CRYPTO_WALLETS = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    USDT: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
};

const BANK_OPTIONS = [
    { id: 'BTC', label: 'Bitcoin (BTC)', icon: Bitcoin, desc: 'Instant Crypto Deposit' },
    { id: 'USDT', label: 'Tether (USDT)', icon: Wallet, desc: 'ERC-20 Network' },
    { id: 'GIFT', label: 'Gift Card', icon: Gift, desc: 'Redeem Code / Card' },
    { id: 'WIRE', label: 'Wire Transfer', icon: Building2, desc: 'Domestic & International' },
    { id: 'ZELLE', label: 'Zelle', icon: Smartphone, desc: 'Instant P2P' },
    { id: 'QUICKPAY', label: 'Chase QuickPay', icon: Smartphone, desc: 'Direct Transfer' },
    { id: 'ACH', label: 'ACH Transfer', icon: DollarSign, desc: '3-5 Business Days' },
    { id: 'DD', label: 'Direct Deposit', icon: CreditCard, desc: 'Payroll / Benefits' },
    { id: 'CHECK', label: 'Mobile Check', icon: FileCheck, desc: 'Photo Capture' },
];

export default function BankingSidebar({ isOpen, onClose, userId }: SidebarProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [giftCode, setGiftCode] = useState(''); // New State for Gift Card Code
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [ineligibleModal, setIneligibleModal] = useState(false); // Modal for Check Deposit

    // --- HELPER: COPY TEXT ---
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- HELPER: HANDLE SELECTION ---
    const handleSelect = (id: string) => {
        if (id === 'CHECK') {
            setIneligibleModal(true); // Trigger Ineligible Modal
        } else {
            setSelectedOption(id);
            setFile(null); // Reset file
            setGiftCode(''); // Reset code
        }
    };

    // --- HELPER: GET INSTRUCTIONS ---
    const getInstructions = () => {
        switch (selectedOption) {
            case 'BTC': return CRYPTO_WALLETS.BTC;
            case 'USDT': return CRYPTO_WALLETS.USDT;
            case 'GIFT': return 'Enter the card code below OR upload a clear photo of the card (back side).';
            case 'WIRE': return 'Routing: 021000021 // Acct: 987654321';
            case 'ZELLE': return 'pay@aether-core.bank';
            case 'QUICKPAY': return 'quickpay@aether-core.bank';
            case 'ACH': return 'Aether Core LLC // Corp ID: 99-10293';
            case 'DD': return 'Routing: 021000021 // Acct: 987654321';
            default: return '';
        }
    };

    const instructionText = getInstructions();
    const isCrypto = selectedOption === 'BTC' || selectedOption === 'USDT';
    const isGift = selectedOption === 'GIFT';

    // --- HANDLE SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !selectedOption) return;

        // VALIDATION: Crypto MUST have a file
        if (isCrypto && !file) {
            alert("Proof of payment is REQUIRED for Crypto deposits.");
            return;
        }

        // VALIDATION: Gift Card MUST have either File OR Code
        if (isGift && !file && !giftCode) {
            alert("Please enter the Gift Card Code OR upload a photo of the card.");
            return;
        }

        setUploading(true);
        let proofUrl = null;

        if (file) {
            const fileName = `${userId}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);
            if (uploadError) {
                alert('Upload failed: ' + uploadError.message);
                setUploading(false);
                return;
            }
            const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
            proofUrl = data.publicUrl;
        }

        // Include Gift Code in description if provided
        const description = isGift && giftCode ? `Gift Code: ${giftCode}` : null;

        const { error: dbError } = await supabase.from('transactions').insert([{
            user_id: userId,
            type: selectedOption,
            amount: parseFloat(amount),
            status: 'PENDING',
            proof_url: proofUrl,
            // You might want to add a 'description' column to your table for the gift code
            // For now, it's just handled in logic, ensuring the admin checks the proof
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
            }, 2000);
        }
        setUploading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#0a0c10] border-l border-white/10 z-[60] p-6 shadow-2xl flex flex-col overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h2 className="text-lg font-bold font-sans tracking-tight text-white">Move Money</h2>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {!selectedOption ? (
                            // MENU LIST
                            <div className="flex-col gap-2 flex">
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Select Method</p>
                                {BANK_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(opt.id)}
                                        className={`flex items-center justify-between p-3 border rounded-lg group transition-all ${opt.id === 'BTC' || opt.id === 'USDT'
                                                ? 'bg-[#1a1a1a] border-white/10 hover:border-[#00f2ff] hover:bg-[#00f2ff]/5'
                                                : opt.id === 'GIFT'
                                                    ? 'bg-[#1a1a1a] border-white/10 hover:border-pink-500 hover:bg-pink-500/10'
                                                    : opt.id === 'CHECK'
                                                        ? 'bg-[#1a1a1a] border-white/10 hover:border-red-500 hover:bg-red-500/10 opacity-75'
                                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${opt.id === 'BTC' ? 'text-orange-500 bg-orange-500/10' :
                                                    opt.id === 'USDT' ? 'text-emerald-500 bg-emerald-500/10' :
                                                        opt.id === 'GIFT' ? 'text-pink-500 bg-pink-500/10' :
                                                            opt.id === 'CHECK' ? 'text-red-400 bg-red-400/10' :
                                                                'text-gray-400 bg-black'
                                                }`}>
                                                {opt.id === 'CHECK' ? <Lock size={16} /> : <opt.icon size={16} />}
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-xs font-bold text-white">{opt.label}</span>
                                                <span className="block text-[9px] text-gray-500 font-mono mt-0.5">{opt.desc}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-white" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // DEPOSIT FORM
                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOption(null)}
                                    className="text-[9px] text-gray-500 hover:text-white mb-6 flex items-center gap-1 font-mono uppercase tracking-widest"
                                >
                                    ← Back
                                </button>

                                <h3 className="text-lg font-bold text-white mb-0.5">{BANK_OPTIONS.find(o => o.id === selectedOption)?.label}</h3>
                                <p className="text-[10px] text-gray-400 mb-6">Initiate your deposit request below.</p>

                                {/* Amount Input */}
                                <div className="mb-5">
                                    <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Value (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black border border-white/20 rounded-lg py-3 pl-6 pr-4 text-white text-sm focus:border-[#00f2ff] outline-none transition-colors font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* --- QR CODE (Only for Crypto) --- */}
                                {isCrypto && (
                                    <div className="mb-5 flex flex-col items-center justify-center p-4 bg-white rounded-lg">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${instructionText}`}
                                            alt="Deposit QR"
                                            className="w-32 h-32 object-contain"
                                        />
                                        <p className="mt-2 text-[9px] text-black font-bold uppercase tracking-widest">Scan to Pay</p>
                                    </div>
                                )}

                                {/* --- INSTRUCTIONS / COPY ADDRESS --- */}
                                {!isGift && (
                                    <div className="mb-6">
                                        <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-mono">
                                            {isCrypto ? 'Wallet Address' : 'Payment Details'}
                                        </label>
                                        <div
                                            onClick={() => handleCopy(instructionText)}
                                            className="p-3 bg-[#00f2ff]/5 border border-[#00f2ff]/20 rounded-lg cursor-pointer hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 transition-all group relative"
                                        >
                                            <p className={`text-[10px] text-gray-300 leading-relaxed break-all font-mono ${isCrypto ? 'text-xs' : ''}`}>
                                                {instructionText}
                                            </p>

                                            {/* Copy Icon / Feedback */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00f2ff]">
                                                {copied ? <Check size={14} /> : <Copy size={14} className="opacity-50 group-hover:opacity-100" />}
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-gray-600 mt-1 text-center">
                                            {copied ? 'Copied to clipboard!' : 'Click box to copy details'}
                                        </p>
                                    </div>
                                )}

                                {/* --- GIFT CARD SECTION --- */}
                                {isGift && (
                                    <div className="mb-6 space-y-4">
                                        {/* Option 1: Input Code */}
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Option 1: Enter Card Code</label>
                                            <input
                                                type="text"
                                                value={giftCode}
                                                onChange={(e) => setGiftCode(e.target.value)}
                                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                                className="w-full bg-black border border-white/20 rounded-lg py-3 px-4 text-white text-sm focus:border-pink-500 outline-none transition-colors font-mono"
                                            />
                                        </div>

                                        <div className="text-center text-[10px] text-gray-500 font-mono">- OR -</div>

                                        {/* Option 2: Upload */}
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Option 2: Upload Card Image</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`bg-white/5 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${file ? 'border-pink-500/50 bg-pink-500/5' : 'border-white/20 group-hover:border-pink-500/50'}`}>
                                                    <Upload size={18} className="text-gray-500 mb-2" />
                                                    <span className="text-[10px] text-gray-400">
                                                        {file ? file.name : "Snap photo or Upload card"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- CRYPTO UPLOAD (MANDATORY) --- */}
                                {isCrypto && (
                                    <div className="mb-6">
                                        <label className="block text-[9px] uppercase tracking-widest text-red-400 mb-2 font-mono flex items-center gap-2">
                                            <AlertTriangle size={10} /> Proof of Payment (Required)
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`bg-white/5 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${file ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-red-500/30 group-hover:border-[#00f2ff]'}`}>
                                                <Upload size={18} className={file ? 'text-[#00f2ff]' : 'text-gray-500'} />
                                                <span className="text-[10px] text-gray-400 mt-2">
                                                    {file ? file.name : "Upload Payment Screenshot"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- STANDARD UPLOAD (WIRE, ACH, ETC) --- */}
                                {!isGift && !isCrypto && (
                                    <div className="mb-6">
                                        <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Proof of Payment</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center group-hover:border-[#00f2ff]/50 transition-colors">
                                                <Upload size={18} className="text-gray-500 mb-2" />
                                                <span className="text-[10px] text-gray-400">
                                                    {file ? file.name : "Click to upload receipt"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    disabled={uploading || success}
                                    className={`mt-auto w-full py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${success ? 'bg-green-500 text-black' : 'bg-[#00f2ff] text-black hover:bg-white'}`}
                                >
                                    {uploading ? 'Processing...' : success ? 'Request Sent' : 'Submit Deposit'}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* --- INELIGIBLE MODAL (FOR CHECKS) --- */}
                    {ineligibleModal && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIneligibleModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#111] border border-white/10 p-6 rounded-xl max-w-sm w-full relative z-[80] shadow-2xl"
                            >
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
                                    <Lock size={24} className="text-red-500" />
                                </div>
                                <h3 className="text-white font-bold text-center text-lg mb-2">Service Unavailable</h3>
                                <p className="text-gray-400 text-xs text-center leading-relaxed mb-6">
                                    Your account is currently not eligible for Mobile Check Deposit. Please build your account history with Wire or Crypto deposits to unlock this feature.
                                </p>
                                <button
                                    onClick={() => setIneligibleModal(false)}
                                    className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-gray-200 transition-colors"
                                >
                                    Acknowledge
                                </button>
                            </motion.div>
                        </div>
                    )}

                </>
            )}
        </AnimatePresence>
    );
}