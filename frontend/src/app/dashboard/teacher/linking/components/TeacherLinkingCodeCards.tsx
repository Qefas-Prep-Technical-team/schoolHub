import React from 'react';
import { ShieldCheck, Copy, School } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TeacherLinkingCodeCardsProps {
  personalCode?: string;
  schoolCode?: string;
  onCopy: (text: string) => void;
  isPersonal: boolean;
}

export function TeacherLinkingCodeCards({ personalCode, schoolCode, onCopy, isPersonal }: TeacherLinkingCodeCardsProps) {
  return (
    <div className={`grid grid-cols-1 ${isPersonal || !schoolCode ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-6 pb-2`}>
      {/* Individual Code Card */}
      {isPersonal && (
        <div className="relative group overflow-hidden rounded-[2rem] bg-primary p-0.5 shadow-xl shadow-primary/10 active:scale-[0.99] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="relative rounded-[1.8rem] bg-primary px-6 py-8 overflow-hidden text-center">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-white/20 transform group-hover:rotate-6 transition-transform duration-500">
                  <ShieldCheck className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Teacher Code</h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Personal Account</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/10 shadow-lg flex items-center justify-center min-w-[150px] group-hover:bg-white/15 transition-all">
                  <span className="text-3xl font-black tracking-widest text-white">
                    {personalCode || '...'}
                  </span>
                </div>
                <Button 
                  onClick={() => onCopy(personalCode || '')}
                  size="icon"
                  className="h-12 w-12 rounded-2xl bg-white text-primary shadow-lg hover:scale-110 active:scale-95 transition-all hover:bg-white/95"
                >
                  <Copy size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* School Code Card */}
      {!isPersonal && schoolCode && (
        <div className="relative group overflow-hidden rounded-[2rem] bg-indigo-600 p-0.5 shadow-xl shadow-indigo-500/10 active:scale-[0.99] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="relative rounded-[1.8rem] bg-indigo-600 px-6 py-8 overflow-hidden">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-white/20 transform group-hover:-rotate-6 transition-transform duration-500">
                  <School className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Selected School</h3>
                  <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest">Active Context</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/10 shadow-lg flex items-center justify-center min-w-[150px] group-hover:bg-white/15 transition-all">
                  <span className="text-3xl font-black tracking-widest text-white">
                    {schoolCode}
                  </span>
                </div>
                <Button 
                  onClick={() => onCopy(schoolCode)}
                  size="icon"
                  className="h-12 w-12 rounded-2xl bg-white text-indigo-600 shadow-lg hover:scale-110 active:scale-95 transition-all hover:bg-white/95"
                >
                  <Copy size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
