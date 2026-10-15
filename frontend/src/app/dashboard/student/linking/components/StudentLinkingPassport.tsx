'use client';

import React from 'react';
import { motion } from 'framer-motion';
import QRCode from "react-qr-code";
import { Shield, Zap, Copy, Globe, ArrowUpRight, School } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { copyToClipboard } from '@/lib/utils/clipboard';

interface PassportProfile {
  name?: string;
  studentCode?: string;
  linkingCode?: string;
  profileImage?: string;
  school?: {
    name?: string;
  };
}

interface PassportUser {
  name?: string;
  studentCode?: string;
  profileImage?: string;
}

interface StudentLinkingPassportProps {
  profile: PassportProfile;
  user: PassportUser | null;
  totalActiveCount: number;
  classroomActiveCount: number;
  networkActiveCount: number;
  onConnectClick: () => void;
}

export function StudentLinkingPassport({
  profile,
  user,
  totalActiveCount,
  classroomActiveCount,
  networkActiveCount,
  onConnectClick
}: StudentLinkingPassportProps) {
  const displayName = profile?.name || user?.name || "Student Scholar";
  const studentIdCode = profile?.studentCode || user?.studentCode || "STU-VERIFIED";
  const linkingCode = profile?.linkingCode || "";
  const avatarUrl = profile?.profileImage || user?.profileImage;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
      {/* Main ID Passport Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2"
      >
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-pink-600 via-rose-500 to-rose-600 text-white shadow-xl shadow-pink-500/10 rounded-3xl sm:rounded-[2.25rem] min-h-[300px] sm:min-h-[320px] group flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          
          <CardContent className="relative p-5 sm:p-7 h-full flex flex-col justify-between z-10">
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-3 min-w-0">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/30 shadow-sm">
                  <Shield size={12} className="mr-1.5" /> Digital Student Passport
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight truncate">
                    {displayName}
                  </h2>
                  <p className="text-pink-100/90 text-xs sm:text-sm font-bold tracking-wide mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>ID:</span>
                    <span className="font-mono bg-white/15 px-2 py-0.5 rounded-md text-white font-black tracking-wider">
                      {studentIdCode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Avatar Photo */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center p-1 shadow-xl shrink-0 overflow-hidden">
                <Avatar className="h-full w-full rounded-xl">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />}
                  <AvatarFallback className="bg-white/20 text-white font-black text-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-6 sm:pt-8">
              {/* Linking Code Widget */}
              <div className="bg-black/20 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-2xl w-full sm:w-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-100/90 mb-1.5">
                  Personal Linking Code
                </p>
                <div className="flex items-center gap-3 justify-between sm:justify-start">
                  <span className="text-2xl sm:text-3xl font-black tracking-[0.18em] font-mono leading-none">
                    {linkingCode || "---"}
                  </span>
                  {linkingCode && (
                    <Button
                      onClick={() => copyToClipboard(linkingCode, "Linking code")}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white text-white hover:text-pink-600 transition-colors shrink-0 cursor-pointer"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Compact QR Code Container */}
              {linkingCode && (
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl flex flex-row sm:flex-col items-center gap-2 self-stretch sm:self-auto justify-center">
                  <div className="bg-white p-0.5 rounded-lg shrink-0">
                    <QRCode
                      value={linkingCode}
                      size={72}
                      level="H"
                      style={{ height: "auto", maxWidth: "100%", width: "72px" }}
                    />
                  </div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">
                    Scan to Link
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          
          {/* Subtle Ambient glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        </Card>
      </motion.div>

      {/* Quick Stats sidebar */}
      <div className="flex flex-col justify-between gap-4">
        <Card className="rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm flex flex-col items-center text-center justify-between flex-1">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-3">
              <Globe size={26} />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              {totalActiveCount}
            </p>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">
              Verified Connections
            </p>
          </div>

          <div className="w-full pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60">
              <p className="font-black text-base sm:text-lg text-purple-600 dark:text-purple-400">
                {classroomActiveCount}
              </p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Classrooms</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60">
              <p className="font-black text-base sm:text-lg text-pink-600 dark:text-pink-400">
                {networkActiveCount}
              </p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Peers & Staff</p>
            </div>
          </div>
        </Card>

        {/* Quick Action Button */}
        <div 
          onClick={onConnectClick}
          className="rounded-2xl p-4 sm:p-4.5 bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 text-white flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-all shadow-sm"
        >
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-pink-400">
              Quick Action
            </p>
            <p className="text-sm sm:text-base font-bold tracking-tight">
              Join Classroom / School
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-pink-600 transition-colors shrink-0">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>
    </section>
  );
}
