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
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <div className="relative px-6 py-6 overflow-hidden">
           <div className="flex items-center justify-between gap-4 relative z-10 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Personal</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Code</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center min-w-[100px]">
                <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">
                  {personalCode || '...'}
                </span>
              </div>
              <Button 
                onClick={() => onCopy(personalCode || '')}
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border-slate-200 dark:border-slate-700"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* School Code Card */}
      {schoolCode && (
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
          <div className="relative px-6 py-6 overflow-hidden">
             <div className="flex items-center justify-between gap-4 relative z-10 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Link2 className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">School</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Code</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center min-w-[100px]">
                  <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">
                    {schoolCode}
                  </span>
                </div>
                <Button 
                  onClick={() => onCopy(schoolCode)}
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border-slate-200 dark:border-slate-700"
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

