'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CheckCircle, ChevronRight, ChevronLeft,
    Receipt, User, Banknote, Calculator, Loader2, Check, FileText
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
    purple: '#7F56D9',
};

interface TaxRefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-bold block mb-1.5" style={{ color: WF.black }}>
            {children}{required && <span className="ml-0.5" style={{ color: WF.red }}>*</span>}
        </label>
    );
}

function WFInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
        />
    );
}

function WFSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}>
            {children}
        </select>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] mt-1.5" style={{ color: WF.muted }}>{children}</p>;
}

function InfoBox({ icon: Icon, title, body, accent = WF.purple }: {
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

function StepBar({ total, current }: { total: number; current: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-7">
            {Array.from({ length: total }, (_, i) => i + 1).map(s => (
                <React.Fragment key={s}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                            background: current > s ? WF.red : current === s ? WF.red : WF.bg,
                            color: current >= s ? '#fff' : WF.muted,
                            border: current < s ? `1.5px solid ${WF.border}` : 'none',
                        }}>
                        {current > s ? <Check size={13} /> : s}
                    </div>
                    {s < total && (
                        <div className="w-10 h-0.5 rounded-full transition-all"
                            style={{ background: current > s ? WF.red : WF.border }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

function FileZone({ label, files, setFiles, accept }: {
    label: string; files: File[]; setFiles: (f: File[]) => void; accept: string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div>
            <Label required>{label}</Label>
            <div onClick={() => ref.current?.click()}
                className="rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={{
                    border: `2px dashed ${files.length ? WF.red : WF.border}`,
                    background: files.length ? 'rgba(215,30,40,0.04)' : WF.surface,
                }}>
                <FileText size={18} style={{ color: files.length ? WF.red : WF.muted }} />
                <span className="text-xs font-bold" style={{ color: WF.black }}>
                    {files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload'}
                </span>
                <span className="text-[10px]" style={{ color: WF.muted }}>PDF, JPG, PNG accepted</span>
                <input ref={ref} type="file" className="hidden" accept={accept} multiple
                    onChange={e => e.target.files && setFiles(Array.from(e.target.files))} />
            </div>
            {files.map((f, i) => (
                <div key={i} className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                    <Check size={11} style={{ color: '#16A34A' }} />
                    <span className="text-xs truncate" style={{ color: WF.black }}>{f.name}</span>
                    <button className="ml-auto text-xs" style={{ color: WF.muted }}
                        onClick={e => { e.stopPropagation(); setFiles(files.filter((_, j) => j !== i)); }}>✕</button>
                </div>
            ))}
        </div>
    );
}

export default function TaxRefundModal({ isOpen, onClose, userId }: TaxRefundModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '', ssn: '', filingStatus: '', routingNumber: '', accountNumber: '',
        taxYear: String(new Date().getFullYear() - 1),
        agi: '', federalWithheld: '', stateWithheld: '', deductions: '',
    });

    const [incomeFiles, setIncomeFiles] = useState<File[]>([]);

    const patch = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData(prev => ({ ...prev, [k]: e.target.value }));

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.fullName.length > 0 && formData.ssn.length >= 9 && formData.filingStatus.length > 0
                && formData.routingNumber.length === 9 && formData.accountNumber.length >= 6;
            case 2: return incomeFiles.length > 0;
            case 3: return formData.agi.length > 0 && formData.federalWithheld.length > 0;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;
        setLoading(true);

        const docUrls: string[] = [];
        for (const file of incomeFiles) {
            const name = `${userId}/tax_${Date.now()}_${file.name}`;
            await supabase.storage.from('tax-documents').upload(name, file);
            docUrls.push(supabase.storage.from('tax-documents').getPublicUrl(name).data.publicUrl);
        }

        const refundEstimate = (parseFloat(formData.federalWithheld || '0') + parseFloat(formData.stateWithheld || '0'))
            - parseFloat(formData.agi || '0') * 0.12;

        const { error } = await supabase.from('applications').insert([{
            user_id: userId, type: 'TAX_REFUND', status: 'PENDING',
            requested_amount: Math.max(0, refundEstimate),
            details: {
                fullName: formData.fullName,
                ssn: formData.ssn.replace(/\d(?=\d{4})/g, '*'),
                filingStatus: formData.filingStatus,
                taxYear: formData.taxYear,
                routingNumber: formData.routingNumber,
                accountNumber: formData.accountNumber.slice(-4).padStart(formData.accountNumber.length, '*'),
                agi: formData.agi,
                federalWithheld: formData.federalWithheld,
                stateWithheld: formData.stateWithheld,
                deductions: formData.deductions,
                incomeDocuments: docUrls,
            },
        }]);

        setLoading(false);
        if (error) alert('Submission failed. Please try again.');
        else setSuccess(true);
    };

    if (!isOpen) return null;

    const stepLabels = ['Identity & Banking', 'Proof of Income', 'AGI & Deductions'];
    const filingOptions = ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household', 'Qualifying Widow(er)'];

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
                                style={{ background: 'rgba(127,86,217,0.08)' }}>
                                <Receipt size={18} style={{ color: WF.purple }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: WF.muted }}>
                                    {stepLabels[step - 1]}
                                </p>
                                <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>
                                    Tax Refund Claim
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                            <X size={16} style={{ color: WF.muted }} />
                        </button>
                    </div>

                    <div className="h-0.5 w-full flex-shrink-0" style={{ background: WF.border }}>
                        <div className="h-full transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%`, background: WF.red }} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {success ? (
                            <div className="flex flex-col items-center text-center py-10 gap-4">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(127,86,217,0.1)' }}>
                                    <CheckCircle size={40} style={{ color: WF.purple }} />
                                </div>
                                <h3 className="font-display text-2xl font-bold" style={{ color: WF.black }}>Claim Submitted!</h3>
                                <p className="text-sm max-w-xs leading-relaxed" style={{ color: WF.muted }}>
                                    Your tax refund claim for <strong style={{ color: WF.black }}>FY {formData.taxYear}</strong> has been submitted.
                                    Refunds are typically processed within 5–10 business days.
                                </p>
                                <button onClick={onClose}
                                    className="mt-4 w-full max-w-xs py-4 rounded-2xl text-white font-bold transition-all hover:opacity-90"
                                    style={{ background: WF.black }}>
                                    Return to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <StepBar total={3} current={step} />

                                {/* Step 1 */}
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={User} title="Identity & Direct Deposit"
                                            body="Provide your legal name, SSN, and bank account for refund deposit." />
                                        <div>
                                            <Label required>Legal Full Name</Label>
                                            <WFInput type="text" placeholder="As shown on tax return" value={formData.fullName} onChange={patch('fullName')} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>Social Security Number</Label>
                                                <WFInput type="password" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={patch('ssn')} />
                                            </div>
                                            <div>
                                                <Label required>Tax Year</Label>
                                                <WFInput type="number" min="2000" max={new Date().getFullYear()} value={formData.taxYear} onChange={patch('taxYear')} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Filing Status</Label>
                                            <WFSelect value={formData.filingStatus} onChange={patch('filingStatus')}>
                                                <option value="">Select status…</option>
                                                {filingOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </WFSelect>
                                        </div>
                                        <div className="p-4 rounded-2xl space-y-4"
                                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                            <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: WF.black }}>
                                                <Banknote size={12} style={{ color: WF.purple }} />
                                                Direct Deposit Details
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label required>Routing Number</Label>
                                                    <WFInput type="text" placeholder="9 digits" maxLength={9} value={formData.routingNumber} onChange={patch('routingNumber')} />
                                                </div>
                                                <div>
                                                    <Label required>Account Number</Label>
                                                    <WFInput type="text" placeholder="Account number" value={formData.accountNumber} onChange={patch('accountNumber')} />
                                                </div>
                                            </div>
                                            <Hint>Refund will be deposited directly into this account.</Hint>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2 */}
                                {step === 2 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={FileText} title="Proof of Income"
                                            body="Upload your W-2, 1099, or other income documents for the selected tax year."
                                            accent="#0369A1" />
                                        <FileZone
                                            label="Income Documents (W-2 / 1099)"
                                            files={incomeFiles}
                                            setFiles={setIncomeFiles}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <div className="p-4 rounded-2xl text-xs leading-relaxed"
                                            style={{ background: 'rgba(215,30,40,0.04)', border: `1px solid rgba(215,30,40,0.1)`, color: '#991B1B' }}>
                                            <strong>Accepted:</strong> W-2, 1099-NEC, 1099-MISC, 1099-K, 1099-INT, SSA-1099.
                                            Documents must be for tax year <strong>{formData.taxYear}</strong>.
                                        </div>
                                    </div>
                                )}

                                {/* Step 3 */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={Calculator} title="AGI & Deductions"
                                            body="Enter your Adjusted Gross Income and total taxes withheld to calculate your refund estimate." />
                                        <div>
                                            <Label required>Adjusted Gross Income (AGI) ($)</Label>
                                            <WFInput type="number" placeholder="0.00" value={formData.agi} onChange={patch('agi')} />
                                            <Hint>From Line 11 of Form 1040.</Hint>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>Federal Tax Withheld ($)</Label>
                                                <WFInput type="number" placeholder="0.00" value={formData.federalWithheld} onChange={patch('federalWithheld')} />
                                            </div>
                                            <div>
                                                <Label>State Tax Withheld ($)</Label>
                                                <WFInput type="number" placeholder="0.00" value={formData.stateWithheld} onChange={patch('stateWithheld')} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Additional Deductions ($)</Label>
                                            <WFInput type="number" placeholder="0.00 (optional)" value={formData.deductions} onChange={patch('deductions')} />
                                            <Hint>Mortgage interest, student loan interest, charitable contributions, etc.</Hint>
                                        </div>

                                        {/* Estimate preview */}
                                        {formData.agi && formData.federalWithheld && (
                                            <div className="p-4 rounded-2xl"
                                                style={{ background: 'rgba(127,86,217,0.06)', border: `1px solid rgba(127,86,217,0.15)` }}>
                                                <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: WF.purple }}>Estimated Refund</p>
                                                <p className="font-display text-3xl font-bold" style={{ color: WF.black }}>
                                                    ${Math.max(0, (parseFloat(formData.federalWithheld) + parseFloat(formData.stateWithheld || '0')) - parseFloat(formData.agi) * 0.12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[10px] mt-1" style={{ color: WF.muted }}>Preliminary estimate only. Final amount determined by IRS processing.</p>
                                            </div>
                                        )}
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
                                    className="flex items-center gap-1.5 text-sm font-bold"
                                    style={{ color: WF.muted }}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button onClick={() => setStep(s => s + 1)} disabled={!isStepValid()}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: isStepValid() ? WF.red : WF.border, color: isStepValid() ? '#fff' : WF.muted }}>
                                    Next <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={!isStepValid() || loading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: WF.black, color: '#fff' }}>
                                    {loading && <Loader2 size={15} className="animate-spin" />}
                                    {loading ? 'Submitting…' : 'File Claim'}
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
