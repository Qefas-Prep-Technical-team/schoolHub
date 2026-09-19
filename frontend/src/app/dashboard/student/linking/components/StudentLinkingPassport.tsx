import React from 'react';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import QRCode from "react-qr-code";
import { Shield, Zap, Copy, Globe, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from '@/lib/utils/clipboard';

interface StudentLinkingPassportProps {
  profile: any;
  user: any;
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
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Main ID Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2"
      >
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400 text-white shadow-2xl rounded-[2.5rem] min-h-[320px] group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          
          <CardContent className="relative p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/30 shadow-sm">
                  <Shield size={12} className="mr-2" /> Digital Student Passport
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-1">{profile.name || user?.name}</h2>
                  <p className="text-pink-100/80 font-bold tracking-wide flex items-center gap-2">
                     Student ID: <span className="text-white font-black">{profile.studentCode || user?.studentCode || "---"}</span>
                  </p>
                </div>
              </div>
              <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center p-1.5 shadow-2xl relative group-hover:rotate-3 transition-transform overflow-hidden">
                 {profile.profileImage || user?.profileImage ? (
                    <NextImage 
                      src={profile.profileImage || user?.profileImage} 
                      alt={profile.name || user?.name || "Profile Image"} 
                      fill
                      className="object-cover rounded-xl"
                    />
                 ) : (
                    <Zap size={40} className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
                 )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end justify-between gap-6 pt-8">
              <div className="flex flex-col gap-4 w-full sm:w-auto">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl inline-block group-hover:bg-white/20 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-100/80 mb-2">Personal Linking Code</p>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black tracking-[0.2em] font-mono leading-none">{profile.linkingCode || "---"}</span>
                    <Button
                      onClick={() => copyToClipboard(profile.linkingCode, "Linking code")}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white text-white hover:text-pink-600 transition-colors"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                <div className="bg-white p-1 rounded-lg">
                  {profile.linkingCode ? (
                    <QRCode
                      value={profile.linkingCode}
                      size={100}
                      level="H"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  ) : (
                    <div className="w-[100px] h-[100px] bg-slate-100 animate-pulse rounded-lg" />
                  )}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Scan to connect</span>
              </div>
            </div>
          </CardContent>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        </Card>
      </motion.div>

      {/* Quick Stats sidebar */}
      <div className="space-y-6">
        <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] p-8 flex flex-col items-center text-center space-y-4 hover:shadow-2xl transition-all border-b-4 border-pink-500">
           <div className="h-16 w-16 bg-pink-50 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 mb-2">
             <Globe size={32} />
           </div>
           <div>
             <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{totalActiveCount}</p>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Verified Connections</p>
           </div>
           <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="font-black text-lg text-purple-600">{classroomActiveCount}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Classroom</p>
              </div>
              <div className="text-right border-l dark:border-slate-800 pl-4">
                <p className="font-black text-lg text-pink-600">{networkActiveCount}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Network</p>
              </div>
           </div>
        </Card>

        <div className="bg-slate-900 dark:bg-pink-600 rounded-[2rem] p-6 text-white flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all shadow-xl shadow-pink-200/20"
             onClick={onConnectClick}>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-200/60 dark:text-pink-200/80">New Action</p>
            <p className="text-lg font-extrabold tracking-tight">Join a Class</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </div>
    </section>
  );
}
