'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff, Shield, CheckCircle, ArrowLeft, Loader2, Check } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: 'At least 8 characters', ok: password.length >= 8 },
        { label: 'Contains a number', ok: /\d/.test(password) },
        { label: 'Contains uppercase', ok: /[A-Z]/.test(password) },
        { label: 'Contains special character', ok: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ['#E8E2DA', '#DC2626', '#F59E0B', '#22C55E', '#16A34A'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    if (!password) return null;
    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-colors"
                        style={{ background: i <= score ? colors[score] : WF.border }} />
                ))}
            </div>
            <p className="text-[11px] font-bold" style={{ color: colors[score] }}>{labels[score]}</p>
            <div className="space-y-1">
                {checks.map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <Check size={11} style={{ color: ok ? '#16A34A' : WF.border }} />
                        <span className="text-[11px]" style={{ color: ok ? '#16A34A' : WF.muted }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const fieldStyle = {
        background: WF.surface, border: `1.5px solid ${WF.border}`, color: WF.black,
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.'); return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.'); return;
        }
        if (!agreed) {
            setError('Please agree to the Terms of Service.'); return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { first_name: form.firstName, last_name: form.lastName },
            },
        });
        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 font-sans" style={{ background: WF.bg }}>
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(215,30,40,0.08)' }}>
                        <CheckCircle size={36} style={{ color: WF.red }} />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-3" style={{ color: WF.black }}>Account Created!</h2>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: WF.muted }}>
                        We've sent a confirmation email to <strong>{form.email}</strong>.
                        Please verify your email address to activate your account, then sign in.
                    </p>
                    <Link href="/login"
                        className="inline-block px-8 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: WF.red }}>
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex font-sans" style={{ background: WF.bg }}>

            {/* ── Left panel ────────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #B91C1C 0%, #7F1D1D 55%, #3A0A0A 100%)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full"
                    style={{ background: 'rgba(255,205,65,0.08)', filter: 'blur(60px)' }} />

                <Link href="/" className="flex items-center gap-1.5 relative z-10">
                    <span className="font-display text-2xl font-bold italic" style={{ color: WF.gold }}>West</span>
                    <span className="font-display text-2xl font-bold text-white">Bank</span>
                </Link>

                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="font-display text-3xl font-bold leading-tight mb-4">
                            Join thousands of<br />smart savers.
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Open your free account in minutes. No minimum balance, no monthly fees, and a real human team watching your money.
                        </p>
                    </div>
                    {[
                        '$0 Monthly Fees',
                        'FDIC Insured up to $250,000',
                        'Free Debit Card',
                        '24/7 Human Support',
                    ].map(perk => (
                        <div key={perk} className="flex items-center gap-3">
                            <CheckCircle size={15} style={{ color: WF.gold }} />
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{perk}</span>
                        </div>
                    ))}
                </div>

                <p className="relative z-10 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    West Bank, N.A. · Member FDIC · Equal Housing Lender<br />
                    © {new Date().getFullYear()} West Bank. All rights reserved.
                </p>
            </div>

            {/* ── Right panel (form) ────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-1.5 mb-10">
                    <span className="font-display text-2xl font-bold italic" style={{ color: WF.red }}>West</span>
                    <span className="font-display text-2xl font-bold" style={{ color: WF.black }}>Bank</span>
                </div>

                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline"
                        style={{ color: WF.muted }}>
                        <ArrowLeft size={14} /> Back to home
                    </Link>

                    <h1 className="font-display text-3xl font-bold mb-1" style={{ color: WF.black }}>
                        Open your account
                    </h1>
                    <p className="text-sm mb-8" style={{ color: WF.muted }}>
                        Free to open. No credit check required.
                    </p>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: WF.muted }}>First Name</label>
                                <input type="text" value={form.firstName} onChange={set('firstName')}
                                    placeholder="First Name" required
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={fieldStyle}
                                    onFocus={e => { e.target.style.borderColor = WF.red; }}
                                    onBlur={e => { e.target.style.borderColor = WF.border; }} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: WF.muted }}>Last Name</label>
                                <input type="text" value={form.lastName} onChange={set('lastName')}
                                    placeholder="Last Name" required
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={fieldStyle}
                                    onFocus={e => { e.target.style.borderColor = WF.red; }}
                                    onBlur={e => { e.target.style.borderColor = WF.border; }} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: WF.muted }}>Email Address</label>
                            <input type="email" value={form.email} onChange={set('email')}
                                placeholder="you@example.com" required autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={fieldStyle}
                                onFocus={e => { e.target.style.borderColor = WF.red; }}
                                onBlur={e => { e.target.style.borderColor = WF.border; }} />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: WF.muted }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                                    placeholder="Min. 8 characters" required autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                                    style={fieldStyle}
                                    onFocus={e => { e.target.style.borderColor = WF.red; }}
                                    onBlur={e => { e.target.style.borderColor = WF.border; }} />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <PasswordStrength password={form.password} />
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: WF.muted }}>Confirm Password</label>
                            <div className="relative">
                                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                                    placeholder="Repeat password" required autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        ...fieldStyle,
                                        borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#DC2626' : WF.border,
                                    }}
                                    onFocus={e => { if (form.confirmPassword === form.password || !form.confirmPassword) e.target.style.borderColor = WF.red; }}
                                    onBlur={e => { e.target.style.borderColor = form.confirmPassword && form.confirmPassword !== form.password ? '#DC2626' : WF.border; }} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.confirmPassword && form.confirmPassword !== form.password && (
                                <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>Passwords do not match</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2.5">
                            <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded accent-red-700 cursor-pointer flex-shrink-0" />
                            <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer" style={{ color: WF.muted }}>
                                I agree to West Bank's{' '}
                                <a href="#" className="font-bold hover:underline" style={{ color: WF.red }}>Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="font-bold hover:underline" style={{ color: WF.red }}>Privacy Policy</a>.
                                I confirm I am 18 years or older.
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 rounded-xl text-sm"
                                style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading || !agreed}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: WF.red, boxShadow: '0 4px 16px rgba(215,30,40,0.3)' }}>
                            {loading
                                ? <><Loader2 size={16} className="animate-spin" /> Creating Account…</>
                                : 'Create Free Account'}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="text-sm text-center mt-6" style={{ color: WF.muted }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold hover:underline" style={{ color: WF.red }}>Sign In</Link>
                    </p>

                    {/* FDIC */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Shield size={12} style={{ color: WF.muted }} />
                        <p className="text-[10px]" style={{ color: WF.muted }}>
                            West Bank, N.A. · Member FDIC · Equal Housing Lender · AES-256 Encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
