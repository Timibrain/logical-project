'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Mail, Shield, Loader2, CheckCircle } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', black: '#1A1A1A', bg: '#FAF8F5',
    surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) setError(error.message);
        else setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 font-sans" style={{ background: WF.bg }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-1.5 mb-10">
                    <span className="font-display text-2xl font-bold" style={{ color: WF.red }}>West</span>
                    <span className="font-display text-2xl font-bold" style={{ color: WF.black }}>Bank</span>
                </div>

                <div className="rounded-2xl p-8 shadow-sm" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    {sent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                <CheckCircle size={30} style={{ color: WF.red }} />
                            </div>
                            <h2 className="font-display text-2xl font-bold mb-3" style={{ color: WF.black }}>
                                Check your inbox
                            </h2>
                            <p className="text-sm leading-relaxed mb-6" style={{ color: WF.muted }}>
                                We've sent a password reset link to <strong>{email}</strong>.
                                Check your inbox (and spam folder) and follow the instructions.
                            </p>
                            <p className="text-xs mb-6" style={{ color: WF.muted }}>
                                The link expires in 60 minutes for your security.
                            </p>
                            <Link href="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                                style={{ background: WF.red }}>
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                <Mail size={22} style={{ color: WF.red }} />
                            </div>
                            <h1 className="font-display text-2xl font-bold mb-2" style={{ color: WF.black }}>
                                Forgot your password?
                            </h1>
                            <p className="text-sm leading-relaxed mb-7" style={{ color: WF.muted }}>
                                No problem. Enter your email address and we'll send you a secure link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
                                        style={{ color: WF.muted }}>Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com" required autoFocus
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                        style={{ background: WF.bg, border: `1.5px solid ${WF.border}`, color: WF.black }}
                                        onFocus={e => { e.target.style.borderColor = WF.red; }}
                                        onBlur={e => { e.target.style.borderColor = WF.border; }} />
                                </div>

                                {error && (
                                    <div className="px-4 py-3 rounded-xl text-sm"
                                        style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading || !email}
                                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: WF.red }}>
                                    {loading
                                        ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                                        : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <div className="text-center mt-6">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm hover:underline"
                        style={{ color: WF.muted }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                    <Shield size={11} style={{ color: WF.muted }} />
                    <p className="text-[10px]" style={{ color: WF.muted }}>
                        West Bank, N.A. · Member FDIC · AES-256 Encrypted
                    </p>
                </div>
            </div>
        </div>
    );
}
