'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { JetBrains_Mono, Syncopate } from 'next/font/google';
import { motion } from 'framer-motion';

// --- FONTS ---
const mono = JetBrains_Mono({ subsets: ['latin'] });
const display = Syncopate({ weight: ['400', '700'], subsets: ['latin'] });

// --- SUPABASE SETUP ---
// Replace these with your actual Supabase project keys!
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
type BlobEntity = {
    el: HTMLDivElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
};

export default function FerrofluidLogin() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- PHYSICS ENGINE ---
    useEffect(() => {
        if (!containerRef.current) return;

        const blobCount = 12;
        const blobs: BlobEntity[] = [];
        const container = containerRef.current;

        // 1. Initialize Blobs
        for (let i = 0; i < blobCount; i++) {
            const div = document.createElement('div');
            div.classList.add('ferro-blob');
            const size = Math.random() * 200 + 150;
            div.style.width = `${size}px`;
            div.style.height = `${size}px`;

            // Random start position
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;

            container.appendChild(div);

            blobs.push({
                el: div,
                x,
                y,
                vx: (Math.random() - 0.5) * 1.5, // Velocity X
                vy: (Math.random() - 0.5) * 1.5, // Velocity Y
                size
            });
        }

        // 2. Animation Loop
        let animationFrameId: number;
        const animate = () => {
            blobs.forEach(b => {
                b.x += b.vx;
                b.y += b.vy;

                // Bounce off walls (with buffer)
                if (b.x < -200) b.x = window.innerWidth + 200;
                if (b.x > window.innerWidth + 200) b.x = -200;
                if (b.y < -200) b.y = window.innerHeight + 200;
                if (b.y > window.innerHeight + 200) b.y = -200;

                b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // 3. Mouse Interaction (Magnetic Effect)
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
            }

            blobs.forEach(b => {
                const dx = e.clientX - b.x;
                const dy = e.clientY - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Magnetic pull if close
                if (dist < 400) {
                    b.x += dx * 0.02;
                    b.y += dy * 0.02;
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            if (container) container.innerHTML = ''; // Clear blobs
        };
    }, []);

    // --- AUTH HANDLER ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            // Redirect or update state
            console.log('Logged in successfully');
            // router.push('/dashboard')
        }
        setLoading(false);
    };

    return (
        <main className={`relative w-full h-screen overflow-hidden bg-[#030303] text-white flex items-center justify-center ${display.className}`}>

            {/* SVG Filter Definition (Hidden) */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            {/* Background Layer */}
            <div ref={containerRef} className="ferro-container fixed inset-0 z-0" />

            {/* Custom Cursor */}
            <div ref={cursorRef} className="cursor-blob hidden md:block" />

            {/* Login Interface */}
            <section className="relative z-10 w-full max-w-[450px] p-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.2, 1, 0.3, 1] }}
                    className="mb-14"
                >
                    <span className={`block text-xs uppercase tracking-[4px] text-gray-500 mb-2 ${mono.className}`}>
                        Security Interface v4.0
                    </span>
                    <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-gray-600 text-transparent bg-clip-text">
                        NEURAL<br />RECOGNITION
                    </h1>
                </motion.div>

                <form onSubmit={handleLogin} className="flex flex-col gap-8">
                    {/* Email Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1 }}
                        className="group relative"
                    >
                        <label className={`block text-[10px] text-gray-500 mb-2 uppercase tracking-widest transition-colors group-focus-within:text-white ${mono.className}`}>
                            Identity_UID (Email)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-white focus:pl-2 transition-all duration-300 ${mono.className}`}
                            placeholder="— — — —"
                        />
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="group relative"
                    >
                        <label className={`block text-[10px] text-gray-500 mb-2 uppercase tracking-widest transition-colors group-focus-within:text-white ${mono.className}`}>
                            Core_Key (Password)
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-white focus:pl-2 transition-all duration-300 ${mono.className}`}
                            placeholder="••••••••"
                        />
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <div className={`text-red-500 text-xs ${mono.className}`}>
                            ERROR: {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        disabled={loading}
                        className={`mt-8 w-full bg-white text-black py-5 font-bold text-xs tracking-[2px] hover:scale-[1.02] active:scale-[0.98] transition-transform relative overflow-hidden group ${display.className}`}
                    >
                        <span className="relative z-10">
                            {loading ? 'INITIALIZING...' : 'INITIALIZE COHESION'}
                        </span>
                        <div className="absolute inset-0 bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                    </motion.button>
                </form>
            </section>

            {/* Metadata Footer */}
            <div className={`fixed bottom-10 right-10 text-[10px] text-right text-gray-800 leading-relaxed pointer-events-none ${mono.className}`}>
                STATUS: {loading ? 'SYNCING' : 'STANDBY'}<br />
                FIELD_STRENGTH: 4.82 Tesla<br />
                ENCRYPTION: SHA-256
            </div>
        </main>
    );
}