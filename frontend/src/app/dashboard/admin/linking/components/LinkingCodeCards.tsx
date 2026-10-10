import React from 'react';
import { ShieldCheck, Copy, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface LinkingCodeCardsProps {
  personalCode?: string;
  schoolCode?: string;
  onCopy: (text: string) => void;
}

export function LinkingCodeCards({ personalCode, schoolCode, onCopy }: LinkingCodeCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
      {/* Individual Code Card */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <div className="relative px-4 py-4 md:px-6 md:py-6 overflow-hidden">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Personal</h3>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Code</p>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-primary focus:outline-none">
                          <Info size={12} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                        Your secure, personal administrative linking code. Share this exclusively with staff members who need direct administrative permissions or oversight connections to your profile.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center min-w-[100px]">
                <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">
                  {personalCode || '...'}
                </span>
              </div>
              <Button 
                onClick={() => onCopy(personalCode || '')}
                size="icon"
                variant="outline"
                className="h-11 w-11 shrink-0 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border-slate-200 dark:border-slate-700"
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
          <div className="relative px-4 py-4 md:px-6 md:py-6 overflow-hidden">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                  <Link2 className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">School</h3>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Code</p>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                            <Info size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                          The public pairing code for your institution. Share this broadly with parents and students so they can correctly associate their personal accounts with your school network.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center min-w-[100px]">
                  <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">
                    {schoolCode}
                  </span>
                </div>
                <Button 
                  onClick={() => onCopy(schoolCode)}
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 shrink-0 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border-slate-200 dark:border-slate-700"
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

