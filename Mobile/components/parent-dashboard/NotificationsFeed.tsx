import React from 'react';
import { View, Text } from 'react-native';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Bell, CheckCircle, Info, AlertTriangle, Megaphone } from 'lucide-react-native';

interface NotificationsFeedProps {
  activeChildId?: string;
}

const TYPE_CONFIG: Record<string, { color: string; darkColor: string; bg: string; darkBg: string; Icon: React.ComponentType<{ size: number; color: string }> }> = {
  GENERAL:  { color: '#2563eb', darkColor: '#60a5fa', bg: '#eff6ff', darkBg: '#1e3a5f', Icon: Info },
  WARNING:  { color: '#d97706', darkColor: '#fbbf24', bg: '#fffbeb', darkBg: '#451a03', Icon: AlertTriangle },
  SUCCESS:  { color: '#059669', darkColor: '#34d399', bg: '#ecfdf5', darkBg: '#064e3b', Icon: CheckCircle },
  ALERT:    { color: '#dc2626', darkColor: '#f87171', bg: '#fef2f2', darkBg: '#450a0a', Icon: AlertTriangle },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const NotificationsFeed = ({ activeChildId }: NotificationsFeedProps) => {
  const { data, isLoading } = useParentDashboard(activeChildId);
  const isDark = useColorScheme() === 'dark';

  const notifications = data?.notifications?.slice(0, 5) ?? [];
  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <View className="mb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-LexendBold text-slate-800 dark:text-white uppercase tracking-tight">
            School Notifications
          </Text>
          <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mt-0.5">
            Latest updates
          </Text>
        </View>
        {unreadCount > 0 && (
          <View className="bg-red-500 px-2.5 py-1 rounded-full">
            <Text className="text-[11px] font-LexendBold text-white">
              {unreadCount} unread
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        [0, 1, 2].map((i) => (
          <View
            key={i}
            className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl h-20 mb-3 opacity-60"
          />
        ))
      ) : notifications.length === 0 ? (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 items-center shadow-sm border border-slate-100 dark:border-slate-700">
          <Megaphone size={32} color={isDark ? '#475569' : '#94a3b8'} />
          <Text className="text-sm font-LexendBold text-slate-400 dark:text-slate-500 mt-3">
            No notifications yet
          </Text>
        </View>
      ) : (
        notifications.map((notif) => {
          const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG['GENERAL'];
          const Icon = cfg.Icon;
          const isUnread = notif.status === 'UNREAD';
          return (
            <View
              key={notif.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 mb-3 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <View className="flex-row items-start gap-3">
                {/* Icon */}
                <View
                  className="h-10 w-10 rounded-2xl items-center justify-center mt-0.5"
                  style={{ backgroundColor: isDark ? cfg.darkBg : cfg.bg }}
                >
                  <Icon size={18} color={isDark ? cfg.darkColor : cfg.color} />
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text
                      className="text-sm font-LexendBold text-slate-800 dark:text-slate-100 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    <Text className="text-[9px] font-Lexend text-slate-400">
                      {timeAgo(notif.createdAt)}
                    </Text>
                  </View>
                  <Text
                    className="text-[11px] font-Lexend text-slate-500 dark:text-slate-400 leading-snug"
                    numberOfLines={2}
                  >
                    {notif.message}
                  </Text>
                </View>

                {/* Unread dot */}
                {isUnread && (
                  <View className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};
