'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Send, Mail, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Manrope } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

const manrope = Manrope({ subsets: ['latin'] });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmailSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userEmail: string;
}

export default function EmailSupportModal({ isOpen, onClose, userId, userEmail }: EmailSupportModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'NORMAL'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.message) return;

        setLoading(true);

        // 1. Save to Supabase
        const { error } = await supabase.from('support_tickets').insert([
            {
                user_id: userId,
                subject: formData.subject,
                message: formData.message,
                priority: formData.priority,
                status: 'OPEN'
            }
        ]);

        if (error) {
            alert('Failed to send message. Please try again.');
            setLoading(false);
        } else {
            setLoading(false);
            setSuccess(true);
            // Reset form after 2 seconds and close
            setTimeout(() => {
                setSuccess(false);
                setFormData({ subject: '', message: '', priority: 'NORMAL' });
                onClose();
            }, 2500);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${manrope.className}`}>

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0B1C33]/60 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                >

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                <Mail size={20} className="text-[#1170FF]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#0B1C33]">Email Support</h2>
                                <p className="text-xs text-slate-500">We usually respond within 24 hours.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* User Info (Read Only) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From</label>
                                        <p className="text-sm font-medium text-[#0B1C33] truncate">{userEmail}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ticket Type</label>
                                        <p className="text-sm font-medium text-[#0B1C33]">General Inquiry</p>
                                    </div>
                                </div>

                                {/* Priority Selection */}
                                <div>
                                    <label className="text-xs font-bold text-[#0B1C33] block mb-2">Priority Level</label>
                                    <div className="flex gap-2">
                                        {['NORMAL', 'HIGH', 'URGENT'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${formData.priority === p
                                                        ? 'bg-[#0B1C33] text-white border-[#0B1C33]'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject Line */}
                                <div>
                                    <label className="text-xs font-bold text-[#0B1C33] block mb-1.5">Subject</label>
                                    <div className="relative">
                                        <FileText size={18} className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Issue with recent transfer..."
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder-slate-400 text-[#0B1C33]"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div>
                                    <label className="text-xs font-bold text-[#0B1C33] block mb-1.5">Message</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Please describe your issue in detail..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1170FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder-slate-400 text-[#0B1C33] resize-none"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#1170FF] hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        'Sending Ticket...'
                                    ) : (
                                        <>Send Message <Send size={18} /></>
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                                    <AlertCircle size={12} /> Your query is encrypted and sent securely.
                                </p>

                            </form>
                        ) : (
                            /* Success State */
                            <div className="py-10 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                                    <CheckCircle size={40} className="text-[#12B76A]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0B1C33] mb-2">Message Sent!</h3>
                                <p className="text-sm text-slate-500 max-w-[80%] leading-relaxed">
                                    We have received your ticket. Our support team will review your request and get back to you at <strong>{userEmail}</strong> shortly.
                                </p>
                            </div>
                        )}
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}