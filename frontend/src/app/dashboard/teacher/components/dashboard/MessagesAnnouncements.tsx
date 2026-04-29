import { Mail, Megaphone } from 'lucide-react';
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
  messages: Message[];
  onViewAll?: () => void;
}

export default function MessagesAnnouncements({ messages, onViewAll }: MessagesAnnouncementsProps) {
  const router = useRouter();
  return (
    <div className="p-8 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Inbox <span className="text-emerald-600">&</span> Alerts
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">Communications Hub</p>
        </div>
        <button
          onClick={() => onViewAll ? onViewAll() : router.push('/dashboard/teacher/notifications')}
          className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
        >
          Explore All
        </button>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
             <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3 opacity-50" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Recent Transmissions</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-[1.5rem] cursor-pointer transition-all duration-500 border border-transparent ${
                message.isAnnouncement
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 hover:border-emerald-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-100 dark:hover:border-slate-800'
              }`}
              onClick={() => router.push('/dashboard/teacher/notifications')}
            >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`mt-1 p-2.5 rounded-xl ${message.isAnnouncement ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {message.isAnnouncement ? (
                  <Megaphone className="w-3.5 h-3.5" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-black truncate tracking-tight ${
                    message.isAnnouncement
                      ? 'text-emerald-900 dark:text-emerald-400'
                      : message.isUnread
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {message.title}
                  </p>
                  {message.isUnread && (
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                  {message.description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic leading-none">
                    {message.isAnnouncement ? 'Institution Broadcast' : message.sender}
                  </p>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Compose Button */}
      <button className="w-full mt-auto py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
        <div className="p-1 rounded-md bg-white/20 dark:bg-slate-900/10">
           <Mail className="w-3 h-3" />
        </div>
        Launch Communication
      </button>
    </div>
  );
}
