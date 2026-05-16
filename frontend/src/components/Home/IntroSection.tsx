"use client"
import React, { FC } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, PlayCircle, Star, BarChart2, Bell, CalendarCheck, ClipboardList, MessageSquare } from 'lucide-react';

// ─── dashdesign01 "Lumina Finance" Design System Applied ───────────────────
// Background : #EEF2FF → #F8FAFC  (soft lavender-white gradient)
// Headings   : #1a1a2b  (near-black)
// Body text  : #45464c  (medium gray)
// CTA primary: #111827  (dark navy pill button)
// Cards      : #ffffff  shadow: 0 4px 20px rgba(10,10,26,0.06)
// ─────────────────────────────────────────────────────────────────────────────

const DashboardMockup: FC = () => (
  <div className="relative w-full max-w-lg mx-auto">
    {/* Floating glow behind tablet */}
    <div className="absolute inset-0 bg-blue-200/40 rounded-[2.5rem] blur-3xl -z-10 scale-95" />

    {/* Tablet frame */}
    <div className="relative bg-[#1a1a2b] rounded-[2rem] p-2 shadow-2xl shadow-slate-900/20">
      <div className="bg-[#F8FAFC] rounded-[1.5rem] overflow-hidden">
        {/* Dashboard header */}
        <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <span className="text-[#1a1a2b] font-bold text-sm">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
              <Bell className="w-3 h-3 text-slate-400" />
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">A</div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-4 gap-2 p-4">
          {[
            { label: 'Students', value: '1,240', color: 'bg-blue-50 text-blue-600' },
            { label: 'Teachers', value: '89', color: 'bg-amber-50 text-amber-600' },
            { label: 'Classes', value: '42', color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Exams', value: '7', color: 'bg-purple-50 text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] text-slate-400 font-medium mb-1">{s.label}</p>
              <p className={`text-sm font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Bar chart area */}
        <div className="px-4 pb-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 mb-3">Weekly Attendance</p>
            <div className="flex items-end gap-1.5 h-14">
              {[65, 80, 55, 90, 75, 85, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-blue-500"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[7px] text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 mb-2">Recent Activity</p>
            <div className="space-y-2">
              {[
                { icon: ClipboardList, text: 'Grade submitted for JSS2 Maths', color: 'text-blue-500' },
                { icon: CheckCircle, text: 'New student enrolled', color: 'text-emerald-500' },
                { icon: CalendarCheck, text: 'Exam scheduled: SS3 Physics', color: 'text-amber-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className={`w-3 h-3 shrink-0 ${item.color}`} />
                  <p className="text-[9px] text-slate-600 truncate">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const IntroSection: FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#EEF2FF] dark:bg-[#0a0f1e]" style={{ background: undefined }}>
      {/* Subtle background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/60 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* ── LEFT: Hero Text ───────────────────────────────────── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-8"
            >
              <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              The Gold Standard in EdTech
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-[#1a1a2b] dark:text-white mb-6"
              style={{ letterSpacing: '-0.02em' }}
            >
              Education management,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                reimagined.
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-[#45464c] dark:text-slate-400 leading-relaxed mb-10 max-w-xl font-light"
            >
              One unified platform to power your entire institution.{' '}
              Streamline every workflow from admissions to graduation with{' '}
              <strong className="text-[#1a1a2b] font-semibold">Qefas Hub.</strong>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto px-8 py-4 bg-[#111827] dark:bg-white dark:text-[#111827] text-white text-base font-semibold rounded-full hover:bg-[#1f2937] dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-slate-900/20 dark:shadow-white/10 flex items-center justify-center gap-2"
                >
                  Start Your Journey →
                </button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-white/5 dark:border-white/10 border border-slate-200 text-[#1a1a2b] dark:text-white text-base font-semibold rounded-full hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                  Request a Demo
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 inline-flex items-center gap-4 bg-white/70 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl px-5 py-3 shadow-sm shadow-slate-200/50 dark:shadow-black/20"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <NextImage
                      src={`https://i.pravatar.cc/36?u=qefas${i}`}
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-amber-400 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-xs text-[#45464c] dark:text-slate-400 font-medium">Trusted by 500+ institutions</p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Dashboard mockup ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="order-1 lg:order-2"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/60 dark:from-[#0a0f1e]/80 to-transparent pointer-events-none" />
    </section>
  );
};

export default IntroSection;
