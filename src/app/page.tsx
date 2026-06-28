'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Shield, Lock, Clock, TrendingUp, ChevronRight, CheckCircle,
    Smartphone, Globe, Star, Menu, X, ArrowRight,
    CreditCard, PiggyBank, BarChart3, Landmark, Phone, Mail, MapPin
} from 'lucide-react';

const WF = {
    red: '#D71E28', redDark: '#A3151D', gold: '#FFCD41',
    black: '#1A1A1A', bg: '#FAF8F5', surface: '#FFFFFF',
    border: '#E8E2DA', muted: '#6B6560', light: '#F5F0EB',
};

export default function HomePage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans" style={{ background: WF.bg, color: WF.black }}>

            {/* ═══════════════════════════════════════════════════
                NAV
            ═══════════════════════════════════════════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b"
                style={{ background: 'rgba(250,248,245,0.97)', borderColor: WF.border, backdropFilter: 'blur(12px)' }}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5">
                        <span className="font-display text-xl font-bold italic" style={{ color: WF.red }}>West</span>
                        <span className="font-display text-xl font-bold" style={{ color: WF.black }}>Bank</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Personal', 'Business', 'Mortgages', 'Investing', 'About'].map(item => (
                            <a key={item} href="#"
                                className="text-sm font-medium transition-colors hover:text-red-700"
                                style={{ color: WF.muted }}>{item}</a>
                        ))}
                    </div>

                    {/* Auth buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login"
                            className="px-4 py-2 text-sm font-bold rounded-lg border transition-all hover:shadow-sm"
                            style={{ borderColor: WF.border, color: WF.black }}>
                            Sign In
                        </Link>
                        <Link href="/register"
                            className="px-4 py-2 text-sm font-bold rounded-lg text-white transition-all hover:opacity-90"
                            style={{ background: WF.red }}>
                            Open Account
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t px-6 py-4 space-y-3" style={{ borderColor: WF.border, background: WF.surface }}>
                        {['Personal', 'Business', 'Mortgages', 'Investing', 'About'].map(item => (
                            <a key={item} href="#" className="block text-sm font-medium py-2" style={{ color: WF.muted }}>{item}</a>
                        ))}
                        <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: WF.border }}>
                            <Link href="/login" className="text-center py-2.5 text-sm font-bold rounded-lg border" style={{ borderColor: WF.border }}>Sign In</Link>
                            <Link href="/register" className="text-center py-2.5 text-sm font-bold rounded-lg text-white" style={{ background: WF.red }}>Open Account</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ═══════════════════════════════════════════════════
                HERO
            ═══════════════════════════════════════════════════ */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden" style={{ background: WF.bg }}>
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
                    style={{ background: WF.red, filter: 'blur(80px)', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
                    style={{ background: WF.gold, filter: 'blur(60px)', transform: 'translate(-30%, 30%)' }} />

                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        {/* Trust strip */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-bold"
                            style={{ background: 'rgba(215,30,40,0.08)', color: WF.red }}>
                            <Shield size={12} />
                            FDIC Insured · Member Since 2019
                        </div>

                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
                            style={{ color: WF.black }}>
                            Banking built<br />
                            <span className="italic" style={{ color: WF.red }}>for people,</span><br />
                            not algorithms.
                        </h1>

                        <p className="text-lg leading-relaxed mb-10 max-w-xl" style={{ color: WF.muted }}>
                            West Bank offers personal banking with real human oversight. Every transaction verified,
                            every account protected. Open your account in minutes — no hidden fees, no surprises.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link href="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg"
                                style={{ background: WF.red, boxShadow: '0 4px 20px rgba(215,30,40,0.3)' }}>
                                Open a Free Account
                                <ArrowRight size={16} />
                            </Link>
                            <Link href="/login"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm border transition-all hover:shadow-sm"
                                style={{ borderColor: WF.border, color: WF.black }}>
                                Sign In
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap gap-6">
                            {[
                                { label: 'FDIC Insured', sub: 'Up to $250,000' },
                                { label: '256-bit Encryption', sub: 'Bank-grade security' },
                                { label: '24/7 Support', sub: 'Always available' },
                                { label: '$0 Monthly Fees', sub: 'No hidden charges' },
                            ].map(({ label, sub }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <CheckCircle size={14} style={{ color: WF.red }} />
                                    <div>
                                        <p className="text-xs font-bold" style={{ color: WF.black }}>{label}</p>
                                        <p className="text-[10px]" style={{ color: WF.muted }}>{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero card mockup */}
                    <div className="mt-16 relative max-w-sm">
                        <div className="w-full rounded-2xl p-6 relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 60%, #450A0A 100%)',
                                boxShadow: '0 24px 48px rgba(183,28,28,0.4)',
                                height: 200,
                            }}>
                            <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
                                style={{ background: 'rgba(255,205,65,0.1)', filter: 'blur(40px)' }} />
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest mb-1"
                                        style={{ color: 'rgba(255,255,255,0.5)' }}>WEST BANK</p>
                                    <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>•••• •••• •••• 8308</p>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold"
                                    style={{ background: 'rgba(255,205,65,0.15)', border: '1px solid rgba(255,205,65,0.3)', color: '#FFCD41' }}>
                                    <Shield size={10} /> SECURE
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Available Balance</p>
                                <p className="font-display text-3xl font-bold text-white mt-1">$24,500.00</p>
                            </div>
                            <div className="absolute bottom-4 right-6 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFCD41' }} />
                                <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>ACTIVE</span>
                            </div>
                        </div>
                        {/* Floating stat */}
                        <div className="absolute -bottom-4 -right-4 px-4 py-3 rounded-xl shadow-lg"
                            style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                            <p className="text-[10px] font-bold" style={{ color: WF.muted }}>This Month</p>
                            <p className="text-sm font-bold" style={{ color: '#12B76A' }}>+$3,240.00</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                TRUST STRIP
            ═══════════════════════════════════════════════════ */}
            <div className="border-y py-4 px-6" style={{ borderColor: WF.border, background: WF.surface }}>
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8">
                    {['FDIC Member', 'AES-256 Encrypted', 'Equal Housing Lender', 'Visa Certified Network', 'SOC 2 Compliant'].map(t => (
                        <span key={t} className="text-[11px] font-bold tracking-wider" style={{ color: WF.muted }}>{t}</span>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                TRUSTED BY ORGANIZATIONS
            ═══════════════════════════════════════════════════ */}
            <section className="py-16 px-6" style={{ background: WF.surface }}>
                <div className="max-w-7xl mx-auto">
                    <p className="text-center text-xs font-bold tracking-[3px] uppercase mb-10" style={{ color: WF.muted }}>
                        Trusted by leading organizations
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                        {[
                            { name: 'NexaCorp', abbr: 'NC', color: '#0369A1' },
                            { name: 'Granite\nAdvisors', abbr: 'GA', color: '#7F56D9' },
                            { name: 'Summit\nGroup', abbr: 'SG', color: '#0F766E' },
                            { name: 'Meridian\nCapital', abbr: 'MC', color: '#C9941A' },
                            { name: 'BlueBridge\nCo.', abbr: 'BB', color: WF.red },
                            { name: 'Vantage\nPartners', abbr: 'VP', color: '#374151' },
                        ].map(({ name, abbr, color }) => (
                            <div key={name} className="flex flex-col items-center gap-2 group cursor-default">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-sm text-white transition-all group-hover:scale-105"
                                    style={{ background: color, boxShadow: `0 4px 14px ${color}30` }}>
                                    {abbr}
                                </div>
                                <p className="text-[10px] font-bold text-center whitespace-pre-line leading-tight" style={{ color: WF.muted }}>
                                    {name}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: '50,000+', label: 'Active Members' },
                            { value: '$2.4B+', label: 'Assets Managed' },
                            { value: '99.98%', label: 'Uptime SLA' },
                            { value: '140+', label: 'Corporate Clients' },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center p-6 rounded-2xl"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                <p className="font-display text-3xl font-bold mb-1" style={{ color: WF.black }}>{value}</p>
                                <p className="text-xs font-bold" style={{ color: WF.muted }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                FEATURES
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: WF.red }}>Why West Bank</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: WF.black }}>
                            The smarter way to bank
                        </h2>
                        <div className="w-12 h-0.5 mx-auto rounded" style={{ background: WF.gold }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: 'Human-Verified',
                                desc: 'Every deposit and withdrawal is reviewed by our team — no bots, no frozen accounts.',
                                color: WF.red,
                            },
                            {
                                icon: Lock,
                                title: 'Bank-Grade Security',
                                desc: '256-bit encryption, multi-factor authentication, and real-time fraud monitoring.',
                                color: '#7F56D9',
                            },
                            {
                                icon: Clock,
                                title: '24/7 Support',
                                desc: 'Live chat, email support, and dedicated agents available around the clock.',
                                color: '#12B76A',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Grow Your Money',
                                desc: 'High-yield savings, investment portfolios, loans, and grants — all in one place.',
                                color: WF.gold === '#FFCD41' ? '#C9941A' : WF.gold,
                            },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="p-6 rounded-2xl transition-all hover:shadow-md group cursor-default"
                                style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                                    style={{ background: `${color}14` }}>
                                    <Icon size={22} style={{ color }} />
                                </div>
                                <h3 className="font-display text-base font-bold mb-2" style={{ color: WF.black }}>{title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: WF.muted }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                HOW IT WORKS
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6" style={{ background: WF.surface }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: WF.red }}>Get Started</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: WF.black }}>
                            Open an account in 3 steps
                        </h2>
                        <div className="w-12 h-0.5 mx-auto rounded" style={{ background: WF.gold }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line (desktop) */}
                        <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${WF.border}, transparent)` }} />

                        {[
                            { step: '01', title: 'Create Your Account', desc: 'Fill out a quick registration form with your name, email, and password. Takes under 2 minutes.' },
                            { step: '02', title: 'Verify Your Identity', desc: 'Our team manually reviews your details to ensure your account is fully protected and compliant.' },
                            { step: '03', title: 'Start Banking', desc: 'Make deposits, apply for loans, manage transfers — all from your secure dashboard.' },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="text-center relative">
                                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center font-display text-2xl font-bold text-white"
                                    style={{ background: WF.red, boxShadow: '0 8px 24px rgba(215,30,40,0.3)' }}>
                                    {step}
                                </div>
                                <h3 className="font-display text-lg font-bold mb-3" style={{ color: WF.black }}>{title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: WF.muted }}>{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                            style={{ background: WF.red }}>
                            Get Started Now <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                ACCOUNT TYPES
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: WF.red }}>Our Products</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: WF.black }}>
                            Everything you need, nothing you don't
                        </h2>
                        <div className="w-12 h-0.5 mx-auto rounded" style={{ background: WF.gold }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: CreditCard, color: WF.red,
                                title: 'Checking Account',
                                desc: 'Zero monthly fees, instant deposits, and real-time balance updates.',
                                perks: ['No minimum balance', 'Free debit card', 'Instant transfers'],
                            },
                            {
                                icon: PiggyBank, color: '#12B76A',
                                title: 'Savings Account',
                                desc: 'Earn competitive interest on your savings with no lock-in periods.',
                                perks: ['High-yield interest', 'FDIC insured', 'No withdrawal limits'],
                                featured: true,
                            },
                            {
                                icon: BarChart3, color: '#7F56D9',
                                title: 'Investment Account',
                                desc: 'Grow your wealth with expert-managed portfolios starting from $500.',
                                perks: ['Managed portfolios', 'Real-time tracking', 'Tax reporting'],
                            },
                            {
                                icon: Landmark, color: '#C9941A',
                                title: 'Business Banking',
                                desc: 'Full-featured business accounts with payroll, invoicing, and more.',
                                perks: ['Multi-user access', 'Business debit card', 'Expense tracking'],
                            },
                            {
                                icon: Globe, color: WF.red,
                                title: 'International Transfers',
                                desc: 'Send and receive wire transfers globally with transparent fees.',
                                perks: ['150+ countries', 'Live exchange rates', 'SWIFT / SEPA'],
                            },
                            {
                                icon: Smartphone, color: '#0EA5E9',
                                title: 'Mobile Banking',
                                desc: 'Full banking experience from your phone, with biometric login.',
                                perks: ['Mobile deposits', 'Push notifications', 'Face ID / Touch ID'],
                            },
                        ].map(({ icon: Icon, color, title, desc, perks, featured }) => (
                            <div key={title}
                                className={`p-6 rounded-2xl transition-all hover:shadow-md ${featured ? 'ring-2' : ''}`}
                                style={{
                                    background: featured ? `linear-gradient(135deg, ${WF.red}08, ${WF.red}04)` : WF.surface,
                                    border: `1px solid ${featured ? WF.red + '30' : WF.border}`,
                                    ...(featured ? { ringColor: WF.red } : {}),
                                }}>
                                {featured && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-4"
                                        style={{ background: WF.red, color: 'white' }}>
                                        <Star size={9} /> Most Popular
                                    </div>
                                )}
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: `${color}14` }}>
                                    <Icon size={20} style={{ color }} />
                                </div>
                                <h3 className="font-display text-base font-bold mb-2" style={{ color: WF.black }}>{title}</h3>
                                <p className="text-sm leading-relaxed mb-4" style={{ color: WF.muted }}>{desc}</p>
                                <ul className="space-y-1.5 mb-5">
                                    {perks.map(p => (
                                        <li key={p} className="flex items-center gap-2 text-xs" style={{ color: WF.muted }}>
                                            <CheckCircle size={12} style={{ color: WF.red }} />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register"
                                    className="flex items-center gap-1 text-xs font-bold transition-colors hover:gap-2"
                                    style={{ color: WF.red }}>
                                    Open Account <ChevronRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                LEADERSHIP TEAM
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6" style={{ background: WF.surface }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: WF.red }}>Our Team</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: WF.black }}>
                            Leadership you can trust
                        </h2>
                        <p className="text-sm max-w-lg mx-auto" style={{ color: WF.muted }}>
                            Our executives bring decades of experience from the world's top financial institutions.
                        </p>
                        <div className="w-12 h-0.5 mx-auto rounded mt-4" style={{ background: WF.gold }} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Richard Harlow', title: 'Chief Executive Officer', color: WF.red, exp: 'Formerly Goldman Sachs · 24 yrs experience', photo: 'photo-1560250097-0b93528c311a' },
                            { name: 'Diana Osei', title: 'Chief Financial Officer', color: '#0369A1', exp: 'Formerly JPMorgan · 18 yrs experience', photo: 'photo-1573496359142-b8d87734a5a2' },
                            { name: 'Marcus Webb', title: 'Chief Risk Officer', color: '#7F56D9', exp: 'Formerly Citibank · 21 yrs experience', photo: 'photo-1519085360753-af0119f7cbe7' },
                            { name: 'Sophia Tanaka', title: 'Head of Operations', color: '#0F766E', exp: 'Formerly HSBC · 15 yrs experience', photo: 'photo-1580489944761-15a19d654956' },
                        ].map(({ name, title, color, exp, photo }) => (
                            <div key={name} className="rounded-2xl overflow-hidden group cursor-default transition-all hover:shadow-lg"
                                style={{ background: WF.bg, border: `1px solid ${WF.border}` }}>
                                {/* Photo */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={`https://images.unsplash.com/${photo}?w=400&h=400&fit=crop&crop=faces&auto=format&q=80`}
                                        alt={name}
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.5) 0%, transparent 60%)' }} />
                                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: color }} />
                                </div>
                                {/* Info */}
                                <div className="p-5">
                                    <h3 className="font-display font-bold text-base mb-0.5" style={{ color: WF.black }}>{name}</h3>
                                    <p className="text-xs font-bold mb-2" style={{ color }}>{title}</p>
                                    <p className="text-[11px]" style={{ color: WF.muted }}>{exp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                REAL PEOPLE SECTION
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6" style={{ background: WF.bg }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: WF.red }}>Our Community</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: WF.black }}>
                            Real people. Real banking.
                        </h2>
                        <p className="text-sm max-w-lg mx-auto" style={{ color: WF.muted }}>
                            From entrepreneurs to students, West Bank serves members across every walk of life.
                        </p>
                        <div className="w-12 h-0.5 mx-auto rounded mt-4" style={{ background: WF.gold }} />
                    </div>

                    {/* Photo mosaic grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Large left card */}
                        <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group" style={{ minHeight: 360 }}>
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&h=700&fit=crop&crop=faces&auto=format&q=80"
                                alt="Business professional"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                style={{ minHeight: 360 }}
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.75) 0%, transparent 50%)' }} />
                            <div className="absolute bottom-5 left-5">
                                <p className="text-white font-display font-bold text-lg">Daniel Okafor</p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Business Account Holder · Lagos</p>
                            </div>
                        </div>

                        {/* Top right 1 */}
                        <div className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 170 }}>
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80"
                                alt="Professional woman"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.65) 0%, transparent 55%)' }} />
                            <div className="absolute bottom-3 left-3">
                                <p className="text-white text-xs font-bold">Amara Singh</p>
                                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Investment Member</p>
                            </div>
                        </div>

                        {/* Top right 2 */}
                        <div className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 170 }}>
                            <img
                                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces&auto=format&q=80"
                                alt="Professional man"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.65) 0%, transparent 55%)' }} />
                            <div className="absolute bottom-3 left-3">
                                <p className="text-white text-xs font-bold">James Adeyemi</p>
                                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Loan Member</p>
                            </div>
                        </div>

                        {/* Bottom right 1 */}
                        <div className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 170 }}>
                            <img
                                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces&auto=format&q=80"
                                alt="Professional woman"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.65) 0%, transparent 55%)' }} />
                            <div className="absolute bottom-3 left-3">
                                <p className="text-white text-xs font-bold">Claire Mensah</p>
                                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Savings Member</p>
                            </div>
                        </div>

                        {/* Bottom right 2 — red accent */}
                        <div className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 170 }}>
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80"
                                alt="Professional man"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.65) 0%, transparent 55%)' }} />
                            <div className="absolute bottom-3 left-3">
                                <p className="text-white text-xs font-bold">Kevin Larson</p>
                                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Grant Recipient</p>
                            </div>
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: WF.red, color: '#fff' }}>Member</div>
                        </div>
                    </div>

                    {/* Bottom row — 3 more portrait photos */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {[
                            { src: 'photo-1494790108377-be9c29b29330', name: 'Grace Okonkwo', role: 'Business Banking' },
                            { src: 'photo-1438761681033-6461ffad8d80', name: 'Sophia Carter', role: 'Checking Account' },
                            { src: 'photo-1500648767791-00dcc994a43e', name: 'Marcus Reid', role: 'Investment Member' },
                        ].map(({ src, name, role }) => (
                            <div key={name} className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 200 }}>
                                <img
                                    src={`https://images.unsplash.com/${src}?w=500&h=400&fit=crop&crop=faces&auto=format&q=80`}
                                    alt={name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.70) 0%, transparent 50%)' }} />
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-white text-sm font-bold">{name}</p>
                                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                TESTIMONIALS
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6" style={{ background: WF.light }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: WF.red }}>Reviews</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: WF.black }}>
                            Trusted by thousands
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Sarah Mitchell', role: 'Small Business Owner',
                                photo: 'photo-1573496359142-b8d87734a5a2',
                                text: 'West Bank approved my business loan in 48 hours. The human review process made me feel actually seen, not just a credit score.',
                            },
                            {
                                name: 'James Tanner', role: 'Freelancer',
                                photo: 'photo-1519085360753-af0119f7cbe7',
                                text: "I switched from a big bank after my account was frozen for 2 weeks. West Bank's team resolved my deposit in the same day.",
                            },
                            {
                                name: 'Priya Kumar', role: 'Graduate Student',
                                photo: 'photo-1580489944761-15a19d654956',
                                text: 'No monthly fees and real 24/7 support — I finally found a bank that treats students like real customers.',
                            },
                        ].map(({ name, role, text, photo }) => (
                            <div key={name} className="p-6 rounded-2xl" style={{ background: WF.surface, border: `1px solid ${WF.border}` }}>
                                <div className="flex gap-0.5 mb-4">
                                    {Array(5).fill(0).map((_, i) => (
                                        <Star key={i} size={14} fill={WF.gold} style={{ color: WF.gold }} />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: WF.muted }}>"{text}"</p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`https://images.unsplash.com/${photo}?w=80&h=80&fit=crop&crop=faces&auto=format&q=80`}
                                        alt={name}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        style={{ border: `2px solid ${WF.border}` }}
                                    />
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: WF.black }}>{name}</p>
                                        <p className="text-[11px]" style={{ color: WF.muted }}>{role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                CTA BANNER
            ═══════════════════════════════════════════════════ */}
            <section className="py-20 px-6 text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 60%, #450A0A 100%)' }}>
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
                    style={{ background: 'rgba(255,205,65,0.08)', filter: 'blur(80px)' }} />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                        Ready to bank smarter?
                    </h2>
                    <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Join thousands of members who trust West Bank with their finances. Open your account in minutes — no paperwork, no branch visits.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register"
                            className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                            style={{ background: WF.gold, color: WF.black }}>
                            Open a Free Account
                        </Link>
                        <Link href="/login"
                            className="px-8 py-4 rounded-xl font-bold text-sm border transition-all hover:bg-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                            Sign In to Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════ */}
            <footer className="py-16 px-6" style={{ background: WF.black, color: 'rgba(255,255,255,0.6)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-1.5 mb-4">
                                <span className="font-display text-xl font-bold italic" style={{ color: WF.red }}>West</span>
                                <span className="font-display text-xl font-bold text-white">Bank</span>
                            </div>
                            <p className="text-sm leading-relaxed max-w-xs">
                                Private banking with a human touch. FDIC insured, zero monthly fees, and real 24/7 support.
                            </p>
                            <div className="flex gap-3 mt-6">
                                {[Phone, Mail, MapPin].map((Icon, i) => (
                                    <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <Icon size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        {[
                            { heading: 'Personal', links: ['Checking', 'Savings', 'Loans', 'Mortgages', 'Credit Cards'] },
                            { heading: 'Business', links: ['Business Checking', 'Business Loans', 'Payroll', 'Merchant Services'] },
                            { heading: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact', 'Privacy Policy'] },
                        ].map(({ heading, links }) => (
                            <div key={heading}>
                                <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white">{heading}</p>
                                <ul className="space-y-2.5">
                                    {links.map(l => (
                                        <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <p className="text-xs">© {new Date().getFullYear()} West Bank, N.A. All rights reserved.</p>
                        <div className="flex flex-wrap gap-6 text-xs">
                            {['Member FDIC', 'Equal Housing Lender', 'Terms of Service', 'Privacy Policy', 'Accessibility'].map(t => (
                                <a key={t} href="#" className="hover:text-white transition-colors">{t}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
