"use client"
import React, { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle, GraduationCap, Users, BookOpen, Briefcase, Award, TrendingUp, Monitor, Mail, CreditCard, LayoutDashboard, CalendarCheck } from 'lucide-react';

const FeaturesPage: FC = () => {
    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0f1e] font-['Lexend'] text-slate-900 dark:text-white overflow-x-hidden pt-24">
            
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-purple-50 via-pink-50/30 to-white dark:from-[#0a0f1e] dark:via-indigo-950/20 dark:to-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto text-center relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-indigo-950 dark:text-white mb-6 tracking-tight"
                    >
                        Manage. Teach. <span className="text-indigo-600 dark:text-indigo-400">Excel.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-16"
                    >
                        Qefas Hub is your all-in-one platform to run your Nigerian school, track continuous assessments (CA), and achieve academic excellence.
                    </motion.p>
                    
                    <div className="relative max-w-4xl mx-auto mt-12">
                        {/* Main Image Container */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-2xl border border-indigo-100/50 dark:border-slate-800"
                        >
                            <div className="aspect-[16/9] rounded-[1.5rem] overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                                <Image 
                                    src="/image/Student Management.png" 
                                    alt="Qefas Hub Dashboard" 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                        
                        {/* Floating elements from the design */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -left-16 top-1/4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-indigo-50 dark:border-slate-700 max-w-[200px] hidden md:block"
                        >
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3">
                                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">"Qefas Hub helped our school go from manual WAEC prep to fully automated grading!"</p>
                            <p className="text-xs font-bold mt-2 text-slate-800 dark:text-slate-200">- Principal Adeyemi</p>
                            <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-2 flex items-center gap-1 hover:underline">
                                Explore more &rarr;
                            </Link>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -right-12 top-1/4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-indigo-50 dark:border-slate-700 hidden md:flex flex-col items-center"
                        >
                            <div className="flex -space-x-3 mb-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-200">
                                        <Image src={`/users/user ${i}.jpeg`} alt="user" width={32} height={32} className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-3xl font-black text-indigo-950 dark:text-white">50K+</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Active students</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">Trusted by schools<br/>across Nigeria</p>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 }}
                            className="absolute -top-6 right-12 bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                        >
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live Sync
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* --- PROCESS/WHY LOVE SECTION --- */}
            <section className="py-20 px-6 bg-[#fcf8ff] dark:bg-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto bg-white dark:bg-[#111827] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/5 p-10">
                    <h3 className="text-center font-bold text-lg text-indigo-950 dark:text-white mb-12 flex items-center justify-center gap-2">
                        Why Nigerian schools love Qefas Hub <span className="text-indigo-500 dark:text-indigo-400">&hearts;</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 md:flex md:flex-row justify-between items-start relative gap-x-4 gap-y-10 md:gap-4 max-w-5xl mx-auto">
                        {/* Connecting dashed line (desktop) */}
                        <div className="hidden md:block absolute top-8 left-10 right-10 h-[1px] border-t-2 border-dashed border-indigo-100 dark:border-slate-700 -z-10" />
                        
                        {[
                            { icon: Users, title: 'Enroll Students', desc: 'Easily admit students and track records.' },
                            { icon: PlayCircle, title: 'Manage Academics', desc: 'Automate CA, exams, and grading.' },
                            { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor performance term by term.' },
                            { icon: Award, title: 'Generate Reports', desc: 'Print standard report cards instantly.' },
                            { icon: CheckCircle, title: 'Achieve Excellence', desc: 'Boost your school\'s overall standards.' },
                        ].map((step, idx) => (
                            <div key={idx} className={`flex flex-col items-center text-center bg-white dark:bg-[#111827] z-10 ${idx === 4 ? 'col-span-2 md:col-span-1 mx-auto' : ''} md:max-w-[140px]`}>
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm border border-transparent dark:border-white/10">
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-sm text-indigo-950 dark:text-slate-100 mb-1">{step.title}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed px-2 md:px-0">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* --- SPLIT LAYOUT SECTION --- */}
            <section className="py-20 px-6 bg-white dark:bg-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative bg-indigo-50 dark:bg-[#111827] rounded-[2rem] p-8 aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center overflow-hidden border border-transparent dark:border-white/5">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:opacity-5" />
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <Image src="/image/Attendance Tracking.png" alt="Platform" width={500} height={400} className="object-cover" />
                        </motion.div>
                        <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-xl p-4 shadow-lg border border-transparent dark:border-slate-700">
                            <p className="text-xl font-black text-indigo-950 dark:text-white">2M+</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Attendance records</p>
                        </div>
                    </div>
                    
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">WHO WE ARE</p>
                        <h2 className="text-3xl md:text-5xl font-black text-indigo-950 dark:text-white leading-tight mb-6">
                            Empowering <span className="text-indigo-600 dark:text-indigo-400">schools</span> through smart management
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                            We believe every Nigerian institution deserves access to world-class management tools. Qefas Hub brings expert engineering, interactive dashboards, and practical knowledge to help you build a school that stands out.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-2xl font-black text-indigo-950 dark:text-white mb-1">500+</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Partner Schools</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-indigo-950 dark:text-white mb-1">100%</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">NDPR Compliant</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-indigo-950 dark:text-white mb-1">99%</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Satisfaction rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- CATEGORIES GRID --- */}
            <section className="py-20 px-6 bg-slate-50/50 dark:bg-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto">
                    <div className="flex justify-between items-end mb-10">
                        <h2 className="text-2xl font-bold text-indigo-950 dark:text-white">Popular Modules</h2>
                        <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline">
                            View all modules &rarr;
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: BookOpen, title: 'Academics', count: 'Exams & CA', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
                            { icon: LayoutDashboard, title: 'Management', count: 'Staff & Admin', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                            { icon: CreditCard, title: 'Finance', count: 'Fee Drives', color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
                            { icon: Mail, title: 'Communication', count: 'PTA & SMS', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
                            { icon: CalendarCheck, title: 'Attendance', count: 'Daily logs', color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
                            { icon: Monitor, title: 'CBT Portal', count: 'Online Mock', color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
                            { icon: Users, title: 'Student Portal', count: 'Results Access', color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
                            { icon: Briefcase, title: 'HR & Payroll', count: 'Staff records', color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
                        ].map((cat, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-100 dark:border-white/5 hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(37,99,235,0.1)] transition-shadow cursor-pointer flex flex-col items-center text-center group">
                                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-sm text-indigo-950 dark:text-slate-100 mb-1">{cat.title}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* --- SMARTER WAY SECTION --- */}
            <section className="py-20 px-6 bg-white dark:bg-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between border border-slate-100 dark:border-white/5 p-10 md:p-16 rounded-[2.5rem] shadow-sm bg-white dark:bg-[#111827] gap-12">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-black text-indigo-950 dark:text-white mb-8">
                            Manage in a <span className="text-indigo-600 dark:text-indigo-400">smarter</span> way
                        </h2>
                        <ul className="space-y-4">
                            {[
                                "Automated terminal report generation",
                                "One-click fee drive reminders",
                                "Dedicated parent mobile experience",
                                "Manage all operations on any device"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-1/2 relative flex justify-center">
                        <Image src="/image/Automated Reporting.png" alt="Devices" width={500} height={400} className="object-contain rounded-xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                    </div>
                </div>
            </section>
            
            {/* --- TESTIMONIALS --- */}
            <section className="py-20 px-6 bg-slate-50/50 dark:bg-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto">
                    <h3 className="text-center font-bold text-lg text-indigo-950 dark:text-white mb-12 flex items-center justify-center gap-2">
                        What our school admins say <span className="text-indigo-500 dark:text-indigo-400">&hearts;</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Oluwaseun A.', img: 1, text: "Qefas Hub has changed the way we manage. The fee tracking features are practical and easy to follow." },
                            { name: 'Chinedu O.', img: 2, text: "Great platform with amazing support. We got our entire staff trained in days thanks to their team!" },
                            { name: 'Amina B.', img: 3, text: "The best administrative experience we've had. Highly recommended for any Nigerian secondary school." }
                        ].map((review, i) => (
                            <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-slate-100 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <Image src={`/users/user ${review.img}.jpeg`} alt={review.name} width={48} height={48} className="rounded-full object-cover w-12 h-12" />
                                    <div>
                                        <h4 className="font-bold text-sm text-indigo-950 dark:text-slate-100">{review.name}</h4>
                                        <div className="flex gap-1 mt-1">
                                            {[1,2,3,4,5].map(star => <div key={star} className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-sm" />)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {review.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* --- FINAL CTA --- */}
            <section className="py-20 px-6 bg-white dark:bg-[#0a0f1e]">
                <div className="max-w-[1440px] mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="md:w-3/5 relative z-10 text-center md:text-left mb-10 md:mb-0">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 flex items-center justify-center md:justify-start gap-2">
                            Start your management journey today <span className="text-pink-300">&hearts;</span>
                        </h2>
                        <p className="text-indigo-100 mb-8 max-w-lg mx-auto md:mx-0">
                            Join thousands of schools across Nigeria and unlock your institution's full potential.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link href="/signup" className="px-8 py-4 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                Sign up for free &rarr;
                            </Link>
                            <Link href="/contact" className="px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2">
                                Explore features &rarr;
                            </Link>
                        </div>
                    </div>
                    
                    <div className="md:w-2/5 relative z-10 flex justify-center">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white/20 overflow-hidden relative">
                            <Image src="/users/user 4.jpeg" alt="Admin" fill className="object-cover" />
                        </div>
                    </div>
                </div>
            </section>
            
        </main>
    );
};

export default FeaturesPage;
