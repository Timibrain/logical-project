'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import DepositModal from '@/components/DepositModal';
import BankingSidebar from '@/components/BankingSidebar'; // <--- IMPORT THIS
import {
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    Layers,
    LogOut,
    ShieldAlert,
    Wallet,
    Cpu,
    Menu // <--- IMPORT THIS
} from 'lucide-react';

// --- FONTS ---
const mono = JetBrains_Mono({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

// --- SUPABASE CLIENT ---
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <--- NEW STATE
    const [user, setUser] = useState<any>(null); // <--- NEW STATE
    const [transactions, setTransactions] = useState<any[]>([]); // <--- NEW STATE (For History)

    // --- AUTH & DATA FETCH ---
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
                setLoading(false);

                // Fetch Transaction History (Real Data)
                const { data: txData } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (txData) setTransactions(txData);
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="h-screen bg-[#0a0c10] flex items-center justify-center text-[#00f2ff]">VERIFYING CREDENTIALS...</div>;

    return (
        <div className={`min-h-screen bg-[#0a0c10] text-white overflow-x-hidden ${inter.className}`}>

            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 bg-noise z-50 pointer-events-none mix-blend-overlay"></div>

            {/* --- NAVIGATION BAR --- */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[94%] h-16 glass-panel rounded-xl flex items-center justify-between px-6 z-40">
                <div className={`flex items-center gap-3 text-lg font-bold tracking-tighter ${mono.className}`}>
                    <div className="w-3 h-3 bg-[#00f2ff] rounded-full shadow-[0_0_10px_#00f2ff]" />
                    Titan Private // <span className="text-gray-500 text-xs mt-1">Client Portal</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-400 font-mono border border-white/10 px-3 py-1 rounded">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        SYSTEM: ONLINE
                    </div>

                    {/* LOGOUT BUTTON */}
                    <button
                        onClick={handleLogout}
                        className={`hidden md:flex items-center gap-2 text-[10px] hover:text-[#00f2ff] transition-colors uppercase tracking-widest ${mono.className}`}
                    >
                        <LogOut size={14} /> Sign Out
                    </button>

                    {/* HAMBURGER MENU (Triggers Sidebar) */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 border border-white/20 rounded hover:bg-white/10 transition-colors"
                    >
                        <Menu size={20} className="text-white" />
                    </button>
                </div>
            </nav>

            {/* --- MAIN DASHBOARD GRID --- */}
            <main className="pt-32 pb-10 px-[3%] max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* 1. BALANCE MODULE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-8 glass-panel p-8 md:p-10 relative overflow-hidden group"
                >
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#00f2ff]/5 rounded-full blur-[100px] group-hover:bg-[#00f2ff]/10 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <span className={`text-xs text-[#00f2ff] tracking-[4px] uppercase ${mono.className}`}>Total Portfolio Value</span>
                            <Activity className="text-gray-500 w-5 h-5" />
                        </div>
                        <div className="my-6">
                            <h1 className={`text-5xl md:text-7xl font-bold text-white text-spectral tracking-tighter ${inter.className}`}>
                                $284,902.41
                            </h1>
                        </div>
                        <div className={`flex gap-8 text-[10px] text-gray-400 ${mono.className}`}>
                            <div>
                                <p className="mb-1 text-gray-600">CURRENCY</p>
                                <p className="text-white text-sm">USD / EURO</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. ACTION CENTER */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-5">
                    <motion.button
                        onClick={() => setIsSidebarOpen(true)} // Open Sidebar on Deposit
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 glass-panel flex flex-col items-center justify-center gap-4 py-8 hover:bg-white/5 transition-all group cursor-pointer border-[#00f2ff]/20 hover:border-[#00f2ff]/50"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#00f2ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowDownLeft className="text-[#00f2ff]" />
                        </div>
                        <span className={`text-xs tracking-widest ${mono.className}`}>DEPOSIT FUNDS</span>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 glass-panel flex flex-col items-center justify-center gap-4 py-8 hover:bg-white/5 transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="text-white" />
                        </div>
                        <span className={`text-xs tracking-widest ${mono.className}`}>WITHDRAW FUNDS</span>
                    </motion.button>
                </div>

                {/* 3. TRANSACTION LOG (Now Real Data) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-1 md:col-span-8 glass-panel p-8"
                >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                        <span className={`text-xs text-gray-500 tracking-[2px] ${mono.className}`}>TRANSACTION HISTORY</span>
                        <span className={`text-[10px] text-[#00f2ff] ${mono.className}`}>LIVE UPDATES</span>
                    </div>

                    <div className="space-y-4">
                        {transactions.length === 0 && (
                            <div className="text-gray-600 text-xs italic">No recent transactions.</div>
                        )}
                        {transactions.map((tx, i) => (
                            <div key={i} className="grid grid-cols-4 items-center text-sm hover:bg-white/5 p-2 rounded transition-colors cursor-pointer group">
                                {/* Status Pill */}
                                <span className={`text-[10px] px-2 py-1 rounded w-fit ${mono.className} ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                    {tx.status}
                                </span>

                                <span className={`font-mono text-gray-400 group-hover:text-white`}>{tx.type} DEPOSIT</span>
                                <span className="text-right font-medium">+${tx.amount}</span>
                                <span className="text-right text-gray-600 text-xs font-mono">
                                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 4. SYSTEM HEALTH */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-1 md:col-span-4 glass-panel p-8 relative overflow-hidden"
                >
                    <span className={`text-xs text-gray-500 tracking-[2px] block mb-6 ${mono.className}`}>ACCOUNT SECURITY</span>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-[#00f2ff] w-5 h-5 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Verification Required</p>
                                <p className="text-xs text-gray-500 mt-1">Please verify large outbound transfers.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </main>

            {/* SIDEBAR COMPONENT */}
            <BankingSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userId={user?.id}
            />

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
            />
        </div>
    );
}