'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ChevronRight, DollarSign, Building2, Smartphone, FileCheck } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Client Side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string; // Needed to link deposit to user
}

const BANK_OPTIONS = [
    { id: 'WIRE', label: 'Wire Transfer', icon: Building2, desc: 'Domestic & International' },
    { id: 'ZELLE', label: 'Zelle / QuickPay', icon: Smartphone, desc: 'Instant P2P Transfer' },
    { id: 'ACH', label: 'ACH Direct Debit', icon: DollarSign, desc: '3-5 Business Days' },
    { id: 'CHECK', label: 'Mobile Check Deposit', icon: FileCheck, desc: 'Photo Capture' },
];

export default function BankingSidebar({ isOpen, onClose, userId }: SidebarProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    // --- HANDLE DEPOSIT SUBMISSION ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !selectedOption) return;
        setUploading(true);

        let proofUrl = null;

        // 1. Upload Evidence (if file exists)
        if (file) {
            const fileName = `${userId}/${Date.now()}_${file.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);

            if (uploadError) {
                alert('Upload failed: ' + uploadError.message);
                setUploading(false);
                return;
            }
            // Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
            proofUrl = publicUrl;
        }

        // 2. Insert Transaction Record
        const { error: dbError } = await supabase
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    type: selectedOption,
                    amount: parseFloat(amount),
                    status: 'PENDING', // Key requirement: Starts as Pending
                    proof_url: proofUrl
                }
            ]);

        if (dbError) {
            alert('Transaction failed: ' + dbError.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onClose(); // Close sidebar after success
                setSuccess(false);
                setSelectedOption(null);
                setAmount('');
                setFile(null);
            }, 2000);
        }
        setUploading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-[#0a0c10] border-l border-white/10 z-[60] p-8 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                            <h2 className="text-xl font-bold font-sans tracking-tight">Move Money</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Content Switcher */}
                        {!selectedOption ? (
                            // 1. MENU LIST
                            <div className="flex-col gap-4 flex">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">Select Method</p>
                                {BANK_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedOption(opt.id)}
                                        className="flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-[#00f2ff]/50 hover:bg-[#00f2ff]/5 rounded-lg group transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-black rounded-lg text-[#00f2ff] group-hover:text-white transition-colors">
                                                <opt.icon size={20} />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-white">{opt.label}</span>
                                                <span className="block text-xs text-gray-500 font-mono mt-1">{opt.desc}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-[#00f2ff]" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // 2. DEPOSIT FORM
                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOption(null)}
                                    className="text-xs text-gray-500 hover:text-white mb-6 flex items-center gap-2 font-mono"
                                >
                                    ← BACK TO OPTIONS
                                </button>

                                <h3 className="text-2xl font-bold text-white mb-1">{BANK_OPTIONS.find(o => o.id === selectedOption)?.label}</h3>
                                <p className="text-sm text-gray-400 mb-8">Initiate your deposit request below.</p>

                                {/* Amount Input */}
                                <div className="mb-6">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black border border-white/20 rounded-lg py-4 pl-8 pr-4 text-white text-lg focus:border-[#00f2ff] outline-none transition-colors font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Payment Instructions (Dynamic based on type) */}
                                <div className="mb-8 p-4 bg-[#00f2ff]/5 border border-[#00f2ff]/20 rounded-lg">
                                    <h4 className="text-[#00f2ff] text-xs font-bold uppercase mb-2 font-mono">Transfer Instructions</h4>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        Please send the exact amount to:<br />
                                        <span className="text-white font-mono select-all">
                                            {selectedOption === 'WIRE' && 'Routing: 021000021 // Acct: 987654321'}
                                            {selectedOption === 'ZELLE' && 'pay@Titan-core.bank'}
                                            {selectedOption === 'ACH' && 'Titan Core LLC // Corp ID: 99-10293'}
                                            {selectedOption === 'CHECK' && 'Capture front and back of check.'}
                                        </span>
                                    </p>
                                </div>

                                {/* Evidence Upload */}
                                <div className="mb-8">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Proof of Payment</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center group-hover:border-[#00f2ff]/50 transition-colors">
                                            <Upload size={24} className="text-gray-500 mb-2" />
                                            <span className="text-xs text-gray-400">
                                                {file ? file.name : "Click to upload receipt / screenshot"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    disabled={uploading || success}
                                    className={`mt-auto w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${success ? 'bg-green-500 text-black' : 'bg-[#00f2ff] text-black hover:bg-white'}`}
                                >
                                    {uploading ? 'Processing...' : success ? 'Request Sent' : 'Submit Deposit'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}