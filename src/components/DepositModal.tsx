'use client';

import React, { useEffect, useState } from 'react';
import { Copy, X, Bitcoin, DollarSign, ScanLine } from 'lucide-react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ==========================================
// 🔧 ADMIN CONFIGURATION
// ==========================================
const WALLETS = {
    BTC: {
        id: 'BTC',
        name: 'BITCOIN_NET',
        // 👇 PASTE YOUR BITCOIN ADDRESS HERE
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        color: 'text-orange-500',
        borderColor: 'border-orange-500'
    },
    USDT: {
        id: 'USDT',
        name: 'ERC20_TETHER',
        // 👇 PASTE YOUR USDT ADDRESS HERE
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        color: 'text-emerald-500',
        borderColor: 'border-emerald-500'
    }
};

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [isActive, setIsActive] = useState(false);

    // New State for Asset Switching
    const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'USDT'>('BTC');
    const currentWallet = WALLETS[selectedAsset];

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsActive(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsActive(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
            {/* 1. Backdrop with Grid Pattern */}
            <div
                className={`absolute inset-0 bg-[#050505]/95 backdrop-blur-sm transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* --- STYLE DEFINITIONS --- */}
            <style jsx>{`
        /* Fonts */
        .font-mono { font-family: 'Courier New', monospace; letter-spacing: -0.5px; }
        .font-grotesk { font-family: system-ui, sans-serif; }

        /* Container */
        .modal-container { 
          position: relative;
          width: 700px; /* Made wider to fit QR + Text */
          height: auto;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform: scale(0.95);
        }
        .active .modal-container { transform: scale(1); }

        /* Frame Lines */
        .line { position: absolute; background-color: rgba(255, 255, 255, 0.3); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .line-h { height: 1px; left: 0; right: 0; transform: scaleX(0); }
        .line-top { top: -30px; transform-origin: left; }
        .line-bottom { bottom: -30px; transform-origin: right; }
        .line-v { width: 1px; top: -30px; bottom: -30px; transform: scaleY(0); }
        .line-left { left: -30px; transform-origin: bottom; }
        .line-right { right: -30px; transform-origin: top; }
        .active .line-h { transform: scaleX(1.15); }
        .active .line-v { transform: scaleY(1); }

        /* Rivets */
        .rivet {
          position: absolute; width: 4px; height: 4px; background: #00ffaa;
          box-shadow: 0 0 10px #00ffaa; opacity: 0; transition: opacity 0.2s ease 0.6s;
        }
        .active .rivet { opacity: 1; }
        .r-tl { top: -32px; left: -32px; } .r-tr { top: -32px; right: -32px; }
        .r-bl { bottom: -32px; left: -32px; } .r-br { bottom: -32px; right: -32px; }

        /* Inner Content */
        .inner-content {
          background: #000; padding: 40px; opacity: 0;
          transform: translateY(10px); transition: all 0.5s ease 0.2s;
        }
        .active .inner-content { opacity: 1; transform: translateY(0); }

        /* QR Scan Animation */
        .scan-laser {
            position: absolute; width: 100%; height: 2px; background: #00ffaa;
            box-shadow: 0 0 10px #00ffaa; animation: scan 2s infinite linear;
        }
        @keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>

            {/* 2. Main Rig */}
            <div className={`modal-container ${isActive ? 'active' : ''}`}>

                {/* Animated Sticks */}
                <div className="line line-h line-top"></div>
                <div className="line line-h line-bottom"></div>
                <div className="line line-v line-left"></div>
                <div className="line line-v line-right"></div>

                <div className="rivet r-tl"></div><div className="rivet r-tr"></div>
                <div className="rivet r-bl"></div><div className="rivet r-br"></div>

                {/* 3. Content Box */}
                <div className="inner-content relative z-10 flex flex-col md:flex-row gap-8">

                    {/* LEFT SIDE: QR CODE & TOGGLE */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">

                        {/* ASSET SWITCHER BUTTONS */}
                        <div className="flex w-full mb-6 border border-white/20 p-1">
                            {Object.values(WALLETS).map((wallet) => (
                                <button
                                    key={wallet.id}
                                    onClick={() => setSelectedAsset(wallet.id as 'BTC' | 'USDT')}
                                    className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest transition-all ${selectedAsset === wallet.id
                                        ? 'bg-white text-black'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {wallet.id}
                                </button>
                            ))}
                        </div>

                        {/* QR CODE DISPLAY */}
                        <div className="relative w-full aspect-square bg-white p-2 mb-4 group">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentWallet.address}`}
                                alt="QR"
                                className="w-full h-full object-contain"
                            />
                            {/* Laser Scan Effect */}
                            <div className="scan-laser pointer-events-none"></div>
                        </div>

                        <div className="flex items-center gap-2 text-[#00ffaa] text-[9px] uppercase tracking-widest font-mono animate-pulse">
                            <ScanLine size={12} />
                            Awaiting Signal
                        </div>
                    </div>

                    {/* RIGHT SIDE: TEXT DETAILS */}
                    <div className="w-full md:w-2/3">
                        <div className="mb-6">
                            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block mb-2">
                                Secure_Channel_Open
                            </span>
                            <h1 className="text-2xl font-bold text-white font-grotesk tracking-tight uppercase">
                                DEPOSIT // {selectedAsset}
                            </h1>
                        </div>

                        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-grotesk">
                            Initiating manual handshake. Protocol: <span className={`${currentWallet.color} font-bold`}>{currentWallet.name}</span>.
                            Ensure funds are sent via the correct chain to prevent packet loss.
                        </p>

                        {/* Wallet Address Box */}
                        <div className="mb-6">
                            <label className="text-[9px] text-gray-600 font-mono uppercase tracking-widest mb-2 block">
                                Destination Coordinate
                            </label>
                            <div
                                onClick={() => navigator.clipboard.writeText(currentWallet.address)}
                                className={`bg-[#0a0a0a] border border-white/10 p-3 flex items-center justify-between group hover:${currentWallet.borderColor} transition-colors cursor-pointer`}
                            >
                                <code className={`text-xs font-mono truncate mr-2 ${currentWallet.color}`}>
                                    {currentWallet.address}
                                </code>
                                <Copy size={14} className="text-gray-600 group-hover:text-white" />
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mb-6">
                            <div>
                                <span className="text-[9px] text-gray-500 font-mono block mb-1">NET_LATENCY</span>
                                <span className="text-white text-xs font-mono">12ms (STABLE)</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-gray-500 font-mono block mb-1">CONFIRMATIONS</span>
                                <span className="text-white text-xs font-mono">3 REQUIRED</span>
                            </div>
                        </div>

                        {/* Action for Buttons */}
                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-black border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
                                Check Status
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-black border border-red-900/30 text-red-500 text-[10px] font-bold tracking-widest uppercase hover:bg-red-900/10 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}