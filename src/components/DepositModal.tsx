'use client';

import React, { useEffect, useState } from 'react';
import { Copy, X, RefreshCw } from 'lucide-react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [isActive, setIsActive] = useState(false);
    const [wallet] = useState("0x71C7...B5f6d89"); // Mock Address

    useEffect(() => {
        if (isOpen) {
            // Trigger animation after a brief delay
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
                className={`absolute inset-0 bg-[#050505]/90 backdrop-blur-sm transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
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

        /* Structural Container */
        .modal-container { 
          position: relative;
          width: 550px;
          height: auto;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform: scale(0.95);
        }
        .active .modal-container { transform: scale(1); }

        /* THE FRAME LINES ("The Sticks") */
        .line {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.3);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); /* The "Snap" ease */
        }
        
        /* Horizontal Lines */
        .line-h { height: 1px; left: 0; right: 0; transform: scaleX(0); }
        .line-top { top: -30px; transform-origin: left; }
        .line-bottom { bottom: -30px; transform-origin: right; }
        
        /* Vertical Lines */
        .line-v { width: 1px; top: -30px; bottom: -30px; transform: scaleY(0); }
        .line-left { left: -30px; transform-origin: bottom; }
        .line-right { right: -30px; transform-origin: top; }

        /* Animation State: Expand lines fully */
        .active .line-h { transform: scaleX(1.2); } /* 1.2 makes them stick out */
        .active .line-v { transform: scaleY(1); }

        /* The Crosshair "Plus" markers at corners */
        .crosshair {
          position: absolute;
          width: 10px;
          height: 10px;
          transition: opacity 0.4s ease 0.4s; /* Delay appearance */
          opacity: 0;
        }
        .active .crosshair { opacity: 1; }

        .ch-tl { top: -35px; left: -35px; border-bottom: 1px solid #00ffaa; border-right: 1px solid #00ffaa; }
        .ch-tr { top: -35px; right: -35px; border-bottom: 1px solid #00ffaa; border-left: 1px solid #00ffaa; }
        .ch-bl { bottom: -35px; left: -35px; border-top: 1px solid #00ffaa; border-right: 1px solid #00ffaa; }
        .ch-br { bottom: -35px; right: -35px; border-top: 1px solid #00ffaa; border-left: 1px solid #00ffaa; }

        /* The Green "Rivets" (Small Dots) */
        .rivet {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00ffaa;
          box-shadow: 0 0 10px #00ffaa;
          opacity: 0;
          transition: opacity 0.2s ease 0.6s; /* Appear last */
        }
        .active .rivet { opacity: 1; }
        
        .r-tl { top: -32px; left: -32px; }
        .r-tr { top: -32px; right: -32px; }
        .r-bl { bottom: -32px; left: -32px; }
        .r-br { bottom: -32px; right: -32px; }

        /* Inner Card */
        .inner-content {
          background: #000;
          padding: 40px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.5s ease 0.2s;
        }
        .active .inner-content { opacity: 1; transform: translateY(0); }

        /* Buttons */
        .btn-glitch {
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        .btn-glitch:hover {
          box-shadow: 0 0 20px rgba(0, 255, 170, 0.4);
          text-shadow: 2px 0 #ff0055, -2px 0 #00ffff;
        }
      `}</style>

            {/* 2. The Main Rig */}
            <div className={`modal-container ${isActive ? 'active' : ''}`}>

                {/* Floating Metadata (Outside the box) */}
                <div className="absolute -top-12 left-[-30px] text-[9px] text-gray-500 font-mono tracking-widest opacity-0 transition-opacity duration-700 delay-300 active:opacity-100">
                    LAT 40.7128 // LNG_74.0060
                </div>
                <div className="absolute -bottom-12 right-[-30px] text-[9px] text-gray-500 font-mono tracking-widest opacity-0 transition-opacity duration-700 delay-300 active:opacity-100">
                    SST_REF: 0x8F92A
                </div>

                {/* The Animated "Sticks" */}
                <div className="line line-h line-top"></div>
                <div className="line line-h line-bottom"></div>
                <div className="line line-v line-left"></div>
                <div className="line line-v line-right"></div>

                {/* The Corner Rivets (Green Dots) */}
                <div className="rivet r-tl"></div>
                <div className="rivet r-tr"></div>
                <div className="rivet r-bl"></div>
                <div className="rivet r-br"></div>

                {/* 3. The Content Box */}
                <div className="inner-content relative z-10">
                    <div className="mb-6">
                        <span className="text-[10px] text-[#00ffaa] font-mono tracking-widest uppercase block mb-2">
                            System.Deployment.Node_04
                        </span>
                        <h1 className="text-3xl font-bold text-white font-grotesk tracking-tight uppercase">
                            SECURE_DEPOSIT_CHANNEL
                        </h1>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-8 font-grotesk max-w-sm">
                        Initiating manual deposit request. You are connecting directly to our secure vault. Please ensure you are sending the correct asset. Our team will verify this transaction upon arrival
                        <span className="text-white font-bold">ETH (ERC-20)</span> to the secure vault below.
                    </p>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6 mb-8">
                        <div>
                            <span className="text-[9px] text-gray-500 font-mono block mb-1">CONNECTION_QUALITY</span>
                            <span className="text-white text-xs font-mono">98.42% (OPTIMAL)</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-gray-500 font-mono block mb-1">ESTIMATED_REVIEW_TIME</span>
                            <span className="text-white text-xs font-mono">0.004ms / CYCLE</span>
                        </div>
                    </div>

                    {/* Wallet Display */}
                    <div className="bg-[#0a0a0a] border border-white/10 p-3 mb-6 flex items-center justify-between group hover:border-[#00ffaa] transition-colors cursor-pointer">
                        <code className="text-[#00ffaa] text-xs font-mono">{wallet}</code>
                        <Copy size={14} className="text-gray-500 group-hover:text-white" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button className="btn-glitch px-6 py-3 bg-black border border-[#00ffaa] text-[#00ffaa] text-[10px] font-bold tracking-widest uppercase hover:bg-[#00ffaa] hover:text-black">
                            Re-Initialize
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-black border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
                        >
                            Terminate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}