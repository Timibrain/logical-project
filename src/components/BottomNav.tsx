'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, ArrowRightLeft, CreditCard, User, Activity } from 'lucide-react';
import { div } from 'framer-motion/client';

const WF_RED = '#D71E28';

const tabs = [
    { id: 'activity', icon: Activity, label: 'Activity', path: '/activity' },
    { id: 'transfer', icon: ArrowRightLeft, label: 'Transfer', path: '/dashboard' },
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'cards', icon: CreditCard, label: 'Cards', path: '/cards' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-5 pt-2 pointer-events-none flex justify-center">
            <div className="pointer-events-auto backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-between w-full max-w-md shadow-2xl"
                style={{
                    background: 'rgba(26,10,10,0.93)',
                    border: '1px solid rgba(215,30,40,0.18)',
                }}>
                {tabs.map(({ id, icon: Icon, label, path }) => {
                    const isHome = id === 'home';
                    const isActive = pathname === path;

                    if (isHome) {
                        return (
                            <button key={id} onClick={() => router.push(path)}
                                className="flex flex-col items-center gap-1 -mt-7">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                                    style={{
                                        background: WF_RED,
                                        boxShadow: `0 0 22px rgba(215,30,40,0.55), 0 0 0 3px rgba(255,205,65,0.22)`,
                                    }}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <span className="text-[10px] font-bold mt-0.5" style={{ color: WF_RED }}>
                                    {label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button key={id} onClick={() => router.push(path)}
                            className="flex flex-col items-center gap-1 group transition-all">
                            <Icon size={20} style={{ color: isActive ? WF_RED : 'rgba(255,255,255,0.38)' }}
                                className="transition-colors group-hover:text-white" />
                            <span className="text-[10px] font-medium transition-colors group-hover:text-white"
                                style={{ color: isActive ? WF_RED : 'rgba(255,255,255,0.38)' }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
