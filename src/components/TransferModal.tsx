'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, Globe, Users, Building2,
    Bitcoin, Smartphone, DollarSign, CreditCard,
    CheckCircle, Loader2, ShieldCheck
} from 'lucide-react';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- CONFIGURATION ---
const TRANSFER_TYPES = [
    { id: 'LOCAL', title: 'Local Transfer', desc: 'Send to local banks instantly', icon: Users, color: 'bg-blue-100 text-blue-600', badge: '⚡ Instant' },
    { id: 'INTL', title: 'International Wire', desc: 'Global transfers (SWIFT/SEPA)', icon: Globe, color: 'bg-indigo-100 text-indigo-600', badge: '🕒 1-3 Days' }
];

const METHODS = [
    { id: 'WIRE', title: 'Wire Transfer', icon: Building2 },
    { id: 'CRYPTO', title: 'Cryptocurrency', icon: Bitcoin },
    { id: 'PAYPAL', title: 'PayPal', icon: CreditCard }, // Using CreditCard icon as proxy for PayPal logo
    { id: 'WISE', title: 'Wise Transfer', icon: Globe },
    { id: 'CASHAPP', title: 'Cash App', icon: Smartphone },
];

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
    const [step, setStep] = useState(1); // 1: Type, 2: Method, 3: Form, 4: Success
    const [transferType, setTransferType] = useState('');
    const [method, setMethod] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        name: '',
        bank: '',
        accountNumber: '',
        routing: ''
    });

    // --- HANDLERS ---
    const handleTypeSelect = (id: string) => {
        setTransferType(id);
        if (id === 'LOCAL') setStep(3); // Skip method selection for local
        else setStep(2);
    };

    const handleMethodSelect = (id: string) => {
        setMethod(id);
        setStep(3);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep(4);
        }, 2000);
    };

    const reset = () => {
        setStep(1);
        setTransferType('');
        setMethod('');
        setFormData({ amount: '', name: '', bank: '', accountNumber: '', routing: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden h-[85vh] md:h-auto flex flex-col"
                >

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Send Money</h2>
                            <p className="text-xs text-gray-500">
                                {step === 1 ? 'Select Transfer Type' :
                                    step === 2 ? 'Select Method' :
                                        step === 3 ? 'Beneficiary Details' : 'Transaction Status'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1">

                        {/* STEP 1: TRANSFER TYPE */}
                        {step === 1 && (
                            <div className="space-y-4">
                                {TRANSFER_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleTypeSelect(type.id)}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-500 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${type.color}`}>
                                                <type.icon size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-900 text-sm">{type.title}</h3>
                                                <p className="text-xs text-gray-500">{type.desc}</p>
                                                <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                                                    {type.badge}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500" />
                                    </button>
                                ))}

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-6">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck size={20} className="text-blue-600 mt-0.5" />
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            <strong>Secure Transaction:</strong> All transfers are encrypted and processed securely. Never share your PIN with anyone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: METHOD (International Only) */}
                        {step === 2 && (
                            <div className="space-y-3">
                                {METHODS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => handleMethodSelect(m.id)}
                                        className="w-full bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600 group-hover:text-indigo-600 group-hover:bg-indigo-50">
                                                <m.icon size={20} />
                                            </div>
                                            <span className="font-bold text-sm text-gray-900">{m.title}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500" />
                                    </button>
                                ))}
                                <button onClick={() => setStep(1)} className="text-xs text-gray-500 mt-4 underline">Back to Type</button>
                            </div>
                        )}

                        {/* STEP 3: DETAILS FORM */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Amount Input */}
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Amount to Send</label>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={24} className="text-gray-900" />
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="bg-transparent text-3xl font-bold text-gray-900 placeholder-gray-300 w-full focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Beneficiary Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Account Holder Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Bank Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Chase Bank"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Account Number / IBAN</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    {transferType === 'INTL' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 block mb-1.5">SWIFT / BIC Code</label>
                                            <input
                                                type="text"
                                                placeholder="CHASUS33"
                                                className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                {isLoading ? (
                                    <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                        <Loader2 size={18} className="animate-spin" /> Processing...
                                    </button>
                                ) : (
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            className="px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200"
                                        >
                                            Confirm Transfer
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {step === 4 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={40} className="text-green-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Transfer Initiated</h3>
                                <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-[80%]">
                                    Your transfer of <span className="text-gray-900 font-bold">${formData.amount}</span> has been submitted for manual verification.
                                </p>
                                <button
                                    onClick={reset}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black"
                                >
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