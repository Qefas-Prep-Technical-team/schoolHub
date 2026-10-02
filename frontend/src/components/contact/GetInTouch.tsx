"use client";

import React, { FC, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { getWeb3FormsKey } from '@/app/actions/contact';

const GetInTouch: FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { success, error } = useToast();

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        setIsSubmitting(true);
        
        try {
            const formData = new FormData(form);
            const accessKey = await getWeb3FormsKey();
            
            if (!accessKey) {
                error.show("Server misconfiguration: Missing API key");
                setIsSubmitting(false);
                return;
            }
            
            formData.append("access_key", accessKey);

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                success.show("Message sent successfully!");
                form.reset();
            } else {
                error.show(data.message || "Failed to send message.");
            }
        } catch (err) {
            error.show("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="pt-24 pb-16 bg-[#FAFAFA] dark:bg-slate-950 transition-colors font-['Inter',sans-serif] w-full">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 mb-8 shadow-sm transition-colors">
                            Contact Qefas
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-medium tracking-tight text-black dark:text-white leading-none transition-colors">
                            Contact Us
                        </h1>
                    </div>
                    <div className="md:max-w-xs md:text-right">
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed transition-colors">
                            Tell us when and where you'd like to implement our system and we'll confirm availability within 24 hours.
                        </p>
                    </div>
                </div>

                {/* Form and Image Section */}
                <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-24">
                    {/* Form */}
                    <form onSubmit={onSubmit} className="flex flex-col justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="name">Name</label>
                                <input id="name" name="name" type="text" placeholder="Your full name" required 
                                    className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="email">Email</label>
                                <input id="email" name="email" type="email" placeholder="you@example.com" required 
                                    className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="phone">Phone Number</label>
                                <input id="phone" name="phone" type="tel" placeholder="+234 800 000 0000" 
                                    className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="subject">Select Subject</label>
                                <select id="subject" name="subject" defaultValue=""
                                    className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none transition-colors">
                                    <option value="" disabled>Choose your topic...</option>
                                    <option value="Demo Request">Demo Request</option>
                                    <option value="Pricing Inquiry">Pricing Inquiry</option>
                                    <option value="Support">Technical Support</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="date">Preferred Date</label>
                                <input id="date" name="date" type="date" 
                                    className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="students">Number of Students</label>
                                <input id="students" name="students" type="text" placeholder="e.g. 500+" 
                                    className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 transition-colors" />
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400" htmlFor="message">Message / Special Requests</label>
                            <textarea id="message" name="message" rows={5} placeholder="Anything else we should know?" required 
                                className="w-full bg-[#F3F3F3] dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 resize-none transition-colors"></textarea>
                        </div>

                        <div className="mt-10 flex items-center gap-4">
                            <button type="submit" disabled={isSubmitting} 
                                className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full px-8 py-3.5 text-sm font-semibold transition-colors disabled:opacity-70 flex items-center gap-2">
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Submit Request"}
                            </button>
                            <button type="button" className="w-12 h-12 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-lg transform -rotate-45">arrow_forward</span>
                            </button>
                        </div>
                    </form>

                    {/* Image */}
                    <div className="relative rounded-[2rem] overflow-hidden h-[300px] sm:h-[400px] lg:h-[600px] shadow-sm">
                        <img src="/about/classroom 1.jpeg" alt="Qefas Hub Dashboard" className="w-full h-full object-cover" />
                        <div className="absolute top-6 right-6">
                            <span className="bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-6 py-2 rounded-full">
                                Your Journey
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center pt-8 border-t border-gray-200 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center mb-6 text-gray-700 dark:text-gray-300 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">call</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm transition-colors">Call & WhatsApp</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">+234 816 524 6864</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">+234 800 000 0000</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center mb-6 text-gray-700 dark:text-gray-300 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">schedule</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm transition-colors">Working Hours</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">Daily: 8am-5pm</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">Sunday: Closed</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center mb-6 text-gray-700 dark:text-gray-300 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm transition-colors">Write to Us</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">support@qefashub.com</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">sales@qefashub.com</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default GetInTouch;
