'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import {
    ArrowLeft, User, Shield, Bell, ChevronRight,
    LogOut, Mail, Phone, MapPin, Lock, Eye, EyeOff, Loader2, CheckCircle,
    Smartphone, ShieldCheck, ShieldOff, Check
} from 'lucide-react';

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

// 6-digit OTP input — single hidden input + 6 visual boxes (works on all devices/browsers)
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const digits = value.padEnd(6, '').slice(0, 6).split('');
    return (
        <div className="relative flex gap-2 justify-center cursor-text"
            onClick={() => inputRef.current?.focus()}>
            {/* Invisible real input captures all keystrokes */}
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
            {/* Visual digit boxes */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}
                    className="w-10 h-12 rounded-xl flex items-center justify-center text-lg font-bold pointer-events-none select-none transition-all"
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

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Password change state
    const [showPwForm, setShowPwForm] = useState(false);
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState('');

    // 2FA state
    const [factors, setFactors]       = useState<any[]>([]);
    const [enrolling, setEnrolling]   = useState(false);
    const [qrCode, setQrCode]         = useState('');
    const [secret, setSecret]         = useState('');
    const [mfaFactorId, setMfaFactorId] = useState('');
    const [otp, setOtp]               = useState('');
    const [mfaErr, setMfaErr]         = useState('');
    const [mfaOk, setMfaOk]           = useState(false);
    const [disabling, setDisabling]   = useState(false);

    // Notification prefs
    const [notifications, setNotifications] = useState({
        deposits: true, withdrawals: true, promotions: false, security: true,
    });

    async function loadFactors() {
        const { data } = await supabase.auth.mfa.listFactors();
        setFactors(data?.totp ?? []);
    }

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }
            setUser(session.user);
            const { data: profile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
            setBalance(profile?.balance ?? 0);
            await loadFactors();
            setLoading(false);
        };
        init();
    }, [router]);

    async function startEnroll() {
        setMfaErr(''); setMfaOk(false);
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if (error || !data) { setMfaErr(error?.message ?? 'Enrollment failed.'); return; }
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setMfaFactorId(data.id);
        setEnrolling(true);
    }

    async function verifyEnroll() {
        if (otp.length !== 6) return;
        setMfaErr('');
        const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
        if (cErr || !challenge) { setMfaErr('Challenge failed. Try again.'); return; }
        const { error: vErr } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: otp });
        if (vErr) { setMfaErr('Incorrect code. Try again.'); setOtp(''); return; }
        setMfaOk(true); setEnrolling(false); setOtp('');
        await loadFactors();
    }

    async function disableFactor(id: string) {
        if (!confirm('Disable 2FA? You will only need your password to sign in.')) return;
        setDisabling(true);
        await supabase.auth.mfa.unenroll({ factorId: id });
        await loadFactors();
        setDisabling(false); setMfaOk(false);
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) { setPwMsg('Passwords do not match.'); return; }
        if (newPw.length < 8) { setPwMsg('Password must be at least 8 characters.'); return; }
        setPwLoading(true); setPwMsg('');
        const { error } = await supabase.auth.updateUser({ password: newPw });
        if (error) setPwMsg(error.message);
        else { setPwMsg('Password updated successfully!'); setNewPw(''); setConfirmPw(''); setShowPwForm(false); }
        setPwLoading(false);
    };

    const firstName = user?.user_metadata?.first_name ?? '';
    const lastName = user?.user_metadata?.last_name ?? '';
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || (user?.email?.split('@')[0] ?? 'Member');
    const rawInitials = (firstName?.[0] ?? '') + (lastName?.[0] ?? '');
    const initials = rawInitials || (displayName?.[0]?.toUpperCase() ?? 'M');

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: WF.bg }}>
            <Loader2 size={24} className="animate-spin" style={{ color: WF.red }} />
        </div>
    );

    return (
        <div className="min-h-screen pb-32 font-sans" style={{ background: WF.bg }}>

            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center gap-3">
                <button onClick={() => router.push('/dashboard')}
                    className="p-2 rounded-full border"
                    style={{ background: WF.surface, borderColor: WF.border }}>
                    <ArrowLeft size={18} style={{ color: WF.black }} />
                </button>
                <h1 className="font-display text-xl font-bold" style={{ color: WF.black }}>My Profile</h1>
            </header>

            <div className="px-6 space-y-6">
                {/* Avatar + summary */}
                <div className="p-6 rounded-2xl flex items-center gap-4"
                    style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold font-display flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${WF.red}, #7B0F15)` }}>
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-display text-lg font-bold truncate" style={{ color: WF.black }}>{displayName}</h2>
                        <p className="text-xs truncate" style={{ color: WF.muted }}>{user?.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(18,183,106,0.1)', color: '#14532D' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Private Client
                        </div>
                    </div>
                </div>

                {/* Account info */}
                <div className="rounded-2xl overflow-hidden" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: WF.border }}>
                        <User size={14} style={{ color: WF.red }} />
                        <h3 className="text-sm font-bold" style={{ color: WF.black }}>Account Information</h3>
                    </div>
                    {[
                        { icon: Mail, label: 'Email', value: user?.email ?? '—' },
                        { icon: Shield, label: 'Account Status', value: 'Verified ✓' },
                        { icon: Phone, label: 'Phone', value: 'Not set' },
                        { icon: MapPin, label: 'Address', value: 'Not set' },
                        { icon: Shield, label: 'Account Balance', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="px-5 py-3.5 flex items-center justify-between border-b last:border-0"
                            style={{ borderColor: WF.border }}>
                            <div className="flex items-center gap-3">
                                <Icon size={14} style={{ color: WF.muted }} />
                                <span className="text-xs" style={{ color: WF.muted }}>{label}</span>
                            </div>
                            <span className="text-xs font-bold max-w-[180px] truncate text-right" style={{ color: WF.black }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Security */}
                <div className="rounded-2xl overflow-hidden" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: WF.border }}>
                        <Lock size={14} style={{ color: WF.red }} />
                        <h3 className="text-sm font-bold" style={{ color: WF.black }}>Security</h3>
                    </div>

                    <button onClick={() => setShowPwForm(!showPwForm)}
                        className="w-full px-5 py-3.5 flex items-center justify-between border-b"
                        style={{ borderColor: WF.border }}>
                        <span className="text-xs" style={{ color: WF.muted }}>Change Password</span>
                        <ChevronRight size={14} style={{ color: WF.muted, transform: showPwForm ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {showPwForm && (
                        <form onSubmit={handlePasswordChange} className="px-5 py-4 space-y-3 border-b" style={{ borderColor: WF.border }}>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                                    placeholder="New password (min. 8 chars)"
                                    className="w-full px-3 py-2.5 pr-9 rounded-xl text-sm outline-none"
                                    style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: WF.muted }}>
                                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}`, color: WF.black }} />
                            {pwMsg && (
                                <p className="text-xs font-medium" style={{ color: pwMsg.includes('success') ? '#16A34A' : '#DC2626' }}>
                                    {pwMsg}
                                </p>
                            )}
                            <button type="submit" disabled={pwLoading || !newPw || !confirmPw}
                                className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: WF.red }}>
                                {pwLoading ? <><Loader2 size={12} className="animate-spin" /> Updating…</> : 'Update Password'}
                            </button>
                        </form>
                    )}

                    {/* 2FA row */}
                    {(() => {
                        const verified = factors.filter(f => f.status === 'verified');
                        const enabled = verified.length > 0;
                        return (
                            <div>
                                <div className="px-5 py-3.5 flex items-center justify-between"
                                    style={{ borderTop: `1px solid ${WF.border}`, borderBottom: enrolling ? `1px solid ${WF.border}` : 'none' }}>
                                    <div className="flex items-center gap-2">
                                        {enabled
                                            ? <ShieldCheck size={14} style={{ color: '#16A34A' }} />
                                            : <Smartphone size={14} style={{ color: WF.muted }} />}
                                        <span className="text-xs" style={{ color: WF.muted }}>Two-Factor Authentication</span>
                                        {enabled && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{ background: 'rgba(22,163,74,0.1)', color: '#14532D' }}>ON</span>
                                        )}
                                    </div>
                                    {enabled ? (
                                        <button onClick={() => disableFactor(verified[0].id)} disabled={disabling}
                                            className="text-xs font-bold flex items-center gap-1 hover:underline"
                                            style={{ color: WF.red }}>
                                            {disabling ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />}
                                            Disable
                                        </button>
                                    ) : !enrolling ? (
                                        <button onClick={startEnroll}
                                            className="text-xs font-bold flex items-center gap-1 hover:underline"
                                            style={{ color: WF.red }}>
                                            <Shield size={11} /> Enable
                                        </button>
                                    ) : null}
                                </div>

                                {mfaOk && (
                                    <div className="mx-5 mb-3 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                                        style={{ background: 'rgba(22,163,74,0.08)' }}>
                                        <Check size={13} style={{ color: '#16A34A' }} />
                                        <p className="text-xs font-bold" style={{ color: '#16A34A' }}>2FA enabled successfully!</p>
                                    </div>
                                )}

                                {enrolling && (
                                    <div className="px-5 pb-5 pt-4 space-y-4">
                                        <div>
                                            <p className="text-xs font-bold mb-1" style={{ color: WF.black }}>Step 1 — Scan QR code</p>
                                            <p className="text-[11px]" style={{ color: WF.muted }}>
                                                Open <strong>Google Authenticator</strong> or <strong>Authy</strong> and scan.
                                            </p>
                                        </div>
                                        {qrCode && (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-3 rounded-xl bg-white border"
                                                    style={{ borderColor: WF.border }}
                                                    dangerouslySetInnerHTML={{ __html: qrCode }} />
                                                <div className="w-full p-2.5 rounded-xl" style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: WF.muted }}>
                                                        Can't scan? Manual key:
                                                    </p>
                                                    <p className="text-[11px] font-mono break-all" style={{ color: WF.black }}>{secret}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold" style={{ color: WF.black }}>Step 2 — Enter 6-digit code</p>
                                            <OtpInput value={otp} onChange={setOtp} />
                                            {mfaErr && <p className="text-[11px] text-center" style={{ color: WF.red }}>{mfaErr}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEnrolling(false); setOtp(''); setMfaErr(''); }}
                                                className="flex-1 py-2.5 rounded-xl font-bold text-xs border"
                                                style={{ borderColor: WF.border, color: WF.muted }}>
                                                Cancel
                                            </button>
                                            <button onClick={verifyEnroll} disabled={otp.length !== 6}
                                                className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs disabled:opacity-40"
                                                style={{ background: WF.red }}>
                                                Verify & Activate
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Notifications */}
                <div className="rounded-2xl overflow-hidden" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                    <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: WF.border }}>
                        <Bell size={14} style={{ color: WF.red }} />
                        <h3 className="text-sm font-bold" style={{ color: WF.black }}>Notification Preferences</h3>
                    </div>
                    {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => (
                        <div key={key} className="px-5 py-3.5 flex items-center justify-between border-b last:border-0"
                            style={{ borderColor: WF.border }}>
                            <span className="text-xs capitalize" style={{ color: WF.muted }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                                onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                                className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
                                style={{ background: val ? WF.red : WF.border }}>
                                <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
                                    style={{ left: val ? 'calc(100% - 18px)' : '2px' }} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Member info */}
                <div className="p-4 rounded-2xl flex items-center gap-3"
                    style={{ background: 'rgba(215,30,40,0.04)', border: '1px solid rgba(215,30,40,0.12)' }}>
                    <CheckCircle size={16} style={{ color: WF.red }} className="flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold" style={{ color: WF.black }}>West Bank, N.A. — Member FDIC</p>
                        <p className="text-[11px]" style={{ color: WF.muted }}>
                            Your deposits are insured up to $250,000. AES-256 encrypted.
                        </p>
                    </div>
                </div>

                {/* Sign out */}
                <button onClick={handleLogout}
                    className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all hover:shadow-sm"
                    style={{ background: WF.surface, border: `1px solid ${WF.border}`, color: WF.red }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
