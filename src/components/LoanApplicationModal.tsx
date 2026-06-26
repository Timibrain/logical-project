'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, FileText, CheckCircle, ShieldCheck,
    ChevronRight, ChevronLeft, Landmark, Loader2,
    Briefcase, Home, CreditCard, Check
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
};

interface LoanApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
            {children}{required && <span className="ml-0.5" style={{ color: WF.red }}>*</span>}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
        />
    );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: value ? WF.black : WF.muted }}>
            {children}
        </select>
    );
}

function InfoBox({ icon: Icon, title, body, accent = WF.red }: {
    icon: any; title: string; body: string; accent?: string;
}) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: `${accent}0D`, border: `1px solid ${accent}20` }}>
            <Icon size={16} style={{ color: accent, flexShrink: 0, marginTop: 1 }} />
            <div>
                <p className="text-xs font-bold" style={{ color: WF.black }}>{title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: WF.muted }}>{body}</p>
            </div>
        </div>
    );
}

function FileZone({ label, required, files, onFiles, onRemove, accept = 'image/*,.pdf', multiple = false, icon: Icon = Upload }: {
    label: string; required?: boolean; files: File[];
    onFiles: (f: File[]) => void; onRemove: (i: number) => void;
    accept?: string; multiple?: boolean; icon?: any;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div>
            <Label required={required}>{label}</Label>
            <div onClick={() => ref.current?.click()}
                className="rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={{
                    border: `2px dashed ${files.length ? WF.red : WF.border}`,
                    background: files.length ? 'rgba(215,30,40,0.04)' : WF.surface,
                }}>
                <Icon size={18} style={{ color: files.length ? WF.red : WF.muted }} />
                <span className="text-xs font-bold" style={{ color: WF.black }}>
                    {files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Click to upload'}
                </span>
                <span className="text-[10px]" style={{ color: WF.muted }}>PDF, JPG, PNG accepted</span>
                <input type="file" ref={ref} className="hidden" accept={accept} multiple={multiple}
                    onChange={e => e.target.files && onFiles(Array.from(e.target.files))} />
            </div>
            {files.length > 0 && (
                <div className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Check size={12} style={{ color: '#16A34A', flexShrink: 0 }} />
                                <span className="text-xs truncate" style={{ color: WF.black }}>{f.name}</span>
                            </div>
                            <button type="button" onClick={() => onRemove(i)}
                                className="ml-2 flex-shrink-0" style={{ color: WF.muted }}>
                                <X size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StepBar({ total, current, color = WF.red }: { total: number; current: number; color?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-7">
            {Array.from({ length: total }, (_, i) => i + 1).map(s => (
                <React.Fragment key={s}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                            background: current > s ? color : current === s ? color : WF.bg,
                            color: current >= s ? '#fff' : WF.muted,
                            border: current < s ? `1.5px solid ${WF.border}` : 'none',
                        }}>
                        {current > s ? <Check size={13} /> : s}
                    </div>
                    {s < total && (
                        <div className="w-10 h-0.5 rounded-full transition-all"
                            style={{ background: current > s ? color : WF.border }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoanApplicationModal({ isOpen, onClose, userId }: LoanApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        amount: '', purpose: '', ssn: '', employmentStatus: '',
        employer: '', income: '', address: '', city: '', zip: '', consent: false
    });

    const [idFiles, setIdFiles] = useState<File[]>([]);
    const [incomeFiles, setIncomeFiles] = useState<File[]>([]);
    const [residencyFiles, setResidencyFiles] = useState<File[]>([]);

    const patch = (k: keyof typeof formData) => (v: any) => setFormData(prev => ({ ...prev, [k]: v }));

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.amount.length > 0 && formData.purpose.length > 0 && formData.ssn.length >= 9 && idFiles.length > 0;
            case 2: return formData.employmentStatus.length > 0 && formData.income.length > 0 && incomeFiles.length > 0;
            case 3: return formData.address.length > 0 && formData.city.length > 0 && formData.zip.length >= 5 && residencyFiles.length > 0;
            case 4: return formData.consent === true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;
        setLoading(true);

        const uploadFile = async (file: File) => {
            const name = `${userId}/loan_${Date.now()}_${file.name}`;
            await supabase.storage.from('loan-documents').upload(name, file);
            return supabase.storage.from('loan-documents').getPublicUrl(name).data.publicUrl;
        };

        const idUrls = await Promise.all(idFiles.map(uploadFile));
        const incomeUrls = await Promise.all(incomeFiles.map(uploadFile));
        const residencyUrls = await Promise.all(residencyFiles.map(uploadFile));

        const { error } = await supabase.from('applications').insert([{
            user_id: userId, type: 'LOAN', status: 'PENDING',
            requested_amount: parseFloat(formData.amount),
            details: {
                purpose: formData.purpose, ssn: formData.ssn,
                employmentStatus: formData.employmentStatus, employer: formData.employer,
                annualIncome: formData.income,
                address: `${formData.address}, ${formData.city} ${formData.zip}`,
                idDocuments: idUrls, incomeDocuments: incomeUrls, residencyDocuments: residencyUrls,
            },
        }]);

        setLoading(false);
        if (error) alert('Application failed. Please try again.');
        else setSuccess(true);
    };

    if (!isOpen) return null;

    const stepLabels = ['Identity', 'Income', 'Residency', 'Review'];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 font-sans">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                <motion.div
                    initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="relative w-full max-w-2xl md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
                    style={{ background: WF.bg, maxHeight: '92dvh' }}>

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
                        style={{ background: WF.surface, borderBottom: `1px solid ${WF.border}` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                <Landmark size={18} style={{ color: WF.red }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: WF.muted }}>
                                    {stepLabels[step - 1]}
                                </p>
                                <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>
                                    Loan Application
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <X size={16} style={{ color: WF.muted }} />
                        </button>
                    </div>

                    {/* Red progress bar */}
                    <div className="h-0.5 w-full flex-shrink-0" style={{ background: WF.border }}>
                        <div className="h-full transition-all duration-500"
                            style={{ width: `${(step / 4) * 100}%`, background: WF.red }} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {success ? (
                            <div className="flex flex-col items-center text-center py-10 gap-4">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(22,163,74,0.1)' }}>
                                    <CheckCircle size={40} style={{ color: '#16A34A' }} />
                                </div>
                                <h3 className="font-display text-2xl font-bold" style={{ color: WF.black }}>Application Received</h3>
                                <p className="text-sm max-w-xs leading-relaxed" style={{ color: WF.muted }}>
                                    Your loan application has been submitted. Our team will review it and get back to you shortly.
                                </p>
                                <button onClick={onClose}
                                    className="mt-4 w-full max-w-xs py-4 rounded-2xl text-white font-bold transition-all hover:opacity-90"
                                    style={{ background: WF.black }}>
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <StepBar total={4} current={step} />

                                {/* Step 1 — Identity */}
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={ShieldCheck} title="Proof of Identity"
                                            body="Lenders must verify you are 18 or older and a legal resident. All data is encrypted." />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>Loan Amount ($)</Label>
                                                <Input type="number" placeholder="5,000" value={formData.amount}
                                                    onChange={e => patch('amount')(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label required>Purpose</Label>
                                                <Select value={formData.purpose} onChange={patch('purpose')}>
                                                    <option value="">Select purpose</option>
                                                    <option value="DEBT">Debt Consolidation</option>
                                                    <option value="HOME">Home Improvement</option>
                                                    <option value="BUSINESS">Business Expansion</option>
                                                    <option value="PERSONAL">Personal Emergency</option>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>SSN / ITIN</Label>
                                            <Input type="text" placeholder="XXX-XX-XXXX" value={formData.ssn}
                                                onChange={e => patch('ssn')(e.target.value)}
                                                style={{ fontFamily: 'monospace' } as any} />
                                        </div>
                                        <FileZone label="Government Photo ID" required
                                            files={idFiles}
                                            onFiles={f => setIdFiles(prev => [...prev, ...f])}
                                            onRemove={i => setIdFiles(prev => prev.filter((_, idx) => idx !== i))} />
                                    </div>
                                )}

                                {/* Step 2 — Income */}
                                {step === 2 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={Briefcase} title="Proof of Income & Employment"
                                            body="Provide pay stubs (last 30 days) or tax returns (last 2 years)."
                                            accent="#0369A1" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>Employment Status</Label>
                                                <Select value={formData.employmentStatus} onChange={patch('employmentStatus')}>
                                                    <option value="">Select status</option>
                                                    <option value="EMPLOYED">Full-Time Employee</option>
                                                    <option value="SELF">Self-Employed</option>
                                                    <option value="RETIRED">Retired</option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label required>Annual Income ($)</Label>
                                                <Input type="number" placeholder="0.00" value={formData.income}
                                                    onChange={e => patch('income')(e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Employer / Business Name</Label>
                                            <Input type="text" placeholder="Company LLC" value={formData.employer}
                                                onChange={e => patch('employer')(e.target.value)} />
                                        </div>
                                        <FileZone label="Upload Proof of Income" required icon={Briefcase} multiple
                                            files={incomeFiles}
                                            onFiles={f => setIncomeFiles(prev => [...prev, ...f])}
                                            onRemove={i => setIncomeFiles(prev => prev.filter((_, idx) => idx !== i))} />
                                    </div>
                                )}

                                {/* Step 3 — Residency */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={Home} title="Proof of Residency"
                                            body="We need a utility bill, lease agreement, or mortgage statement."
                                            accent="#7F56D9" />
                                        <div>
                                            <Label required>Street Address</Label>
                                            <Input type="text" placeholder="123 Main St" value={formData.address}
                                                onChange={e => patch('address')(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>City</Label>
                                                <Input type="text" placeholder="New York" value={formData.city}
                                                    onChange={e => patch('city')(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label required>Zip Code</Label>
                                                <Input type="text" placeholder="10001" value={formData.zip}
                                                    onChange={e => patch('zip')(e.target.value)} />
                                            </div>
                                        </div>
                                        <FileZone label="Upload Utility Bill / Lease" required icon={Home}
                                            files={residencyFiles}
                                            onFiles={f => setResidencyFiles(prev => [...prev, ...f])}
                                            onRemove={i => setResidencyFiles(prev => prev.filter((_, idx) => idx !== i))} />
                                    </div>
                                )}

                                {/* Step 4 — Consent */}
                                {step === 4 && (
                                    <div className="space-y-5">
                                        <div className="text-center p-6 rounded-2xl"
                                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                                <CreditCard size={24} style={{ color: WF.red }} />
                                            </div>
                                            <h4 className="font-display text-lg font-bold mb-2" style={{ color: WF.black }}>
                                                Credit Check Authorization
                                            </h4>
                                            <p className="text-xs leading-relaxed mb-6" style={{ color: WF.muted }}>
                                                By submitting this application, you authorize West Bank to obtain your credit report
                                                from credit reporting agencies. This inquiry may impact your credit score.
                                            </p>
                                            <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                                                style={{ border: `1.5px solid ${formData.consent ? WF.red : WF.border}`, background: formData.consent ? 'rgba(215,30,40,0.04)' : WF.bg }}>
                                                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                                                    style={{ background: formData.consent ? WF.red : WF.surface, border: `1.5px solid ${formData.consent ? WF.red : WF.border}` }}>
                                                    {formData.consent && <Check size={12} color="#fff" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={formData.consent}
                                                    onChange={e => patch('consent')(e.target.checked)} />
                                                <span className="text-xs font-bold text-left" style={{ color: WF.black }}>
                                                    I agree to the credit pull authorization and loan terms
                                                </span>
                                            </label>
                                        </div>

                                        {/* Application summary */}
                                        <div className="rounded-2xl p-5 space-y-3"
                                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                            <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: WF.muted }}>Summary</p>
                                            {[
                                                { label: 'Loan Amount', value: `$${parseFloat(formData.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                                                { label: 'Purpose', value: formData.purpose.replace(/_/g, ' ') },
                                                { label: 'Employment', value: formData.employmentStatus },
                                                { label: 'Annual Income', value: `$${parseFloat(formData.income || '0').toLocaleString()}` },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between text-xs">
                                                    <span style={{ color: WF.muted }}>{label}</span>
                                                    <span className="font-bold" style={{ color: WF.black }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!success && (
                        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0"
                            style={{ background: WF.surface, borderTop: `1px solid ${WF.border}` }}>
                            {step > 1 ? (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="flex items-center gap-1.5 text-sm font-bold transition-all"
                                    style={{ color: WF.muted }}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            ) : <div />}

                            {step < 4 ? (
                                <button onClick={() => setStep(s => s + 1)} disabled={!isStepValid()}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: isStepValid() ? WF.red : WF.border, color: isStepValid() ? '#fff' : WF.muted }}>
                                    Next <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={!isStepValid() || loading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: WF.black, color: '#fff' }}>
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                                    {loading ? 'Submitting…' : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
