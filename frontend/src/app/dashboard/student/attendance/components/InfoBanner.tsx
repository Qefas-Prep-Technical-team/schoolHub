'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const InfoBanner: React.FC = () => {
    const [showPolicy, setShowPolicy] = useState(false);

    return (
        <>
            <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-transparent border border-pink-200/60 dark:border-pink-500/20 p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Academic Attendance Standing & Compliance
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Maintaining 75%+ verified attendance is required for examination seating and honors standing.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowPolicy(true)}
                    className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors shrink-0 px-2.5 py-1 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-500/10"
                >
                    <span>Policy Details</span>
                    <ChevronRight size={14} />
                </button>
            </div>

            <Dialog open={showPolicy} onOpenChange={setShowPolicy}>
                <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <ShieldCheck className="text-pink-600 dark:text-pink-400" size={20} />
                            Attendance Policy & Eligibility
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">75% Threshold Rule</p>
                            <p className="text-xs">
                                All scholars must maintain at least a 75% presence rate in every enrolled course to sit for official term examinations.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">Excused vs Unexcused Absences</p>
                            <p className="text-xs">
                                Absences accompanied by verified parental or medical documentation are recorded as Excused and do not penalize promotion candidacy.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">Tardiness Impact</p>
                            <p className="text-xs">
                                Three consecutive unexcused late arrivals are categorized as one unexcused absence in administrative term audits.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <Button
                            onClick={() => setShowPolicy(false)}
                            className="h-9 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-sm"
                        >
                            Got It
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InfoBanner;

