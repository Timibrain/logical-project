'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Fingerprint, ShieldCheck, UserCheck, ScanLine } from 'lucide-react';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';

// --- FONTS (Local scope for this component) ---
const mono = JetBrains_Mono({ subsets: ['latin'] });
const grotesk = Space_Grotesk({ subsets: ['latin'] });

export default function ManualVerificationSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    });

    // Parallax & Opacity for the "Printing" effect
    const receiptY = useTransform(scrollYProgress, [0, 1], [100, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    // Spring physics for the "Stamp" slam
    const stampScale = useSpring(0, { stiffness: 400, damping: 15 });
    const stampOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
    const stampRotate = useTransform(scrollYProgress, [0.8, 1], [-20, -5]);

    return (
        <section ref={containerRef} className="relative min-h-[120vh] bg-[#050505] flex items-center justify-center py-24 overflow-hidden">

            {/* Background Grid (Blueprint Style) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-20 relative z-10">

                {/* LEFT: The Narrative */}
                <div className="flex-1 text-white max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse shadow-[0_0_10px_#00ffaa]" />
                            <span className={`text-white tracking-[2px] text-xs uppercase ${mono.className}`}>
                                The Manual Promise
                            </span>
                        </div>

                        <h2 className={`text-5xl md:text-6xl font-bold leading-tight mb-8 ${grotesk.className}`}>
                            MACHINES <span className="text-gray-600 line-through decoration-red-500 decoration-2">OVERLOOK.</span><br />
                            PEOPLE <span className="text-white border-b-2 border-white">UNDERSTAND.</span>
                        </h2>

                        <p className="text-gray-400 text-lg leading-relaxed mb-10">
                            Normal banks use algorithms that treat you like a number. At <span className="text-white font-bold">Titan</span>,
                            we treat you like a member. Every deposit is personally reviewed by our team to ensure your funds are safe and ready when you need them.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { icon: UserCheck, title: "Agent Verified", desc: "No AI false positives." },
                                { icon: ShieldCheck, title: "Cold Storage", desc: "Assets held offline." },
                                { icon: Fingerprint, title: "Biometric Sign", desc: "Hardware key required." },
                                { icon: ScanLine, title: "Traceability", desc: "Full audit trail." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 border border-white/10 hover:border-[#00ffaa]/50 bg-white/5 hover:bg-white/10 transition-all group">
                                    <item.icon className="text-gray-500 group-hover:text-[#00ffaa] transition-colors" />
                                    <div>
                                        <h4 className={`text-white text-sm font-bold uppercase mb-1 ${mono.className}`}>{item.title}</h4>
                                        <p className="text-gray-500 text-xs">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT: The Digital Receipt Animation */}
                <div className="flex-1 flex justify-center perspective-1000">
                    <motion.div
                        style={{ y: receiptY, opacity }}
                        className="relative w-full max-w-md bg-white text-black p-8 shadow-2xl origin-top"
                    >
                        {/* Jagged Edge Top */}
                        <div className="absolute top-0 left-0 w-full h-4 -mt-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }} />

                        {/* Receipt Content */}
                        <div className={`space-y-4 ${mono.className} text-xs md:text-sm`}>
                            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                                <span className="font-bold text-lg">TRANSACTION_RECORD</span>
                                <span className="text-gray-500">#00992-AX</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">TIMESTAMP</span>
                                    <span>2026-02-14 14:02:11 UTC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ORIGIN</span>
                                    <span>WALLET_0x71...B5f6</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">DESTINATION</span>
                                    <span>VAULT_CORE_04</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2">
                                    <span>AMOUNT</span>
                                    <span>$284,902.41</span>
                                </div>
                            </div>

                            <div className="my-8 py-4 border-y border-dashed border-gray-400">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 bg-black rounded-full" />
                                    <span className="uppercase font-bold">Consensus Check</span>
                                </div>
                                <p className="text-gray-500 text-[10px] leading-relaxed">
                                    VALIDATION NODE: AGENT_44<br />
                                    LATENCY: 42ms<br />
                                    SIGNATURE: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                                </p>
                            </div>

                            <div className="flex justify-center pt-4 opacity-50">
                                <code className="text-[10px] tracking-[4px]">END_OF_RECORD</code>
                            </div>
                        </div>

                        {/* Jagged Edge Bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-4 -mb-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }} />

                        {/* THE STAMP (Absolute Positioned Overlay) */}
                        <motion.div
                            style={{
                                scale: useTransform(scrollYProgress, [0.6, 0.75], [3, 1]), // Slam effect
                                opacity: stampOpacity,
                                rotate: stampRotate
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-[#00ffaa] text-[#00ffaa] px-6 py-2 z-20 mix-blend-multiply bg-white/50 backdrop-blur-sm"
                        >
                            <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${grotesk.className} whitespace-nowrap`}>
                                VERIFIED
                            </h2>
                            <div className="text-center text-[10px] tracking-[4px] font-bold border-t border-[#00ffaa] mt-1 pt-1">
                                Titan // MANUAL
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}