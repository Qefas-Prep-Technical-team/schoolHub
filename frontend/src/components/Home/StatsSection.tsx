"use client"
import React from 'react';
import { motion } from 'framer-motion';

// ─── dashdesign01 "Lumina Finance" — Stats Section ────────────────────────────
// Dark navy band (#0f1929) equivalent to the financial "stats bar"
// Bold display numerals, gray subtext, 3-column centered layout
// ─────────────────────────────────────────────────────────────────────────────

const stats = [
  {
    value: '500+',
    label: 'Institutions Onboarded',
    desc: 'Schools, polytechnics, and academies across Nigeria and beyond.',
  },
  {
    value: '50K+',
    label: 'Active Students',
    desc: 'Learners accessing world-class education management every day.',
  },
  {
    value: '98%',
    label: 'Satisfaction Rate',
    desc: 'Institutions that renew year-over-year — because it just works.',
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #0f1929 0%, #0a0f1e 100%)' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
          {stats.map(({ value, label, desc }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              className="flex flex-col items-center"
            >
              {/* Divider for desktop — only between columns */}
              <div className="w-px h-0 md:hidden" />

              <p
                className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                {value}
              </p>
              <p className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-[0.1em]">
                {label}
              </p>
              <p className="text-[#76777d] text-sm font-light leading-relaxed max-w-[200px]">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
