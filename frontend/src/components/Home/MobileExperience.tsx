"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bolt, WifiOff, Bell } from 'lucide-react';

// ─── dashdesign01 "Lumina Finance" — MobileExperience ────────────────────────
// Adapted from the fintech "Achieve Your Financial Goals with Confidence" section.
// Left: phone + watch device mockup with live cards
// Right: headline, body text, CTA, feature cards (notification card + toggle card)
// ─────────────────────────────────────────────────────────────────────────────

const DeviceMockup = () => (
  <div className="relative w-full max-w-[280px] mx-auto">
    {/* Blue glow */}
    <div className="absolute inset-0 bg-blue-200/40 rounded-[3rem] blur-3xl scale-90 -z-10" />

    {/* Watch (top-right) */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute -top-4 -right-8 w-[80px] bg-[#1a1a2b] rounded-2xl p-1 shadow-xl z-10"
    >
      <div className="bg-[#0f1929] rounded-xl p-2 text-center">
        <p className="text-[6px] text-slate-400 uppercase tracking-wider mb-1">Next Class</p>
        <p className="text-[8px] font-black text-white leading-tight">Physics</p>
        <p className="text-[6px] text-blue-400 mt-0.5">10:30 AM</p>
        <div className="mt-2 h-0.5 bg-blue-500 rounded-full w-3/4 mx-auto" />
      </div>
    </motion.div>

    {/* Phone */}
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="bg-[#1a1a2b] rounded-[2.5rem] p-1.5 shadow-2xl shadow-slate-900/20"
    >
      <div className="bg-slate-50 rounded-[2rem] overflow-hidden">
        {/* Header */}
        <div className="bg-white px-4 py-4">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Your Schedule</p>
          <p className="font-black text-[#1a1a2b] text-sm mt-0.5">Manage Everything</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 px-3 pt-2 pb-3">
          {[
            { label: 'Teachers Online', value: '89', color: 'text-emerald-600', dot: true },
            { label: 'Classes Today', value: '12', color: 'text-blue-600', dot: false },
          ].map(({ label, value, color, dot }) => (
            <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <div className="flex items-center gap-1 mb-1">
                {dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                <p className="text-[7px] text-slate-400 font-medium">{label}</p>
              </div>
              <p className={`text-base font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Today's schedule */}
        <div className="px-3 pb-4 space-y-2">
          {['JSS2 Mathematics', 'SS3 Physics', 'SS1 English'].map((cls, i) => (
            <div key={cls} className="bg-white rounded-xl px-3 py-2.5 flex items-center gap-3 shadow-sm border border-slate-100">
              <div className={`w-2 h-2 rounded-full shrink-0 ${['bg-blue-500', 'bg-amber-500', 'bg-emerald-500'][i]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-[#1a1a2b] truncate">{cls}</p>
                <p className="text-[7px] text-slate-400">{['8:00 AM', '10:30 AM', '1:00 PM'][i]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>

    {/* "$89 Teachers" floating card */}
    <motion.div
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      className="absolute -bottom-4 -left-8 bg-white rounded-2xl px-4 py-3 shadow-lg border border-slate-100 flex items-center gap-2 z-10 min-w-[120px]"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <div>
        <p className="text-[9px] font-black text-[#1a1a2b]">89 Online</p>
        <p className="text-[7px] text-slate-400">Teachers active</p>
      </div>
    </motion.div>
  </div>
);

const MobileExperience = () => {
  return (
    <section className="py-24 px-6 bg-[#F5F5FF] dark:bg-[#0a0f1e]">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── LEFT: Device mockup ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex justify-center order-2 lg:order-1 py-8"
        >
          <DeviceMockup />
        </motion.div>

        {/* ── RIGHT: Text & feature cards ─────────────────────── */}
        <div className="order-1 lg:order-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-[#1a1a2b] dark:text-white tracking-tight leading-[1.1] mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Run your school{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              from anywhere
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#45464c] dark:text-slate-400 text-base md:text-lg font-light leading-relaxed mb-8"
          >
            Administrators, teachers, and parents all connected in one place. Get live updates,
            manage schedules, and stay on top of every aspect of your institution — from any device.
          </motion.p>

          {/* Feature points */}
          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-5 mb-8"
          >
            {[
              { Icon: Bolt, title: 'Instant Notifications', desc: 'Push alerts for new grades, absent students, upcoming exams, and school announcements — delivered the moment they happen.' },
              { Icon: WifiOff, title: 'Works Offline Too', desc: 'Losing internet doesn\'t stop your school. Core features sync in the background and update when you\'re back online.' },
            ].map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300 shadow-sm shrink-0">
                  <Icon className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-[#1a1a2b] dark:text-white mb-0.5">{title}</p>
                  <p className="text-[#45464c] dark:text-slate-400 text-sm font-light leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </motion.ul>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/signup">
              <button className="px-8 py-4 bg-[#111827] text-white font-semibold rounded-full hover:bg-[#1f2937] hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-slate-900/20 mb-8">
                Get Started →
              </button>
            </Link>
          </motion.div>

          {/* Feature mini-cards */}
          <div className="space-y-3">
            {/* 89 Teachers Online card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-[#111827]/60 rounded-2xl p-4 border border-slate-100 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(10,10,26,0.06)] dark:shadow-none flex items-center gap-4"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-[#1a1a2b] dark:text-white text-sm">89 Teachers Online</p>
                <p className="text-[#45464c] dark:text-slate-400 text-xs font-light">Active right now across all departments</p>
              </div>
            </motion.div>

            {/* Instant Notifications toggle card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#111827]/60 rounded-2xl p-4 border border-slate-100 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(10,10,26,0.06)] dark:shadow-none flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-[#1a1a2b] dark:text-white text-sm">Instant Notifications</p>
                <p className="text-[#45464c] dark:text-slate-400 text-xs font-light">Get alerts for grades, attendance, and events</p>
              </div>
              {/* Toggle (visual only) */}
              <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1 shrink-0 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
              </div>
            </motion.div>
          </div>

          {/* Additional CTA */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[#1a1a2b] dark:text-white font-semibold rounded-full hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group text-sm shadow-sm"
            >
              Explore all features
              <span className="group-hover:translate-x-1 transition-transform inline-block">&rarr;</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all text-sm shadow-md shadow-blue-600/20"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileExperience;
