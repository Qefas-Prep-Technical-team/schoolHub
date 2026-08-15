import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookOpen, Clock, CalendarDays } from 'lucide-react-native';

interface UpcomingExamsProps {
  activeChildId?: string;
}

function getCountdown(dateStr: string): { label: string; urgent: boolean } {
  const now = new Date();
  const exam = new Date(dateStr);
  const diffMs = exam.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Past', urgent: false };
  if (diffDays === 0) return { label: 'Today!', urgent: true };
  if (diffDays === 1) return { label: 'Tomorrow', urgent: true };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, urgent: true };
  return { label: `In ${diffDays} days`, urgent: false };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export const UpcomingExams = ({ activeChildId }: UpcomingExamsProps) => {
  const { data, isLoading } = useParentDashboard(activeChildId);
  const isDark = useColorScheme() === 'dark';

  const exams = data?.upcomingExams?.slice(0, 3) ?? [];

  return (
    <View className="mb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-LexendBold text-slate-800 dark:text-white uppercase tracking-tight">
            Upcoming Exams
          </Text>
          <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mt-0.5">
            Scheduled assessments
          </Text>
        </View>
        <View className="bg-orange-500/10 px-3 py-1 rounded-full">
          <Text className="text-[11px] font-LexendBold text-orange-500">
            {exams.length} scheduled
          </Text>
        </View>
      </View>

      {isLoading ? (
        /* Skeleton */
        [0, 1, 2].map((i) => (
          <View
            key={i}
            className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl h-20 mb-3 opacity-60"
          />
        ))
      ) : exams.length === 0 ? (
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 items-center shadow-sm border border-slate-100 dark:border-slate-700">
          <CalendarDays size={32} color={isDark ? '#475569' : '#94a3b8'} />
          <Text className="text-sm font-LexendBold text-slate-400 dark:text-slate-500 mt-3 text-center">
            No upcoming exams scheduled
          </Text>
          <Text className="text-xs font-Lexend text-slate-300 dark:text-slate-600 mt-1 text-center">
            Check back closer to exam season
          </Text>
        </View>
      ) : (
        exams.map((exam, idx) => {
          const countdown = getCountdown(exam.startDate);
          const categoryColors: Record<string, string> = {
            UTME: '#7c3aed',
            'MID-TERM': '#0284c7',
            'END-OF-TERM': '#dc2626',
            CA: '#059669',
          };
          const catColor = categoryColors[exam.category] ?? '#64748b';
          const catBg = isDark ? `${catColor}25` : `${catColor}15`;

          return (
            <View
              key={exam.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 mb-3 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <View className="flex-row items-center">
                {/* Icon */}
                <View
                  className="h-12 w-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: catBg }}
                >
                  <BookOpen size={22} color={catColor} />
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text
                    className="text-sm font-LexendBold text-slate-800 dark:text-slate-100 mb-0.5"
                    numberOfLines={1}
                  >
                    {exam.title}
                  </Text>
                  <View className="flex-row items-center gap-2 flex-wrap">
                    {exam.subject?.name && (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: catBg }}
                      >
                        <Text
                          className="text-[9px] font-LexendBold uppercase tracking-wide"
                          style={{ color: catColor }}
                        >
                          {exam.subject.name}
                        </Text>
                      </View>
                    )}
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: catBg }}
                    >
                      <Text
                        className="text-[9px] font-LexendBold uppercase tracking-wide"
                        style={{ color: catColor }}
                      >
                        {exam.category}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-1.5 gap-3">
                    <View className="flex-row items-center gap-1">
                      <CalendarDays size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                      <Text className="text-[10px] font-Lexend text-slate-400 dark:text-slate-500">
                        {formatDate(exam.startDate)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Clock size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                      <Text className="text-[10px] font-Lexend text-slate-400 dark:text-slate-500">
                        {formatTime(exam.startDate)}
                        {exam.durationMinutes ? ` · ${exam.durationMinutes}min` : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Countdown Badge */}
                <View
                  className="ml-2 px-2.5 py-1.5 rounded-2xl"
                  style={{
                    backgroundColor: countdown.urgent
                      ? isDark ? '#fef3c720' : '#fef3c7'
                      : isDark ? '#1e293b' : '#f1f5f9',
                  }}
                >
                  <Text
                    className="text-[10px] font-LexendBold text-center"
                    style={{ color: countdown.urgent ? '#d97706' : isDark ? '#64748b' : '#94a3b8' }}
                  >
                    {countdown.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};
