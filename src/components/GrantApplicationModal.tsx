'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, HandCoins, CheckCircle, Building2,
    ChevronRight, ChevronLeft, User, FileText, Loader2, Globe, Check
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', black: '#1A1A1A', gold: '#FFCD41',
    green: '#12B76A',
};

interface GrantApplicationModalProps {
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
        />
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] mt-1.5" style={{ color: WF.muted }}>{children}</p>;
}

function InfoBox({ icon: Icon, title, body, accent = WF.green }: {
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

export default function GrantApplicationModal({ isOpen, onClose, userId }: GrantApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', loginGov: '',
        orgName: '', uei: '', tin: '', amount: '', purpose: ''
    });

    const [proposalFiles, setProposalFiles] = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const patch = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFormData(prev => ({ ...prev, [k]: e.target.value }));

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.fullName.length > 0 && formData.email.includes('@') && formData.phone.length >= 10 && formData.loginGov.length > 0;
            case 2: return formData.orgName.length > 0 && formData.uei.length >= 12 && formData.tin.length >= 9;
            case 3: return formData.amount.length > 0 && formData.purpose.length > 0 && proposalFiles.length > 0;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;
        setLoading(true);

        const proposalUrls: string[] = [];
        for (const file of proposalFiles) {
            const name = `${userId}/grant_${Date.now()}_${file.name}`;
            await supabase.storage.from('grant-documents').upload(name, file);
            proposalUrls.push(supabase.storage.from('grant-documents').getPublicUrl(name).data.publicUrl);
        }

        const { error } = await supabase.from('applications').insert([{
            user_id: userId, type: 'GRANT', status: 'PENDING',
            requested_amount: parseFloat(formData.amount),
            details: {
                fullName: formData.fullName, email: formData.email, phone: formData.phone,
                loginGov: formData.loginGov, orgName: formData.orgName, uei: formData.uei,
                tin: formData.tin, purpose: formData.purpose, proposalDocuments: proposalUrls,
            },
        }]);

        setLoading(false);
        if (error) alert('Application failed. Please try again.');
        else setSuccess(true);
    };

    if (!isOpen) return null;

    const stepLabels = ['Registration', 'Organization', 'Proposal'];

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
                                style={{ background: 'rgba(18,183,106,0.08)' }}>
                                <HandCoins size={18} style={{ color: WF.green }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: WF.muted }}>
                                    {stepLabels[step - 1]}
                                </p>
                                <h2 className="font-display text-xl font-bold" style={{ color: WF.black }}>
                                    Grant Application
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
                                    style={{ background: 'rgba(18,183,106,0.1)' }}>
                                    <CheckCircle size={40} style={{ color: WF.green }} />
                                </div>
                                <h3 className="font-display text-2xl font-bold" style={{ color: WF.black }}>Application Submitted!</h3>
                                <p className="text-sm max-w-xs leading-relaxed" style={{ color: WF.muted }}>
                                    Your grant application (UEI: <span className="font-bold" style={{ color: WF.black }}>{formData.uei}</span>) has been received.
                                    Track your status in the dashboard.
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
                                        <InfoBox icon={User} title="Applicant Registration"
                                            body="Verify your identity using your Grants.gov linked account." />
                                        <div>
                                            <Label required>Full Name</Label>
                                            <Input type="text" placeholder="Jane Doe" value={formData.fullName} onChange={patch('fullName')} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>Email Address</Label>
                                                <Input type="email" placeholder="jane@org.com" value={formData.email} onChange={patch('email')} />
                                            </div>
                                            <div>
                                                <Label required>Phone Number</Label>
                                                <Input type="tel" placeholder="(555) 000-0000" value={formData.phone} onChange={patch('phone')} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Login.gov Username</Label>
                                            <Input type="text" placeholder="Username linked to Grants.gov" value={formData.loginGov} onChange={patch('loginGov')} />
                                            <Hint>Required for federal grant eligibility verification.</Hint>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2 */}
                                {step === 2 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={Building2} title="Entity Verification"
                                            body="Provide your UEI from SAM.gov and your Tax ID to verify entity status."
                                            accent="#0369A1" />
                                        <div>
                                            <Label required>Organization Name</Label>
                                            <Input type="text" placeholder="Non-Profit / LLC Name" value={formData.orgName} onChange={patch('orgName')} />
                                        </div>
                                        <div>
                                            <Label required>Unique Entity Identifier (UEI)</Label>
                                            <Input type="text" placeholder="12-Character Alpha-Numeric ID" value={formData.uei} onChange={patch('uei')}
                                                style={{ fontFamily: 'monospace' } as any} />
                                            <Hint>Issued by SAM.gov — replaces the legacy DUNS number.</Hint>
                                        </div>
                                        <div>
                                            <Label required>TIN / EIN</Label>
                                            <Input type="text" placeholder="XX-XXXXXXX" value={formData.tin} onChange={patch('tin')}
                                                style={{ fontFamily: 'monospace' } as any} />
                                            <Hint>Required to verify tax-exempt status.</Hint>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3 */}
                                {step === 3 && (
                                    <div className="space-y-5">
                                        <InfoBox icon={FileText} title="Grant Proposal"
                                            body="Outline your funding needs and upload your project proposal document."
                                            accent="#7F56D9" />
                                        <div>
                                            <Label required>Grant Amount Requested ($)</Label>
                                            <Input type="number" placeholder="10,000" value={formData.amount} onChange={patch('amount')} />
                                        </div>
                                        <div>
                                            <Label required>Project Purpose / Summary</Label>
                                            <textarea rows={4} placeholder="Briefly describe how funds will be used…"
                                                value={formData.purpose}
                                                onChange={patch('purpose')}
                                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                                                style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                                        </div>
                                        {/* File upload */}
                                        <div>
                                            <Label required>Upload Proposal Document</Label>
                                            <div onClick={() => fileRef.current?.click()}
                                                className="rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all"
                                                style={{
                                                    border: `2px dashed ${proposalFiles.length ? WF.red : WF.border}`,
                                                    background: proposalFiles.length ? 'rgba(215,30,40,0.04)' : WF.surface,
                                                }}>
                                                <Building2 size={18} style={{ color: proposalFiles.length ? WF.red : WF.muted }} />
                                                <span className="text-xs font-bold" style={{ color: WF.black }}>
                                                    {proposalFiles.length ? proposalFiles[0].name : 'Upload PDF or Word Document'}
                                                </span>
                                                <span className="text-[10px]" style={{ color: WF.muted }}>PDF, DOC, DOCX accepted</span>
                                                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
                                                    onChange={e => e.target.files && setProposalFiles(Array.from(e.target.files))} />
                                            </div>
                                            {proposalFiles.length > 0 && (
                                                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                                                    style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                                    <Check size={12} style={{ color: '#16A34A' }} />
                                                    <span className="text-xs truncate" style={{ color: WF.black }}>{proposalFiles[0].name}</span>
                                                </div>
                                            )}
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
