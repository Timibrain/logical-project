'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff, Shield, Lock, ArrowLeft, Loader2, Smartphone } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

// 6-box OTP input — single hidden input + visual boxes (reliable on all devices)
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const digits = value.padEnd(6, '').slice(0, 6).split('');
    return (
        <div className="relative flex gap-2 justify-center cursor-text"
            onClick={() => inputRef.current?.focus()}>
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={value}
                onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="absolute inset-0 opacity-0 w-full h-full"
                style={{ zIndex: 10 }}
                autoFocus
            />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}
                    className="w-11 h-14 rounded-xl flex items-center justify-center text-xl font-bold pointer-events-none select-none transition-all"
                    style={{
                        background: digits[i] ? 'rgba(215,30,40,0.05)' : WF.bg,
                        border: `2px solid ${value.length === i ? WF.red : digits[i] ? WF.red : WF.border}`,
                        color: WF.black,
                    }}>
                    {digits[i]}
                </div>
            ))}
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    // MFA state
    const [mfaStep, setMfaStep]       = useState(false);
    const [mfaCode, setMfaCode]       = useState('');
    const [factorId, setFactorId]     = useState('');
    const [challengeId, setChallengeId] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');

        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

        if (signInErr) {
            setError(signInErr.message === 'Invalid login credentials'
                ? 'Incorrect email or password. Please try again.'
                : signInErr.message);
            setLoading(false);
            return;
        }

        // Check if MFA is required
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
            // Get the enrolled TOTP factor
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const totp = factors?.totp?.[0];
            if (totp) {
                // Start a challenge
                const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
                if (challengeErr || !challenge) {
                    setError('Failed to start 2FA challenge. Please try again.');
                    setLoading(false);
                    return;
                }
                setFactorId(totp.id);
                setChallengeId(challenge.id);
                setMfaStep(true);
                setLoading(false);
                return;
            }
        }

        // No MFA — go straight to dashboard
        router.push('/dashboard');
        setLoading(false);
    };

    const handleMfa = async () => {
        if (mfaCode.length !== 6) return;
        setMfaLoading(true); setError('');

        const { error: verifyErr } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: mfaCode,
        });

        if (verifyErr) {
            setError('Incorrect code. Check your authenticator app and try again.');
            setMfaCode('');
            setMfaLoading(false);
            return;
        }

        router.push('/dashboard');
    };

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        if (mfaStep && mfaCode.length === 6) handleMfa();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mfaCode]);

    const leftPanel = (
        <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #B91C1C 0%, #7F1D1D 55%, #3A0A0A 100%)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full"
                style={{ background: 'rgba(255,205,65,0.08)', filter: 'blur(60px)' }} />
            <div className="relative z-10">
                <Link href="/" className="flex items-center gap-1.5">
                    <span className="font-display text-2xl font-bold" style={{ color: '#FFCD41' }}>West</span>
                    <span className="font-display text-2xl font-bold text-white">Bank</span>
                </Link>
            </div>
            <div className="relative z-10 space-y-6">
                <div>
                    <h2 className="font-display text-3xl font-bold leading-tight mb-4">
                        Your finances,<br />fully protected.
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Every account is FDIC insured up to $250,000. Our team monitors every transaction 24/7.
                    </p>
                </div>
                {[
                    { icon: Shield, label: 'FDIC Insured · Member Since 2019' },
                    { icon: Lock,   label: '256-bit AES Encryption' },
                    { icon: Smartphone, label: 'Two-Factor Authentication' },
                ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,205,65,0.15)' }}>
                            <Icon size={14} style={{ color: '#FFCD41' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                    </div>
                ))}
            </div>
            <p className="relative z-10 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                West Bank, N.A. · Member FDIC · Equal Housing Lender<br />
                © {new Date().getFullYear()} West Bank. All rights reserved.
            </p>
        </div>
    );

    // ── MFA screen ────────────────────────────────────────────────────────────
    if (mfaStep) {
        return (
            <div className="min-h-screen flex font-sans" style={{ background: WF.bg }}>
                {leftPanel}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        <button onClick={() => { setMfaStep(false); setMfaCode(''); setError(''); }}
                            className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline"
                            style={{ color: WF.muted }}>
                            <ArrowLeft size={14} /> Back to login
                        </button>

                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                            style={{ background: 'rgba(215,30,40,0.08)' }}>
                            <Smartphone size={28} style={{ color: WF.red }} />
                        </div>

                        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: WF.black }}>
                            Two-Factor Authentication
                        </h1>
                        <p className="text-sm mb-8" style={{ color: WF.muted }}>
                            Enter the 6-digit code from your authenticator app to continue.
                        </p>

                        <div className="space-y-6">
                            <OtpInput value={mfaCode} onChange={setMfaCode} />

                            {error && (
                                <div className="px-4 py-3 rounded-xl text-sm"
                                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleMfa}
                                disabled={mfaLoading || mfaCode.length !== 6}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: WF.red, boxShadow: '0 4px 16px rgba(215,30,40,0.3)' }}>
                                {mfaLoading
                                    ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                                    : 'Verify & Sign In'}
                            </button>

                            <p className="text-xs text-center" style={{ color: WF.muted }}>
                                Open Google Authenticator or Authy to find your code.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Password screen ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex font-sans" style={{ background: WF.bg }}>
            {leftPanel}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="lg:hidden flex items-center gap-1.5 mb-10">
                    <span className="font-display text-2xl font-bold" style={{ color: WF.red }}>West</span>
                    <span className="font-display text-2xl font-bold" style={{ color: WF.black }}>Bank</span>
                </div>

                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline"
                        style={{ color: WF.muted }}>
                        <ArrowLeft size={14} /> Back to home
                    </Link>

                    <h1 className="font-display text-3xl font-bold mb-1" style={{ color: WF.black }}>
                        Sign in to your account
                    </h1>
                    <p className="text-sm mb-8" style={{ color: WF.muted }}>
                        Welcome back. Enter your credentials to continue.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: WF.muted }}>
                                Email Address
                            </label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required autoComplete="email" autoFocus
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{ background: WF.surface, border: `1.5px solid ${WF.border}`, color: WF.black }}
                                onFocus={e => { e.target.style.borderColor = WF.red; }}
                                onBlur={e => { e.target.style.borderColor = WF.border; }} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: WF.muted }}>Password</label>
                                <Link href="/forgot-password" className="text-xs font-bold hover:underline" style={{ color: WF.red }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required autoComplete="current-password"
                                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                                    style={{ background: WF.surface, border: `1.5px solid ${WF.border}`, color: WF.black }}
                                    onFocus={e => { e.target.style.borderColor = WF.red; }}
                                    onBlur={e => { e.target.style.borderColor = WF.border; }} />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl text-sm"
                                style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading || !email || !password}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: WF.red, boxShadow: '0 4px 16px rgba(215,30,40,0.3)' }}>
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ background: WF.border }} />
                        <span className="text-xs" style={{ color: WF.muted }}>New to West Bank?</span>
                        <div className="flex-1 h-px" style={{ background: WF.border }} />
                    </div>

                    <Link href="/register"
                        className="block w-full text-center py-3.5 rounded-xl font-bold text-sm border transition-all hover:shadow-sm"
                        style={{ borderColor: WF.border, color: WF.black }}>
                        Open a Free Account
                    </Link>

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
