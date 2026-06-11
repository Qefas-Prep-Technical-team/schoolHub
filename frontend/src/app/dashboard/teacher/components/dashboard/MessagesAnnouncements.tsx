'use client';

import { Mail, Megaphone, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  title: string;
  description: string;
  sender: string;
  isUnread: boolean;
  isAnnouncement: boolean;
}

interface MessagesAnnouncementsProps {
  messages?: Message[];
  onViewAll?: () => void;
}

export default function MessagesAnnouncements({ messages, onViewAll }: MessagesAnnouncementsProps) {
  const router = useRouter();

  return (
    <div className="p-8 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full flex flex-col transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Inbox <span className="text-emerald-600">&</span> Alerts
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">Communications Hub</p>
        </div>
        <button
          disabled
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50"
        >
          Locked
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
        <div className="relative mb-4">
          <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg shadow-emerald-500/30 animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Coming Soon</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
          The unified communications hub is currently under construction.
        </p>
      </div>

      {/* Compose Button */}
      <button disabled className="w-full mt-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl cursor-not-allowed opacity-50 flex items-center justify-center gap-3">
        <div className="p-1 rounded-md bg-slate-200 dark:bg-slate-700">
           <Mail className="w-3 h-3" />
        </div>
        Compose Message
      </button>
    </div>
  );
}
