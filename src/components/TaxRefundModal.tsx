'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, FileText, CheckCircle, ShieldCheck,
    ChevronRight, ChevronLeft, Landmark, DollarSign, Loader2
} from 'lucide-react';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TaxRefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function TaxRefundModal({ isOpen, onClose, userId }: TaxRefundModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        ssn: '',
        routing: '',
        account: '',
        agi: ''
    });

    // Files State
    const [incomeFiles, setIncomeFiles] = useState<File[]>([]);
    const [deductionFiles, setDeductionFiles] = useState<File[]>([]);

    // Refs for file inputs
    const incomeInputRef = useRef<HTMLInputElement>(null);
    const deductionInputRef = useRef<HTMLInputElement>(null);

    // --- HANDLERS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'INCOME' | 'DEDUCTION') => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            if (type === 'INCOME') setIncomeFiles([...incomeFiles, ...newFiles]);
            else setDeductionFiles([...deductionFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number, type: 'INCOME' | 'DEDUCTION') => {
        if (type === 'INCOME') {
            setIncomeFiles(incomeFiles.filter((_, i) => i !== index));
        } else {
            setDeductionFiles(deductionFiles.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        // 1. Upload Files
        const allFiles = [...incomeFiles, ...deductionFiles];
        const fileUrls: string[] = [];

        for (const file of allFiles) {
            const fileName = `${userId}/${Date.now()}_${file.name}`;
            const { error } = await supabase.storage.from('tax-documents').upload(fileName, file);
            if (!error) fileUrls.push(fileName);
        }

        // 2. Save Data
        const { error: dbError } = await supabase.from('tax_refunds').insert([{
            user_id: userId,
            ssn_tin: formData.ssn,
            routing_number: formData.routing,
            account_number: formData.account,
            prior_year_agi: parseFloat(formData.agi || '0'),
            status: 'PENDING_REVIEW'
        }]);

        setLoading(false);

        if (dbError) {
            alert('Submission failed. Please try again.');
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
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                        <div>
                            <h2 className="text-xl font-bold text-[#0B1C33] flex items-center gap-2">
                                <FileText className="text-[#1170FF]" size={24} />
                                Tax Refund Filing
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Securely submit your documents for processing.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Body Content */}
                    <div className="flex-1 overflow-y-auto p-8">

                        {success ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                                    <CheckCircle size={48} className="text-[#12B76A]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0B1C33] mb-2">Filing Submitted!</h3>
                                <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
                                    Your tax refund request has been securely transmitted. Our tax specialists will review your documents (W-2s, 1099s) and update your status shortly.
                                </p>
                                <button onClick={onClose} className="px-8 py-3 bg-[#0B1C33] text-white font-bold rounded-xl hover:bg-black transition-all">
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Progress Steps */}
                                <div className="flex items-center justify-center mb-8">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#1170FF] text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                                    <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#1170FF]' : 'bg-slate-100'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#1170FF] text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                                    <div className={`w-16 h-1 ${step >= 3 ? 'bg-[#1170FF]' : 'bg-slate-100'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#1170FF] text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
                                </div>

                                {/* STEP 1: IDENTITY & BANKING */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <ShieldCheck className="text-[#1170FF] mt-0.5" size={20} />
                                            <div>
                                                <h4 className="text-sm font-bold text-[#0B1C33]">Identity Verification</h4>
                                                <p className="text-xs text-slate-600 mt-1">Please provide your TIN, SSN, or ITIN for you and any dependents.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Taxpayer ID (SSN / TIN / ITIN)</label>
                                            <input
                                                type="text"
                                                placeholder="XXX-XX-XXXX"
                                                value={formData.ssn}
                                                onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Bank Routing Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="9 Digits"
                                                    value={formData.routing}
                                                    onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Bank Account Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="Account #"
                                                    value={formData.account}
                                                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: PROOF OF INCOME */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-bold text-[#0B1C33] mb-2">Proof of Income Documents</h4>
                                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                                Upload <strong>W-2 Forms</strong> (Wages), <strong>1099 Forms</strong> (Freelance, Interest, Dividends), or <strong>Bank Statements</strong> showing business income.
                                            </p>

                                            {/* Upload Area */}
                                            <div
                                                onClick={() => incomeInputRef.current?.click()}
                                                className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#1170FF] hover:bg-blue-50 transition-all group"
                                            >
                                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Upload size={20} className="text-[#1170FF]" />
                                                </div>
                                                <span className="text-xs font-bold text-[#0B1C33]">Click to Upload Documents</span>
                                                <span className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG allowed</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    ref={incomeInputRef}
                                                    onChange={(e) => handleFileChange(e, 'INCOME')}
                                                    accept=".pdf,image/*"
                                                />
                                            </div>

                                            {/* File List */}
                                            {incomeFiles.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {incomeFiles.map((file, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-3 border border-slate-100 rounded-lg shadow-sm">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FileText size={16} className="text-slate-400 flex-shrink-0" />
                                                                <span className="text-xs text-[#0B1C33] truncate">{file.name}</span>
                                                            </div>
                                                            <button onClick={() => removeFile(idx, 'INCOME')} className="text-red-400 hover:text-red-600">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: DEDUCTIONS & HISTORY */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        {/* Prior Year AGI */}
                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2 flex items-center gap-2">
                                                <Landmark size={14} /> Prior Year Records
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="Last Year's AGI (Adjusted Gross Income)"
                                                    value={formData.agi}
                                                    onChange={(e) => setFormData({ ...formData, agi: e.target.value })}
                                                    className="w-full pl-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2">Required for electronic filing verification.</p>
                                        </div>

                                        <hr className="border-slate-100" />

                                        {/* Deductions Upload */}
                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2 flex items-center gap-2">
                                                <DollarSign size={14} /> Deductions & Credits
                                            </label>
                                            <p className="text-xs text-slate-500 mb-3">Upload receipts for mortgage interest, childcare, or education expenses.</p>

                                            <div
                                                onClick={() => deductionInputRef.current?.click()}
                                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-[#1170FF] transition-all"
                                            >
                                                <span className="text-xs text-slate-600">
                                                    {deductionFiles.length > 0 ? `${deductionFiles.length} files selected` : "Select Receipts..."}
                                                </span>
                                                <Upload size={16} className="text-slate-400" />
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    ref={deductionInputRef}
                                                    onChange={(e) => handleFileChange(e, 'DEDUCTION')}
                                                    accept=".pdf,image/*"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    {!success && (
                        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-2 text-slate-500 hover:text-[#0B1C33] text-sm font-bold transition-colors"
                                >
                                    <ChevronLeft size={16} /> Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="flex items-center gap-2 bg-[#1170FF] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                                >
                                    Next Step <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[#0B1C33] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Filing'}
                                </button>
                            )}
                        </div>
                    )}

                </motion.div>
            </div>
        </AnimatePresence>
    );
}