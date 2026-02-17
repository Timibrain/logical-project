'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, HandCoins, CheckCircle, Building2,
    ChevronRight, ChevronLeft, User, FileText, Loader2, Globe
} from 'lucide-react';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GrantApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function GrantApplicationModal({ isOpen, onClose, userId }: GrantApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        loginGov: '',
        orgName: '',
        uei: '',
        tin: '',
        amount: '',
        purpose: ''
    });

    // Files State
    const [proposalFiles, setProposalFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- VALIDATION (The Gatekeeper) ---
    const isStepValid = () => {
        switch (step) {
            case 1: // Applicant Registration
                return (
                    formData.fullName.length > 0 &&
                    formData.email.includes('@') &&
                    formData.phone.length >= 10 &&
                    formData.loginGov.length > 0
                );
            case 2: // Organization Details (UEI / TIN)
                return (
                    formData.orgName.length > 0 &&
                    formData.uei.length >= 12 && // SAM.gov UEI is usually 12 chars
                    formData.tin.length >= 9
                );
            case 3: // Grant Proposal
                return (
                    formData.amount.length > 0 &&
                    formData.purpose.length > 0 &&
                    proposalFiles.length > 0 // Must have Proposal Doc
                );
            default:
                return false;
        }
    };

    // --- HANDLERS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProposalFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;
        setLoading(true);

        // 1. Upload Proposal
        for (const file of proposalFiles) {
            const fileName = `${userId}/grant_${Date.now()}_${file.name}`;
            await supabase.storage.from('grant-documents').upload(fileName, file);
        }

        // 2. Save Data
        const { error } = await supabase.from('grants').insert([{
            user_id: userId,
            applicant_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            login_gov_id: formData.loginGov,
            organization_name: formData.orgName,
            uei_number: formData.uei,
            tin_ein: formData.tin,
            grant_amount: parseFloat(formData.amount),
            purpose: formData.purpose,
            status: 'SUBMITTED'
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
                                <HandCoins className="text-[#12B76A]" size={24} />
                                Grant Application
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Federal & State Funding Portal</p>
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
                                <h3 className="text-2xl font-bold text-[#0B1C33] mb-2">Application Submitted!</h3>
                                <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
                                    Your grant application (UEI: {formData.uei}) has been received. You can track the status of your funding request in your dashboard.
                                </p>
                                <button onClick={onClose} className="px-8 py-3 bg-[#0B1C33] text-white font-bold rounded-xl hover:bg-black transition-all">
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Progress Steps */}
                                <div className="flex items-center justify-center mb-8">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-[#12B76A] text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                                    <div className={`w-16 h-1 transition-colors ${step >= 2 ? 'bg-[#12B76A]' : 'bg-slate-100'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-[#12B76A] text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                                    <div className={`w-16 h-1 transition-colors ${step >= 3 ? 'bg-[#12B76A]' : 'bg-slate-100'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 3 ? 'bg-[#12B76A] text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
                                </div>

                                {/* STEP 1: APPLICANT REGISTRATION */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                                            <User className="text-[#12B76A] mt-0.5" size={20} />
                                            <div>
                                                <h4 className="text-sm font-bold text-[#0B1C33]">Applicant Registration</h4>
                                                <p className="text-xs text-slate-600 mt-1">Verify your identity using your Grants.gov linked account.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Full Name <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Email Address <span className="text-red-500">*</span></label>
                                                <input type="email" placeholder="john@org.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#0B1C33] mb-2">Phone Number <span className="text-red-500">*</span></label>
                                                <input type="tel" placeholder="(555) 000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2 flex items-center gap-2">
                                                <Globe size={12} /> Login.gov Username <span className="text-red-500">*</span>
                                            </label>
                                            <input type="text" placeholder="Username linked to Grants.gov" value={formData.loginGov} onChange={e => setFormData({ ...formData, loginGov: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                            <p className="text-[10px] text-slate-400 mt-2">Required for federal grant eligibility check.</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: ORGANIZATION DETAILS */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-bold text-[#0B1C33] mb-2">Entity Verification</h4>
                                            <p className="text-xs text-slate-500">
                                                Provide your <strong>UEI (Unique Entity Identifier)</strong> from SAM.gov and your Tax ID.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Organization Name <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="Non-Profit / LLC Name" value={formData.orgName} onChange={e => setFormData({ ...formData, orgName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Unique Entity Identifier (UEI) <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="12-Character Alpha-Numeric ID" value={formData.uei} onChange={e => setFormData({ ...formData, uei: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                            <p className="text-[10px] text-slate-400 mt-2">Issued by SAM.gov (Replaces DUNS number).</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">TIN / EIN <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="XX-XXXXXXX" value={formData.tin} onChange={e => setFormData({ ...formData, tin: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                            <p className="text-[10px] text-slate-400 mt-2">Required to verify tax-exempt status.</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: PROPOSAL */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-bold text-[#0B1C33] mb-2">Grant Proposal</h4>
                                            <p className="text-xs text-slate-500">Outline your funding needs and upload your project proposal.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Grant Amount Requested ($) <span className="text-red-500">*</span></label>
                                            <input type="number" placeholder="10000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A]" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Project Purpose / Summary <span className="text-red-500">*</span></label>
                                            <textarea rows={3} placeholder="Briefly describe how funds will be used..." value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#12B76A] resize-none" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#0B1C33] mb-2">Upload Proposal Document <span className="text-red-500">*</span></label>
                                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#12B76A] hover:bg-green-50 transition-all">
                                                <Building2 size={20} className="text-[#12B76A] mb-2" />
                                                <span className="text-xs font-bold text-[#0B1C33]">Upload PDF / Word Doc</span>
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                                            </div>
                                            {proposalFiles.length > 0 && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {proposalFiles[0].name}</p>}
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

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!isStepValid()}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${isStepValid() ? 'bg-[#12B76A] text-white hover:bg-green-600 shadow-green-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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