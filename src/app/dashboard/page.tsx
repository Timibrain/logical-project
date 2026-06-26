'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    Layers,
    LogOut,
    ShieldAlert,
    Wallet,
    Cpu
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

    // --- AUTH CHECK ---
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login'); // Kick them out if not logged in
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="h-screen bg-[#0a0c10] flex items-center justify-center text-[#00f2ff]">INITIALIZING SECURE SESSION...</div>;

    return (
        <div className={`min-h-screen bg-[#0a0c10] text-white overflow-x-hidden ${inter.className}`}>

            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 bg-noise z-50 pointer-events-none mix-blend-overlay"></div>

            {/* --- NAVIGATION BAR --- */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[94%] h-16 glass-panel rounded-xl flex items-center justify-between px-6 z-40">
                <div className={`flex items-center gap-3 text-lg font-bold tracking-tighter ${mono.className}`}>
                    <div className="w-3 h-3 bg-[#00f2ff] rounded-full shadow-[0_0_10px_#00f2ff]" />
                    AETHER_CORE // <span className="text-gray-500 text-xs mt-1">V2.4</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-400 font-mono border border-white/10 px-3 py-1 rounded">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        NET_STATUS: STABLE
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 text-[10px] hover:text-[#00f2ff] transition-colors uppercase tracking-widest ${mono.className}`}
                    >
                        <LogOut size={14} /> Terminate
                    </button>
                </div>
            </nav>

            {/* --- MAIN DASHBOARD GRID --- */}
            <main className="pt-32 pb-10 px-[3%] max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* 1. BALANCE MODULE (Large Card) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-8 glass-panel p-8 md:p-10 relative overflow-hidden group"
                >
                    {/* Background Gradient Blob */}
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#00f2ff]/5 rounded-full blur-[100px] group-hover:bg-[#00f2ff]/10 transition-all duration-700" />

                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <span className={`text-xs text-[#00f2ff] tracking-[4px] uppercase ${mono.className}`}>Available Liquidity</span>
                            <Activity className="text-gray-500 w-5 h-5" />
                        </div>

                        <div className="my-6">
                            <h1 className={`text-5xl md:text-7xl font-bold text-white text-spectral tracking-tighter ${inter.className}`}>
                                $284,902.41
                            </h1>
                        </div>

                        <div className={`flex gap-8 text-[10px] text-gray-400 ${mono.className}`}>
                            <div>
                                <p className="mb-1 text-gray-600">USDT_EQUIV</p>
                                <p className="text-white text-sm">1,420,119.00</p>
                            </div>
                            <div>
                                <p className="mb-1 text-gray-600">ACTIVE_MINTS</p>
                                <p className="text-white text-sm">14 NODES</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. ACTION CENTER (Right Column) */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-5">
                    {/* Deposit Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 glass-panel flex flex-col items-center justify-center gap-4 py-8 hover:bg-white/5 transition-all group cursor-pointer border-[#00f2ff]/20 hover:border-[#00f2ff]/50"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#00f2ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowDownLeft className="text-[#00f2ff]" />
                        </div>
                        <span className={`text-xs tracking-widest ${mono.className}`}>DEPOSIT_ASSET</span>
                    </motion.button>

                    {/* Withdraw Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 glass-panel flex flex-col items-center justify-center gap-4 py-8 hover:bg-white/5 transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="text-white" />
                        </div>
                        <span className={`text-xs tracking-widest ${mono.className}`}>WITHDRAWAL</span>
                    </motion.button>
                </div>

                {/* 3. TRANSACTION LOG (Bottom Left) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-1 md:col-span-8 glass-panel p-8"
                >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                        <span className={`text-xs text-gray-500 tracking-[2px] ${mono.className}`}>REGISTRY LOG</span>
                        <span className={`text-[10px] text-[#00f2ff] ${mono.className}`}>LIVE_SYNC::ACTIVE</span>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: '8802-TX', asset: 'ETH', amount: '+4.200', status: 'SETTLED', time: '14:02:11', color: 'text-emerald-400' },
                            { id: '8799-TX', asset: 'SOL', amount: '-142.00', status: 'PENDING', time: '13:58:04', color: 'text-amber-400' },
                            { id: '8795-TX', asset: 'BTC', amount: '+0.045', status: 'SETTLED', time: '12:44:20', color: 'text-emerald-400' },
                        ].map((tx, i) => (
                            <div key={i} className="grid grid-cols-4 items-center text-sm hover:bg-white/5 p-2 rounded transition-colors cursor-pointer group">
                                <span className={`text-[10px] px-2 py-1 bg-white/5 rounded w-fit ${tx.color} ${mono.className}`}>{tx.status}</span>
                                <span className={`font-mono text-gray-400 group-hover:text-white`}>#{tx.id}</span>
                                <span className="text-right font-medium">{tx.amount} {tx.asset}</span>
                                <span className="text-right text-gray-600 text-xs font-mono">{tx.time}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 4. SYSTEM HEALTH (Bottom Right) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-1 md:col-span-4 glass-panel p-8 relative overflow-hidden"
                >
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Layers size={120} strokeWidth={0.5} />
                    </div>

                    <span className={`text-xs text-gray-500 tracking-[2px] block mb-6 ${mono.className}`}>RELAY SIGNALS</span>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-[#00f2ff] w-5 h-5 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Multi-sig Authorization</p>
                                <p className="text-xs text-gray-500 mt-1">Required for outbound transfers ETH.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Cpu className="text-white w-5 h-5 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Node Integrity</p>
                                <p className="text-xs text-gray-500 mt-1">100% Stable. 42ms Latency.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Wallet className="text-gray-400 w-5 h-5 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-400">Yield Staking</p>
                                <p className="text-xs text-gray-600 mt-1">New governance pool available.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </main>
        </div>
    );
}