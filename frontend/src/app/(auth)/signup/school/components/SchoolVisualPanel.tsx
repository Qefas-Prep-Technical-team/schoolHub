'use client';

import React from 'react';
import Image from 'next/image';
import { BLUE, BLUE_DARK } from './SchoolFormFields';

interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
}

interface TrustBadge {
  label: string;
  sublabel: string;
  icon: string;
}

interface SchoolVisualPanelProps {
  featureCards: FeatureCard[];
  trustBadges: TrustBadge[];
  activeFeature: number;
  onSelectFeature: (index: number) => void;
}

export default function SchoolVisualPanel({
  featureCards,
  trustBadges,
  activeFeature,
  onSelectFeature,
}: SchoolVisualPanelProps) {
  return (
    <div
      className="hidden lg:flex flex-col w-[44%] shrink-0 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)` }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: '#60a5fa' }}
      />
      <div
        className="absolute bottom-0 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: '#93c5fd' }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4">
        <div
          className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}
        >
          <span className="material-symbols-outlined text-[14px]">shield</span>
          For School Administrators
        </div>
        <div className="text-white/60 text-[12px]">Trusted across Africa</div>
      </div>

      {/* Hero image */}
      <div className="relative mx-6 rounded-2xl overflow-hidden flex-shrink-0" style={{ height: '320px' }}>
        <Image
          src="/images/3d_admin_blue.png"
          alt="School admin illustration"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, #0f172a 0%, transparent 60%)` }}
        />
        <div
          className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full px-4 py-2.5 backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse bg-blue-300" />
          <span className="text-white text-[13px] font-medium">All-in-one school workspace</span>
        </div>
      </div>

      {/* Feature rotating card */}
      <div className="relative z-10 mx-6 mt-5">
        <div
          className="rounded-2xl p-5 backdrop-blur-sm"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <span className="material-symbols-outlined text-[20px] text-white">
                {featureCards[activeFeature]?.icon}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-[15px] mb-1">
                {featureCards[activeFeature]?.title}
              </p>
              <p className="text-white/60 text-[13px] leading-relaxed">
                {featureCards[activeFeature]?.desc}
              </p>
            </div>
          </div>
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5 mt-4 justify-end">
            {featureCards.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectFeature(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeFeature ? '20px' : '6px',
                  height: '6px',
                  background: i === activeFeature ? '#93c5fd' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trust stats */}
      <div className="relative z-10 grid grid-cols-3 gap-3 mx-6 mt-5 mb-8">
        {trustBadges.map(b => (
          <div
            key={b.label}
            className="rounded-xl p-3.5 text-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <span className="material-symbols-outlined text-[18px] mb-1.5 block text-blue-300">
              {b.icon}
            </span>
            <p className="text-white font-bold text-[17px] leading-none">{b.label}</p>
            <p className="text-white/50 text-[11px] mt-0.5">{b.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
