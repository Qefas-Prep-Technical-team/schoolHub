import React from 'react';
import { ShieldCheck, Copy, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LinkingCodeCardsProps {
  personalCode?: string;
  schoolCode?: string;
  onCopy: (text: string) => void;
}

export function LinkingCodeCards({ personalCode, schoolCode, onCopy }: LinkingCodeCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Individual Code Card */}
      <div className="relative group overflow-hidden rounded-[2rem] bg-indigo-600 p-0.5 shadow-xl shadow-indigo-500/10 active:scale-[0.99] transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />
        <div className="relative rounded-[1.8rem] bg-indigo-600 px-6 py-6 overflow-hidden">
           <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
           <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/20 transform group-hover:rotate-6 transition-transform duration-500">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Personal</h3>
                <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest">Admin Code</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10 shadow-lg flex items-center justify-center min-w-[100px] group-hover:bg-white/15 transition-all">
                <span className="text-xl font-black tracking-widest text-white">
                  {personalCode || '...'}
                </span>
              </div>
              <Button 
                onClick={() => onCopy(personalCode || '')}
                size="icon"
                className="h-11 w-11 rounded-xl bg-white text-indigo-600 shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-white/95"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* School Code Card */}
      {schoolCode && (
        <div className="relative group overflow-hidden rounded-[2rem] bg-blue-600 p-0.5 shadow-xl shadow-blue-500/10 active:scale-[0.99] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="relative rounded-[1.8rem] bg-blue-600 px-6 py-6 overflow-hidden">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
             <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/20 transform group-hover:-rotate-6 transition-transform duration-500">
                  <Link2 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">School</h3>
                  <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">General Code</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10 shadow-lg flex items-center justify-center min-w-[100px] group-hover:bg-white/15 transition-all">
                  <span className="text-xl font-black tracking-widest text-white">
                    {schoolCode}
                  </span>
                </div>
                <Button 
                  onClick={() => onCopy(schoolCode)}
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-white text-blue-600 shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-white/95"
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
