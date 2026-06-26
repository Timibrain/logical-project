'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, TrendingUp, CheckCircle, AlertTriangle, AlertCircle,
    PieChart, DollarSign, ArrowRight, Wallet, Loader2
} from 'lucide-react';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestDeposit: () => void; // Callback to open Deposit Modal
    userId: string;
    currentBalance: number; // We need this to check funds
}

const PORTFOLIOS = [
    { id: 'CONSERVATIVE', name: 'Conservative', risk: 'Low', return: '4-6%', color: 'bg-blue-600' },
    { id: 'BALANCED', name: 'Balanced', risk: 'Medium', return: '7-9%', color: 'bg-indigo-600' },
    { id: 'AGGRESSIVE', name: 'Aggressive', risk: 'High', return: '10-12%', color: 'bg-purple-600' }
];

export default function InvestmentModal({ isOpen, onClose, onRequestDeposit, userId, currentBalance }: InvestmentModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [selectedPortfolio, setSelectedPortfolio] = useState(PORTFOLIOS[1]);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // --- VALIDATION LOGIC ---
    const handleNext = () => {
        setError('');
        const investAmount = parseFloat(amount);

        // 1. Minimum Amount Check
        if (isNaN(investAmount) || investAmount < 500) {
            setError('Minimum investment required is $500.00');
            return;
        }

        // 2. Insufficient Funds Check
        if (investAmount > currentBalance) {
            setError('INSUFFICIENT_FUNDS'); // Trigger specific UI state
            return;
        }

        setStep(2); // Proceed to confirmation
    };

    const handleInvest = async () => {
        setLoading(true);

        // Insert into Supabase
        const { error } = await supabase.from('investments').insert([{
            user_id: userId,
            portfolio_type: selectedPortfolio.id,
            amount: parseFloat(amount),
            current_value: parseFloat(amount), // Starts at same value
            status: 'ACTIVE'
        }]);

        // NOTE: In a real app, you would also DECREMENT the user's fiat balance here via a Postgres Function (RPC).

        setLoading(false);
        if (error) {
            alert('Investment failed. Please try again.');
        } else {
            setSuccess(true);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${manrope.className}`}>

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0B1C33]/60 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                        <div>
                            <h2 className="text-lg font-bold text-[#0B1C33] flex items-center gap-2">
                                <TrendingUp className="text-[#1170FF]" size={20} />
                                New Investment
                            </h2>
                            <p className="text-xs text-slate-500">Grow your wealth with expert portfolios.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6">
                        {success ? (
                            /* SUCCESS STATE */
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                                    <CheckCircle size={40} className="text-[#12B76A]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0B1C33] mb-1">Portfolio Created!</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    You have successfully invested <strong>${parseFloat(amount).toLocaleString()}</strong> into the {selectedPortfolio.name} strategy.
                                </p>
                                <button onClick={onClose} className="w-full py-3 bg-[#0B1C33] text-white font-bold rounded-xl hover:bg-black transition-all">
                                    Done
                                </button>
                            </div>
                        ) : step === 1 ? (
                            /* STEP 1: CONFIGURATION */
                            <div className="space-y-6">

                                {/* Portfolio Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-[#0B1C33] mb-2">Select Strategy</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PORTFOLIOS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedPortfolio(p)}
                                                className={`p-3 rounded-xl border text-left transition-all ${selectedPortfolio.id === p.id
                                                    ? 'border-[#1170FF] bg-blue-50 ring-1 ring-[#1170FF]'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full mb-2 ${p.color}`}></div>
                                                <p className="text-[10px] font-bold text-[#0B1C33]">{p.name}</p>
                                                <p className="text-[9px] text-slate-500">{p.return} ROI</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-[#0B1C33]">Investment Amount</label>
                                        <span className="text-[10px] text-slate-500">Available: ${currentBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number"
                                            placeholder="Min. 500.00"
                                            value={amount}
                                            onChange={(e) => {
                                                setAmount(e.target.value);
                                                setError(''); // Clear error on typing
                                            }}
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-bold text-[#0B1C33] focus:ring-4 outline-none transition-all ${error
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-50'
                                                : 'border-slate-200 focus:border-[#1170FF] focus:ring-blue-50'
                                                }`}
                                        />
                                    </div>

                                    {/* ERROR HANDLING UI */}
                                    {error === 'INSUFFICIENT_FUNDS' ? (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-red-700">Insufficient Funds</p>
                                                <p className="text-[10px] text-red-600 leading-relaxed">
                                                    You need ${parseFloat(amount).toLocaleString()} but only have ${currentBalance.toLocaleString()}.
                                                </p>
                                                <button
                                                    onClick={() => { onClose(); onRequestDeposit(); }}
                                                    className="mt-2 text-[10px] font-bold bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                                >
                                                    Deposit Money <ArrowRight size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : error && (
                                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                            <AlertCircle size={12} /> {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full py-3 bg-[#1170FF] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                                >
                                    Review Investment
                                </button>
                            </div>
                        ) : (
                            /* STEP 2: REVIEW */
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">Strategy</span>
                                        <span className="text-xs font-bold text-[#0B1C33] flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${selectedPortfolio.color}`}></div>
                                            {selectedPortfolio.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">Target ROI</span>
                                        <span className="text-xs font-bold text-[#12B76A]">{selectedPortfolio.return}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                                        <span className="text-xs text-slate-500">Total Investment</span>
                                        <span className="text-lg font-bold text-[#0B1C33]">${parseFloat(amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleInvest}
                                        disabled={loading}
                                        className="flex-[2] py-3 bg-[#0B1C33] text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Investment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}