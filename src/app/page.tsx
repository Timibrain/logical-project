'use client';

import React, { useEffect, useRef, useState } from 'react';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { Terminal, ShieldCheck, Cpu, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
  const [command, setCommand] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  // --- 1. THE GRAPH ALGORITHM ENGINE (Background) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create Nodes (Data Structure)
    const nodeCount = 60;
    const nodes: Node[] = [];
    const connectionDistance = 150;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, // Slow, floating velocity
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw Nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Wall Collision (Bounce)
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125, 249, 255, 0.6)'; // Cyan-Electric
        ctx.fill();

        // Draw Edges (Graph Connections)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            // Opacity based on distance (Closer = brighter)
            const opacity = 1 - distance / connectionDistance;
            ctx.strokeStyle = `rgba(125, 249, 255, ${opacity * 0.2})`;
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

  // --- 2. DECRYPT TEXT EFFECT ---
  const [displayText, setDisplayText] = useState('SECURE_ARCHITECTURE');
  const targetText = 'LOGICAL_PROJECT';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)];
          })
          .join('')
      );
      if (iteration >= targetText.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#020408] text-white overflow-hidden selection:bg-[#7df9ff] selection:text-black">

      {/* Background Layer: Graph Network */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408] opacity-90" />

      {/* Navigation (Minimal) */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-white/5 backdrop-blur-sm">
        <div className={`text-sm font-bold tracking-widest text-[#7df9ff] ${mono.className}`}>
          // LOGICAL_SYS_V1
        </div>
        <div className="flex gap-6 text-xs text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors">LOGIN_SHELL</Link>
          <span className="opacity-20">|</span>
          <a href="#" className="hover:text-white transition-colors">DOCS</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">

        {/* Status Chip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#7df9ff]/20 bg-[#7df9ff]/5 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-[#7df9ff] animate-pulse" />
          <span className={`text-[10px] tracking-widest text-[#7df9ff] ${mono.className}`}>
            SYSTEM ONLINE :: PORT 3000
          </span>
        </motion.div>

        {/* Main Title with Decrypt Effect */}
        <h1 className={`text-5xl md:text-8xl font-black tracking-tighter text-center mb-6 mix-blend-screen ${inter.className}`}>
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 text-transparent bg-clip-text">
            {displayText}
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl text-center text-gray-400 md:text-lg leading-relaxed mb-12"
        >
          An advanced framework fusing <span className="text-white">algorithmic efficiency</span> with
          <span className="text-white"> military-grade encryption</span>.
          Built for the next generation of logical interfaces.
        </motion.p>

        {/* Command Line CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-md"
        >
          <div
            className={`relative group bg-[#0a0a0a] border border-white/10 rounded-lg p-1 transition-all duration-300 ${isHovering ? 'border-[#7df9ff]/50 shadow-[0_0_30px_rgba(125,249,255,0.1)]' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex items-center px-4 py-3">
              <ChevronRight className="w-4 h-4 text-[#7df9ff] mr-2 animate-pulse" />
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="sudo init_project..."
                className={`w-full bg-transparent border-none outline-none text-white placeholder-gray-600 text-sm ${mono.className}`}
                spellCheck={false}
              />
              <button className="bg-[#white] hover:bg-[#7df9ff] text-black rounded px-3 py-1 text-xs font-bold transition-colors">
                ENTER
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-3 px-2 text-[10px] text-gray-500 font-mono">
            <span>Latency: 12ms</span>
            <span>Encryption: AES-256</span>
          </div>
        </motion.div>
      </div>

      {/* Feature Grid (Footer) */}
      <div className="absolute bottom-0 w-full border-t border-white/5 bg-[#020408]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {[
            { icon: Terminal, title: "Algorithmic Core", desc: "Optimized graph traversal engines." },
            { icon: ShieldCheck, title: "Zero-Knowledge", desc: "End-to-end encrypted data flow." },
            { icon: Cpu, title: "Flash Performance", desc: "Native binary execution speed." }
          ].map((feature, i) => (
            <div key={i} className="p-6 flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-colors">
              <feature.icon className="w-6 h-6 text-gray-500 group-hover:text-[#7df9ff] transition-colors" />
              <div>
                <h3 className={`text-sm font-bold text-white ${mono.className}`}>{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}