'use client';

import { Rocket, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComingSoonWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  featureName?: string;
  backLink?: string;
}

export default function ComingSoonWrapper({ 
  children, 
  title, 
  description = "We're currently building something amazing for you. This feature will be available in the next major update.",
  featureName,
  backLink = "/dashboard/student"
}: ComingSoonWrapperProps) {
  const isComingSoon = process.env.NEXT_PUBLIC_SHOW_COMING_SOON === 'true';

  if (!isComingSoon) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 p-32 opacity-[0.03] pointer-events-none">
        <Rocket size={400} className="text-primary rotate-12" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 md:p-16 shadow-2xl relative z-10 text-center space-y-8"
      >
        <div className="h-24 w-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Rocket size={48} />
        </div>

        <div className="space-y-3 font-black">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500">In Development</span>
          </div>
          <h1 className="text-4xl md:text-5xl tracking-tighter text-slate-900 dark:text-white leading-tight">
            {featureName || title} <br />
            <span className="text-primary">is coming soon</span>
          </h1>
        </div>

        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-md mx-auto">
          {description}
        </p>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={backLink}>
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all w-full sm:w-auto">
              <ArrowLeft className="mr-2" size={16} /> Back to Dashboard
            </Button>
          </Link>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 w-full sm:w-auto">
            <Info className="mr-2" size={16} /> Notify Me
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            Internal Version 2.4.0-Alpha
          </p>
        </div>
      </motion.div>
    </div>
  );
}
