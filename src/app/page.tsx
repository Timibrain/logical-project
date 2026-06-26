'use client';

import React, { useEffect, useRef, useState } from 'react';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { ChevronRight, Globe, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import ManualVerificationSection from '@/components/ManualVerificationSection';

// --- FONTS ---
const mono = JetBrains_Mono({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

// --- TYPE DEFINITIONS ---
type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

export default function HeroPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  // --- GRAPH ENGINE (Kept for "Global Network" feel, but softer speed) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodeCount = 40; // Fewer nodes for a cleaner look
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, // Very slow, calm movement
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // White nodes instead of Cyan

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance / 1500})`; // Very subtle lines
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    animate();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-white selection:text-black">

      {/* Background: Subtle Global Network */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
        <div className={`text-sm font-bold tracking-widest text-white ${mono.className}`}>
          Titan // CORE
        </div>
        <div className="flex gap-8 text-xs font-medium text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors">MEMBER LOGIN</Link>
          <a href="#" className="hover:text-white transition-colors">OUR VAULT</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md"
        >
          <span className={`text-[10px] tracking-widest text-gray-300 ${mono.className}`}>
            MANUAL BANKING STANDARD
          </span>
        </motion.div>

        {/* Title */}
        <h1 className={`text-5xl md:text-8xl font-medium tracking-tight text-center mb-8 ${inter.className}`}>
          Banking,<br />
          <span className="text-gray-500">Handled with Care.</span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl text-center text-gray-400 text-lg leading-relaxed mb-12"
        >
          A private financial community where every deposit is verified by a human, not a bot.
          <span className="text-white"> No frozen accounts. Just personal service.</span>
        </motion.p>

        {/* Access Input (Replaces Command Line) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md"
        >
          <div
            className={`relative group bg-[#0a0a0a] border border-white/10 rounded-full p-1.5 transition-all duration-300 ${isHovering ? 'border-white/30 shadow-lg shadow-white/5' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex items-center px-4 py-3">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter Access Code..."
                className={`w-full bg-transparent border-none outline-none text-white placeholder-gray-600 text-sm ml-2 ${inter.className}`}
              />
              <button className="bg-white hover:bg-gray-200 text-black rounded-full px-6 py-2 text-xs font-bold transition-colors">
                JOIN
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-4 gap-6 text-[10px] text-gray-500 font-mono">
            <span>•  Invite Only</span>
            <span>•  Manual Review</span>
          </div>
        </motion.div>
      </div>

      {/* Feature Footer */}
      <div className="absolute bottom-0 w-full border-t border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {[
            { icon: Users, title: "Community Driven", desc: "Built for fans, run by people." },
            { icon: Shield, title: "Manual Security", desc: "Every transaction is personally checked." },
            { icon: Globe, title: "Global Access", desc: "Your funds, available anywhere." }
          ].map((feature, i) => (
            <div key={i} className="p-8 flex items-center gap-4 group hover:bg-white/5 transition-colors">
              <feature.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              <div>
                <h3 className={`text-sm font-bold text-white mb-1 ${inter.className}`}>{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ManualVerificationSection />

    </main>
  );
}