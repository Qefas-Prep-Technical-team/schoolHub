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
    <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Inbox & Notifications
        </h2>
        <button
          onClick={() => onViewAll ? onViewAll() : router.push('/dashboard/teacher/notifications')}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent alerts</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                message.isAnnouncement
                  ? 'bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900/40'
              }`}
              onClick={() => router.push('/dashboard/teacher/notifications')}
            >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`mt-1 ${message.isAnnouncement ? 'text-primary' : 'text-gray-400'}`}>
                {message.isAnnouncement ? (
                  <Megaphone className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-medium ${
                    message.isAnnouncement
                      ? 'text-primary'
                      : message.isUnread
                      ? 'text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {message.title}
                  </p>
                  {message.isUnread && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {message.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {message.isAnnouncement ? 'School Announcement' : `From: ${message.sender}`}
                </p>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Compose Button */}
      <button className="w-full mt-6 py-2.5 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" />
        Compose New Message
      </button>
    </div>
  );
}