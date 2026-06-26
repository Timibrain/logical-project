'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import {
    ArrowLeft, User, Shield, Bell, ChevronRight,
    LogOut, Mail, Phone, MapPin, Lock, Eye, EyeOff, Loader2, CheckCircle
} from 'lucide-react';

const WF = {
    red: '#D71E28', gold: '#FFCD41', black: '#1A1A1A',
    bg: '#FAF8F5', surface: '#FFFFFF', border: '#E8E2DA', muted: '#6B6560',
};

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

    // Notification prefs
    const [notifications, setNotifications] = useState({
        deposits: true, withdrawals: true, promotions: false, security: true,
    });

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }
            setUser(session.user);
            const { data: profile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
            setBalance(profile?.balance ?? 0);
            setLoading(false);
        };
        init();
    }, [router]);

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

                    <div className="px-5 py-3.5 flex items-center justify-between">
                        <span className="text-xs" style={{ color: WF.muted }}>Two-Factor Authentication</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#92400E' }}>Coming Soon</span>
                    </div>
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
