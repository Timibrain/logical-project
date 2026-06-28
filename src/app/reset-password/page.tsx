'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, CheckCircle, Lock } from 'lucide-react';

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: 'At least 8 characters', ok: password.length >= 8 },
        { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /\d/.test(password) },
        { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ['#DC2626', '#F59E0B', '#F59E0B', '#12B76A', '#12B76A'];

    if (!password) return null;
    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: i < score ? colors[score] : WF.border }} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {checks.map(c => (
                    <p key={c.label} className="text-[11px] flex items-center gap-1"
                        style={{ color: c.ok ? '#16A34A' : WF.muted }}>
                        <span>{c.ok ? '✓' : '·'}</span> {c.label}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase sends the user here after clicking the email link.
    // The hash fragment contains the access_token which Supabase picks up automatically.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setSessionReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setLoading(true); setError('');
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 2500);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 font-sans" style={{ background: WF.bg }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="font-display text-2xl font-bold" style={{ color: WF.red }}>West</span>
                        <span className="font-display text-2xl font-bold" style={{ color: WF.black }}>Bank</span>
                    </div>
                    <h1 className="font-display text-xl font-bold" style={{ color: WF.black }}>Set New Password</h1>
                    <p className="text-sm mt-1" style={{ color: WF.muted }}>
                        Choose a strong password for your account.
                    </p>
                </div>

                <div className="rounded-2xl p-8 shadow-sm" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    {success ? (
                        <div className="text-center py-6">
                            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#16A34A' }} />
                            <h2 className="font-display text-lg font-bold mb-2" style={{ color: WF.black }}>
                                Password Updated!
                            </h2>
                            <p className="text-sm" style={{ color: WF.muted }}>
                                Redirecting you to your dashboard…
                            </p>
                        </div>
                    ) : !sessionReady ? (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ background: 'rgba(215,30,40,0.08)' }}>
                                <Lock size={24} style={{ color: WF.red }} />
                            </div>
                            <p className="text-sm font-bold mb-1" style={{ color: WF.black }}>Waiting for verification…</p>
                            <p className="text-xs" style={{ color: WF.muted }}>
                                Please open this page via the link in your email. If you arrived here directly,
                                <button onClick={() => router.push('/forgot-password')}
                                    className="font-bold ml-1 hover:underline" style={{ color: WF.red }}>
                                    request a new link.
                                </button>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New password */}
                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: WF.black }}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        autoFocus
                                        className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                                        style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: WF.muted }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <PasswordStrength password={password} />
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: WF.black }}>
                                    Confirm Password
                                </label>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Repeat your password"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{ background: WF.bg, border: `1px solid ${confirm && confirm !== password ? '#DC2626' : WF.border}`, color: WF.black }}
                                    required
                                />
                                {confirm && confirm !== password && (
                                    <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Passwords don't match</p>
                                )}
                            </div>

                            {error && (
                                <p className="text-xs font-medium px-3 py-2 rounded-lg"
                                    style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !password || !confirm || password !== confirm}
                                className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: WF.red }}>
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
