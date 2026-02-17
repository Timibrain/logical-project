'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Inter, Manrope } from 'next/font/google';
import LiveChat from '@/components/LiveChat';
import EmailSupportModal from '@/components/EmailSupportModal';
import {
    Settings, Bell, Plus, Send, ArrowDown, Grid, Eye, EyeOff,
    ShieldCheck, Bitcoin, Landmark, HandCoins, ReceiptText,
    TrendingUp, ChevronRight, ChevronLeft, CreditCard, PieChart,
    Activity, Trophy, MessageCircle, Mail, Headphones, Clock, Zap, ArrowDownLeft
} from 'lucide-react';

// Components
import DepositModal from '@/components/DepositModal';
import BankingSidebar from '@/components/BankingSidebar';
import BottomNav from '@/components/BottomNav';
import TransferModal from '@/components/TransferModal';
import TaxRefundModal from '@/components/TaxRefundModal';
import LoanApplicationModal from '@/components/LoanApplicationModal';
import GrantApplicationModal from '@/components/GrantApplicationModal';
import InvestmentModal from '@/components/InvestmentModal';

const inter = Inter({ subsets: ['latin'] });
const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hideBalance, setHideBalance] = useState(false);
    const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isTaxOpen, setIsTaxOpen] = useState(false);
    const [isLoanOpen, setIsLoanOpen] = useState(false);
    const [isGrantOpen, setIsGrantOpen] = useState(false);
    const [isInvestOpen, setIsInvestOpen] = useState(false);

    // HARDCODED BALANCE FOR NOW (Replace with `user?.balance` later if you have it in DB)
    const currentBalance = 64600.00;

    // --- CAROUSEL STATE ---
    const [activeCard, setActiveCard] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/login');
            else {
                setUser(session.user);
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const width = scrollRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveCard(index);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center text-[#112E51] font-bold tracking-widest">AUTHENTICATING...</div>;

    return (
        <div className={`min-h-screen bg-[#F2F4F7] text-[#112E51] pb-32 ${inter.className}`}>

            {/* --- CORPORATE BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[#F2F4F7]"></div>

            {/* --- HEADER --- */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-center relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 bg-[#1170FF] rounded-full animate-pulse"></span>
                        <p className={`text-slate-500 text-[11px] font-bold tracking-widest uppercase ${manrope.className}`}>Private Client</p>
                    </div>
                    <h1 className="text-2xl font-bold capitalize text-[#0B1C33] tracking-tight">{user?.email?.split('@')[0] || 'User'}</h1>
                </div>
                <div className="flex gap-3">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-[#1170FF] hover:border-[#1170FF] hover:shadow-md transition-all">
                        <Settings size={20} />
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-[#1170FF] hover:border-[#1170FF] hover:shadow-md transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#D92D20] rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </header>

            {/* --- PREMIUM CARDS --- */}
            <section className="mb-8 relative z-10">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* FIAT ACCOUNT (Chase Sapphire Vibe) */}
                    <div className="min-w-full px-6 snap-center">
                        <div className="w-full bg-gradient-to-br from-[#0F203C] to-[#1E3A5F] rounded-[20px] p-6 relative overflow-hidden h-[210px] flex flex-col justify-between shadow-[0_20px_40px_-10px_rgba(15,32,60,0.4)] group">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[60px]"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className={`text-slate-300 text-[10px] font-bold uppercase tracking-[2px] mb-1 ${manrope.className}`}>Total Liquidity</p>
                                    <p className={`text-white/60 text-[11px] tracking-widest ${manrope.className}`}>•••• 8308</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 backdrop-blur-md border border-white/10">
                                    <ShieldCheck size={12} className="text-white" />
                                    <p className="text-white text-[10px] font-bold tracking-wider">SECURE</p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <h2 className={`text-4xl text-white font-bold tracking-tight ${manrope.className}`}>
                                        {hideBalance ? '•••••••' : '$64,600.00'}
                                    </h2>
                                    <button onClick={() => setHideBalance(!hideBalance)} className="text-slate-400 hover:text-white transition">
                                        {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-slate-400 text-[11px] mt-1 font-medium">Available Balance</p>
                            </div>

                            <div className="flex justify-between items-center relative z-10 border-t border-white/10 pt-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#12B76A] rounded-full shadow-[0_0_8px_#12B76A]"></div>
                                    <span className={`text-[10px] font-bold text-white tracking-wider ${manrope.className}`}>ACTIVE STATUS</span>
                                </div>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-80" />
                            </div>
                        </div>
                    </div>

                    {/* CRYPTO ACCOUNT */}
                    <div className="min-w-full px-6 snap-center">
                        <div className="w-full bg-gradient-to-br from-[#F2F4F7] to-[#E4E7EC] border border-white rounded-[20px] p-6 relative overflow-hidden h-[210px] flex flex-col justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px]"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className={`text-slate-500 text-[10px] font-bold uppercase tracking-[2px] mb-1 ${manrope.className}`}>Digital Assets</p>
                                    <div className="flex items-center gap-1.5 text-[#0B1C33] font-bold text-[11px]">
                                        <Bitcoin size={14} className="text-[#F7931A] fill-[#F7931A]" />
                                        BITCOIN
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[#F7931A] text-[11px] font-bold ${manrope.className}`}>1 BTC = $86,069</span>
                                </div>
                            </div>

                            <div className="relative z-10 mt-2">
                                <h2 className={`text-4xl text-[#0B1C33] font-bold tracking-tight ${manrope.className}`}>
                                    {hideBalance ? '•••••••' : '0.408736'} <span className="text-lg text-slate-400 font-medium">BTC</span>
                                </h2>
                                <p className="text-slate-500 text-[11px] mt-1 font-medium">≈ $35,179.44 USD</p>
                            </div>

                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-auto">
                                <div className="h-full bg-[#F7931A] w-[40%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-2">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeCard === 0 ? 'w-6 bg-[#0B1C33]' : 'w-1.5 bg-slate-300'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeCard === 1 ? 'w-6 bg-[#F7931A]' : 'w-1.5 bg-slate-300'}`} />
                </div>
            </section>

            {/* --- QUICK ACTIONS --- */}
            <section className="px-6 mb-10 relative z-10">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-[#1170FF] rounded-full flex items-center justify-center shadow-lg shadow-blue-200 group-active:scale-95 transition-all">
                            <Plus size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-[#0B1C33]">Deposit</span>
                    </button>

                    <button onClick={() => setIsTransferOpen(true)} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:border-[#1170FF] transition-all">
                            <Send size={20} className="text-slate-600 group-hover:text-[#1170FF]" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 group-hover:text-[#1170FF]">Send</span>
                    </button>

                    <button onClick={() => setIsDepositOpen(true)} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:border-[#1170FF] transition-all">
                            <ArrowDown size={20} className="text-slate-600 group-hover:text-[#1170FF]" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 group-hover:text-[#1170FF]">Receive</span>
                    </button>

                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:border-[#1170FF] transition-all">
                            <Grid size={20} className="text-slate-600 group-hover:text-[#1170FF]" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 group-hover:text-[#1170FF]">More</span>
                    </button>
                </div>
            </section>

            {/* --- FINANCIAL SERVICES --- */}
            <section className="px-6 mb-8 relative z-10">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-bold text-[#0B1C33]">Financial Services</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[16px] shadow-sm border border-slate-100 relative group hover:shadow-md hover:border-blue-200 transition-all">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                            <Landmark size={20} className="text-[#1170FF]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0B1C33]">Loans</h4>
                        <p className="text-[10px] text-slate-500 mb-4 mt-1">Personal & Business</p>
                        <button className="w-full py-2 bg-slate-50 text-[#1170FF] text-[10px] font-bold rounded-lg group-hover:bg-[#1170FF] group-hover:text-white transition-colors" onClick={() => setIsLoanOpen(true)}>Apply Now</button>
                    </div>

                    <div className="bg-white p-5 rounded-[16px] shadow-sm border border-slate-100 relative group hover:shadow-md hover:border-green-200 transition-all">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <HandCoins size={20} className="text-[#12B76A]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0B1C33]">Grants</h4>
                        <p className="text-[10px] text-slate-500 mb-4 mt-1">Federal & State</p>
                        <button className="w-full py-2 bg-slate-50 text-[#12B76A] text-[10px] font-bold rounded-lg group-hover:bg-[#12B76A] group-hover:text-white transition-colors" onClick={() => setIsGrantOpen(true)}>Check Status</button>
                    </div>

                    <div className="bg-white p-5 rounded-[16px] shadow-sm border border-slate-100 relative group hover:shadow-md hover:border-purple-200 transition-all">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                            <ReceiptText size={20} className="text-[#7F56D9]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0B1C33]">Tax Refunds</h4>
                        <p className="text-[10px] text-slate-500 mb-4 mt-1">Express Processing</p>
                        <button className="w-full py-2 bg-slate-50 text-[#7F56D9] text-[10px] font-bold rounded-lg group-hover:bg-[#7F56D9] group-hover:text-white transition-colors" onClick={() => setIsTaxOpen(true)}>Claim Now</button>
                    </div>

                    <div className="bg-white p-5 rounded-[16px] shadow-sm border border-slate-100 relative group hover:shadow-md hover:border-indigo-200 transition-all">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                            <TrendingUp size={20} className="text-[#6172F3]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0B1C33]">Investments</h4>
                        <p className="text-[10px] text-slate-500 mb-4 mt-1">Start with $500</p>
                        <button className="w-full py-2 bg-slate-50 text-[#6172F3] text-[10px] font-bold rounded-lg group-hover:bg-[#6172F3] group-hover:text-white transition-colors" onClick={() => setIsInvestOpen(true)}>View Portfolio</button>
                    </div>
                </div>
            </section>

            {/* --- EXPERT PORTFOLIOS --- */}
            <section className="px-6 mb-8 relative z-10">
                <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-[#0B1C33]">Portfolio Analysis</h3>
                            <p className="text-[10px] text-slate-500 mt-1">Risk Profile: Conservative</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <PieChart size={16} className="text-slate-600" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0B1C33]"></span><span className="text-[10px] font-medium text-slate-600">Bonds (82%)</span></div>
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#1170FF]"></span><span className="text-[10px] font-medium text-slate-600">Stocks (16%)</span></div>
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#12B76A]"></span><span className="text-[10px] font-medium text-slate-600">Cash (2%)</span></div>
                        </div>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#F2F4F7" strokeWidth="12" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#0B1C33" strokeWidth="12" strokeDasharray="206 251" strokeDashoffset="0" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1170FF" strokeWidth="12" strokeDasharray="40 251" strokeDashoffset="-206" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#12B76A" strokeWidth="12" strokeDasharray="5 251" strokeDashoffset="-246" />
                            </svg>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-[11px] font-bold text-[#0B1C33] hover:bg-[#F9FAFB] transition-colors">View Full Report</button>
                </div>
            </section>

            {/* --- RECENT ACTIVITY (NEW) --- */}
            <section className="px-6 mb-8 relative z-10">
                <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-[#0B1C33]">Recent Activity</h3>
                        <button className="text-[11px] text-[#1170FF] font-bold hover:underline">View All</button>
                    </div>

                    <div className="space-y-6">
                        {/* Item 1 */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                    <ArrowDownLeft size={18} className="text-[#12B76A]" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#0B1C33]">Deposit Received</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">02 Nov 2025, 17:00</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#12B76A]">+$0.41</p>
                                <button className="text-[10px] text-[#1170FF] font-medium mt-0.5">View Details</button>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                    <ArrowDownLeft size={18} className="text-[#12B76A]" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#0B1C33]">Wire Transfer</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">21 Nov 2025, 05:59</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#12B76A]">+$65,000.00</p>
                                <button className="text-[10px] text-[#1170FF] font-medium mt-0.5">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ACHIEVEMENTS & SUPPORT (NEW) --- */}
            <section className="px-6 mb-8 relative z-10 space-y-4">

                {/* Achievement Banner */}
                <div className="bg-gradient-to-r from-[#0B1C33] to-[#1E3A5F] rounded-[16px] p-4 flex items-center gap-4 shadow-sm text-white">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Trophy size={18} className="text-[#FFD700]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold">First Deposit</h4>
                        <p className="text-[10px] text-slate-300">Great start to your financial journey!</p>
                    </div>
                </div>

                {/* Need Help Grid */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-sm font-bold text-[#0B1C33]">Need Help?</h3>
                        <button className="text-[11px] text-[#1170FF] font-bold">Support Center</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:border-[#1170FF] transition-all group shadow-sm" onClick={() => setIsLiveChatOpen(true)}>
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#1170FF] transition-colors">
                                <MessageCircle size={16} className="text-[#1170FF] group-hover:text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#0B1C33]">Live Chat</p>
                                <p className="text-[9px] text-slate-500">Get instant help</p>
                            </div>
                        </button>

                        <button className="bg-white p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:border-[#1170FF] transition-all group shadow-sm" onClick={() => setIsEmailOpen(true)}>
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#1170FF] transition-colors">
                                <Mail size={16} className="text-[#1170FF] group-hover:text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#0B1C33]">Email Support</p>
                                <p className="text-[9px] text-slate-500">Send a message</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 24/7 Support Banner */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-[16px] p-6 text-center shadow-sm">
                    <div className="flex justify-center gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                            <Clock size={10} className="text-[#1170FF]" />
                            <span className="text-[9px] font-bold text-[#0B1C33]">24/7</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                            <Headphones size={10} className="text-[#12B76A]" />
                            <span className="text-[9px] font-bold text-[#0B1C33]">Support</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                            <Zap size={10} className="text-[#F7931A]" />
                            <span className="text-[9px] font-bold text-[#0B1C33]">Fast</span>
                        </div>
                    </div>
                    <h4 className="text-xs font-bold text-[#0B1C33] mb-1">24/7 Priority Support</h4>
                    <p className="text-[10px] text-slate-500">We&apos;re here to help you anytime, anywhere.</p>
                </div>

            </section>
            <BottomNav />
            <BankingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userId={user?.id} />
            <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
            <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
            <LiveChat
                isOpen={isLiveChatOpen}
                onClose={() => setIsLiveChatOpen(false)}
                userId={user?.id}
            />
            <EmailSupportModal
                isOpen={isEmailOpen}
                onClose={() => setIsEmailOpen(false)}
                userId={user?.id}
                userEmail={user?.email}
            />
            <TaxRefundModal
                isOpen={isTaxOpen}
                onClose={() => setIsTaxOpen(false)}
                userId={user?.id}
            />
            <LoanApplicationModal
                isOpen={isLoanOpen}
                onClose={() => setIsLoanOpen(false)}
                userId={user?.id}
            />
            <GrantApplicationModal
                isOpen={isGrantOpen}
                onClose={() => setIsGrantOpen(false)}
                userId={user?.id}
            />
            <InvestmentModal
                isOpen={isInvestOpen}
                onClose={() => setIsInvestOpen(false)}
                onRequestDeposit={() => {
                    setIsInvestOpen(false);
                    setIsDepositOpen(true); 
                }}
                userId={user?.id}
                currentBalance={currentBalance}
            />
        </div>
    );
}