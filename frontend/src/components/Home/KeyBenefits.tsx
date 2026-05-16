"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, History, Landmark, Droplets, Eye, TrendingUp,
  BarChart2, Calendar, Shield, Bell, CalendarCheck, ClipboardList,
  MessageSquare, Settings, Bolt, WifiOff
} from 'lucide-react';

// ─── dashdesign01 "Lumina Finance" — KeyBenefits ─────────────────────────────
// This replaces the old KeyBenefits component.
// Section 1: Institutional Partners strip
// Section 2: Platform Highlights — 2-col with sub-feature cards + phone mockup
// ─────────────────────────────────────────────────────────────────────────────

const PhoneMockup = () => (
  <div className="relative w-[240px] mx-auto">
    {/* Glow */}
    <div className="absolute inset-0 bg-blue-200/50 rounded-[2rem] blur-2xl scale-90 -z-10" />
    {/* Phone frame */}
    <div className="bg-[#1a1a2b] rounded-[2rem] p-1.5 shadow-2xl shadow-slate-900/20">
      <div className="bg-slate-50 rounded-[1.6rem] overflow-hidden">
        {/* Status bar */}
        <div className="bg-white px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Good morning,</p>
            <p className="text-sm font-black text-slate-900">Prof. Anderson</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="px-3 pb-4 space-y-3">
          {/* Next class card */}
          <div className="bg-blue-600 p-4 rounded-2xl shadow-md shadow-blue-600/20 text-white">
            <p className="text-[8px] font-bold text-blue-100 uppercase mb-1">Next Class</p>
            <p className="font-black text-sm">Advanced Physics</p>
            <p className="text-[9px] text-blue-100/80">Room 402 · 10:30 AM</p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { Icon: CalendarCheck, label: 'Attendance', bg: 'bg-amber-50', color: 'text-amber-600' },
              { Icon: ClipboardList, label: 'Grading', bg: 'bg-blue-50', color: 'text-blue-600' },
            ].map(({ Icon, label, bg, color }) => (
              <div key={label} className="bg-white p-3 rounded-xl text-center shadow-sm border border-slate-100">
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <p className="text-[9px] font-bold text-slate-700">{label}</p>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Recent Messages</p>
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-1.5 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-around border border-slate-100 shadow-sm">
            <Bell className="w-4 h-4 text-blue-600" />
            <Calendar className="w-4 h-4 text-slate-300" />
            <MessageSquare className="w-4 h-4 text-slate-300" />
            <Settings className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const partners = [
  { Icon: History, name: 'ACADEMY' },
  { Icon: Landmark, name: 'POLYTECH' },
  { Icon: Droplets, name: 'EDUFLOW' },
  { Icon: Eye, name: 'LENSCO' },
  { Icon: TrendingUp, name: 'STRIVE' },
];

const featureCards = [
  {
    Icon: BarChart2,
    title: 'Live Grade Tracking',
    desc: 'Real-time academic analytics with subject-level breakdowns and automatic class rankings.',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    Icon: Calendar,
    title: 'Smart Timetable',
    desc: 'Conflict-free scheduling engine that auto-allocates classrooms, teachers, and time slots.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    Icon: Shield,
    title: 'Role-Based Access',
    desc: 'Granular permissions for every stakeholder in your institution.',
    badges: ['Admin', 'Teacher', 'Student', 'Parent'],
    accent: 'bg-emerald-50 text-emerald-600',
  },
];

const KeyBenefits = () => {
  return (
    <>
      {/* ── PARTNER STRIP ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#111827] border-y border-slate-100 dark:border-white/[0.05] py-10 px-6 overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">
            Institutional Partners
          </p>

          {/* Desktop */}
          <div className="hidden md:flex flex-wrap justify-center items-center gap-10 lg:gap-16">
            {partners.map(({ Icon, name }) => (
              <div
                key={name}
                className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 cursor-default group"
              >
                <Icon className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                {name}
              </div>
            ))}
          </div>

          {/* Mobile marquee */}
          <div className="flex md:hidden overflow-hidden">
            <motion.div
              animate={{ x: [0, -800] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-12 whitespace-nowrap"
            >
              {[...partners, ...partners, ...partners].map(({ Icon, name }, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Icon className="w-4 h-4 text-blue-300" /> {name}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM HIGHLIGHTS ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-[1280px] mx-auto">
          {/* Section heading */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-[#1a1a2b] tracking-tight leading-[1.12] mb-4"
              style={{ letterSpacing: '-0.02em' }}
            >
              Simplifying Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Institution&apos;s Journey
              </span>
            </motion.h2>
            <p className="text-[#45464c] dark:text-slate-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">
              We&apos;ve built a holistic ecosystem that addresses the intricate challenges of modern education,
              from classroom dynamics to complex administration.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: feature cards */}
            <div className="space-y-5">
              {featureCards.map(({ Icon, title, desc, badges, accent }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-[#111827]/60 rounded-2xl p-6 border border-slate-100 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(10,10,26,0.06)] dark:shadow-none hover:shadow-[0_8px_32px_rgba(10,10,26,0.10)] dark:hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1a1a2b] dark:text-white text-base mb-1">{title}</h3>
                      <p className="text-sm text-[#45464c] dark:text-slate-400 font-light leading-relaxed">{desc}</p>
                      {badges && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {badges.map((b) => (
                            <span key={b} className="px-3 py-1 bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-[#1a1a2b] dark:text-slate-300 text-xs font-semibold rounded-full">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="pt-2">
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all group"
                >
                  Explore all features <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex justify-center"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default KeyBenefits;
