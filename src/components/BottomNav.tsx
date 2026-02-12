'use client';

import React from 'react';
import { Home, ArrowRightLeft, CreditCard, User, Activity } from 'lucide-react';

export default function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 pb-6 pt-2 pointer-events-none flex justify-center">
            {/* The Floating Nav Bar */}
            <div className="pointer-events-auto bg-[#1a1f2e]/90 backdrop-blur-md border border-white/10 rounded-3xl px-6 py-4 flex items-center justify-between w-full max-w-md shadow-2xl">

                <button className="flex flex-col items-center gap-1 group">
                    <Activity size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-white font-medium">Activity</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <ArrowRightLeft size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-white font-medium">Transfer</span>
                </button>

                {/* Home Button (Active) */}
                <button className="flex flex-col items-center gap-1 -mt-8">
                    <div className="w-14 h-14 bg-[#0099ff] rounded-full flex items-center justify-center shadow-[0_0_20px_#0099ff]">
                        <Home size={24} className="text-white" />
                    </div>
                    <span className="text-[10px] text-[#0099ff] font-bold mt-1">Home</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <CreditCard size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-white font-medium">Cards</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <User size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-white font-medium">Profile</span>
                </button>

            </div>
        </div>
    );
}