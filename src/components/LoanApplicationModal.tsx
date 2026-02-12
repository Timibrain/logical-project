'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, FileText, CheckCircle, ShieldCheck,
    ChevronRight, ChevronLeft, Landmark, DollarSign, Loader2,
    Briefcase, Home, CreditCard, AlertCircle
} from 'lucide-react';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LoanApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function LoanApplicationModal({ isOpen, onClose, userId }: LoanApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        purpose: '',
        ssn: '',
        employmentStatus: '',
        employer: '',
        income: '',
        address: '',
        city: '',
        zip: '',
        consent: false
    });

    // Files State
    const [idFiles, setIdFiles] = useState<File[]>([]);
    const [incomeFiles, setIncomeFiles] = useState<File[]>([]);
    const [residencyFiles, setResidencyFiles] = useState<File[]>([]);

    // File Inputs Refs
    const idInputRef = useRef<HTMLInputElement>(null);
    const incomeInputRef = useRef<HTMLInputElement>(null);
    const residencyInputRef = useRef<HTMLInputElement>(null);

    // --- VALIDATION (The Gatekeeper) ---
    const isStepValid = () => {
        switch (step) {
            case 1: // Identity
                return (
                    formData.amount.length > 0 &&
                    formData.purpose.length > 0 &&
                    formData.ssn.length >= 9 &&
                    idFiles.length > 0 // Must have ID
                );
            case 2: // Income
                return (
                    formData.employmentStatus.length > 0 &&
                    formData.income.length > 0 &&
                    incomeFiles.length > 0 // Must have Pay Stubs/W2
                );
            case 3: // Residency
                return (
                    formData.address.length > 0 &&
                    formData.city.length > 0 &&
                    formData.zip.length >= 5 &&
                    residencyFiles.length > 0 // Must have Utility Bill
                );
            case 4: // Final Review
                return formData.consent === true;
            default:
                return false;
        }
    };

    // --- HANDLERS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'ID' | 'INCOME' | 'RESIDENCY') => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            if (category === 'ID') setIdFiles([...idFiles, ...newFiles]);
            else if (category === 'INCOME') setIncomeFiles([...incomeFiles, ...newFiles]);
            else setResidencyFiles([...residencyFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number, category: 'ID' | 'INCOME' | 'RESIDENCY') => {
        if (category === 'ID') setIdFiles(idFiles.filter((_, i) => i !== index));
        else if (category === 'INCOME') setIncomeFiles(incomeFiles.filter((_, i) => i !== index));
        else setResidencyFiles(residencyFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;
        setLoading(true);

        // 1. Upload All Files
        const allFiles = [...idFiles, ...incomeFiles, ...residencyFiles];
        for (const file of allFiles) {
            const fileName = `${userId}/loan_${Date.now()}_${file.name}`;
            await supabase.storage.from('loan-documents').upload(fileName, file);
        }

        // 2. Save Data
        const { error } = await supabase.from('loans').insert([{
            user_id: userId,
            amount: parseFloat(formData.amount),
            purpose: formData.purpose,
            ssn: formData.ssn,
            employment_status: formData.employmentStatus,
            annual_income: parseFloat(formData.income),
            address: `${formData.address}, ${formData.city} ${formData.zip}`,
            status: 'UNDER_REVIEW'
        }]);

        setLoading(false);

        if (error) {
            alert('Application failed. Please try again.');
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
                                <Landmark className="text-[#1170FF]" size={24} />
                                Loan Application
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Personal & Business Loans up to $50,000</p>
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
                                <h3 className="text-2xl font-bold text-[#0B1C33] mb-2">Application Received</h3>
                                <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
                                    Your loan application is submitted successfully we will get back to you as soon as possible.
                                </p>
                                <button onClick={onClose} className="px-8 py-3 bg-[#0B1C33] text-white font-bold rounded-xl hover:bg-black transition-all">
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Progress Bar */}
                                <div className="flex items-center justify-center mb-8">
                                    {[1, 2, 3, 4].map((s) => (
                                        <React.Fragment key={s}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-[#1170FF] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {s}
                                            </div>
                                            {s < 4 && <div className={`w-12 h-1 transition-colors ${step > s ? 'bg-[#1170FF]' : 'bg-slate-100'}`}></div>}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* STEP 1: IDENTITY */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <ShieldCheck className="text-[#1170FF] mt-0.5" size={20} />
                                            <div>
                                                <h4 className="text-sm font-bold text-[#0B1C33]">Proof of Identity</h4>
                                                <p className="text-xs text-slate-600 mt-1">Lenders must verify you are 18 or older and a legal resident.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Loan Amount ($) <span className="text-red-500">*</span></label>
                                                <input type="number" placeholder="5000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Purpose <span className="text-red-500">*</span></label>
                                                <select value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50">
                                                    <option value="">Select Purpose</option>
                                                    <option value="DEBT">Debt Consolidation</option>
                                                    <option value="HOME">Home Improvement</option>
                                                    <option value="BUSINESS">Business Expansion</option>
                                                    <option value="PERSONAL">Personal Emergency</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">SSN / ITIN <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={e => setFormData({ ...formData, ssn: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Government Photo ID <span className="text-red-500">*</span></label>
                                            <div onClick={() => idInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#1170FF] hover:bg-blue-50 transition-all">
                                                <Upload size={20} className="text-[#1170FF] mb-2" />
                                                <span className="text-xs font-bold text-[#0B1C33]">Upload Driver’s License / Passport</span>
                                                <input type="file" ref={idInputRef} onChange={e => handleFileChange(e, 'ID')} className="hidden" accept="image/*,.pdf" />
                                            </div>
                                            {idFiles.length > 0 && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {idFiles[0].name}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: INCOME */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-bold text-[#0B1C33] mb-2">Proof of Income & Employment</h4>
                                            <p className="text-xs text-slate-500">Provide pay stubs (last 30 days) or Tax Returns (last 2 years).</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Employment Status <span className="text-red-500">*</span></label>
                                                <select value={formData.employmentStatus} onChange={e => setFormData({ ...formData, employmentStatus: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF]">
                                                    <option value="">Select Status</option>
                                                    <option value="EMPLOYED">Full-Time Employee</option>
                                                    <option value="SELF">Self-Employed</option>
                                                    <option value="RETIRED">Retired</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Annual Income ($) <span className="text-red-500">*</span></label>
                                                <input type="number" placeholder="0.00" value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF]" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Employer Name / Business Name</label>
                                            <input type="text" placeholder="Company LLC" value={formData.employer} onChange={e => setFormData({ ...formData, employer: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF]" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Upload Proof of Income <span className="text-red-500">*</span></label>
                                            <div onClick={() => incomeInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#1170FF] hover:bg-blue-50 transition-all">
                                                <Briefcase size={20} className="text-[#1170FF] mb-2" />
                                                <span className="text-xs font-bold text-[#0B1C33]">Upload Pay Stubs / W-2 / 1099</span>
                                                <input type="file" ref={incomeInputRef} onChange={e => handleFileChange(e, 'INCOME')} className="hidden" multiple accept="image/*,.pdf" />
                                            </div>
                                            {incomeFiles.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {incomeFiles.map((f, i) => (
                                                        <p key={i} className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> {f.name}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: RESIDENCY */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-bold text-[#0B1C33] mb-2">Proof of Residency</h4>
                                            <p className="text-xs text-slate-500">We need a Utility Bill, Lease Agreement, or Mortgage Statement.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Street Address <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="123 Main St" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF]" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">City <span className="text-red-500">*</span></label>
                                                <input type="text" placeholder="New York" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Zip Code <span className="text-red-500">*</span></label>
                                                <input type="text" placeholder="10001" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1170FF]" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Upload Utility Bill / Lease <span className="text-red-500">*</span></label>
                                            <div onClick={() => residencyInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#1170FF] hover:bg-blue-50 transition-all">
                                                <Home size={20} className="text-[#1170FF] mb-2" />
                                                <span className="text-xs font-bold text-[#0B1C33]">Upload Document</span>
                                                <input type="file" ref={residencyInputRef} onChange={e => handleFileChange(e, 'RESIDENCY')} className="hidden" accept="image/*,.pdf" />
                                            </div>
                                            {residencyFiles.length > 0 && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {residencyFiles[0].name}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: CONSENT */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CreditCard size={24} className="text-[#1170FF]" />
                                            </div>
                                            <h4 className="text-lg font-bold text-[#0B1C33] mb-2">Credit Check Authorization</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                                By submitting this application, you authorize our bank to obtain your credit report from credit reporting agencies. This inquiry may impact your credit score.
                                            </p>

                                            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-white transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.consent}
                                                    onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                                                    className="w-5 h-5 text-[#1170FF] rounded focus:ring-[#1170FF]"
                                                />
                                                <span className="text-xs font-bold text-[#0B1C33]">I Agree to the Credit Pull & Terms</span>
                                            </label>
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
                                <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1C33] text-sm font-bold transition-colors">
                                    <ChevronLeft size={16} /> Back
                                </button>
                            ) : <div></div>}

                            {step < 4 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!isStepValid()}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${isStepValid() ? 'bg-[#1170FF] text-white hover:bg-blue-600 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Next Step <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStepValid() || loading}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${isStepValid() && !loading ? 'bg-[#0B1C33] text-white hover:bg-black' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    )}

                </motion.div>
            </div>
        </AnimatePresence>
    );
}