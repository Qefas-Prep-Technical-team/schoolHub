import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trophy, FileText } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AcademicHistoryProps {
  attempts: any[];
}

export function AcademicHistory({ attempts }: AcademicHistoryProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!attempts || attempts.length === 0) {
    return null;
  }

  // Sort by latest first
  const sortedAttempts = [...attempts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const recentAttempts = sortedAttempts.slice(0, 5);

  return (
    <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Academic <Text className="text-pink-600">History</Text>
          </Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recent performance records</Text>
        </View>
        <View className="p-3 bg-pink-500/10 rounded-2xl">
          <Trophy size={20} color="#ec4899" />
        </View>
      </View>

      <View className="space-y-4 gap-4">
        {recentAttempts.map((attempt, idx) => {
          const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
          const isA = scorePercent >= 75;
          const isPass = scorePercent >= 50;
          
          const badgeColor = isA ? 'bg-emerald-500' : isPass ? 'bg-amber-500' : 'bg-rose-500';
          const badgeText = isA ? 'A1' : isPass ? 'C5' : 'F9';

          const date = new Date(attempt.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const title = attempt.exam?.title || 'Exam';

          return (
            <TouchableOpacity 
              key={attempt.id || idx}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-transparent dark:border-slate-800"
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mr-4">
                  <FileText size={20} color={isDark ? '#94a3b8' : '#94a3b8'} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className={`px-2 py-0.5 rounded-full ${badgeColor}`}>
                      <Text className="text-[10px] font-black text-white">{badgeText}</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{date}</Text>
                  </View>
                  <Text className="font-black text-sm text-slate-900 dark:text-white capitalize" numberOfLines={1}>{title.toLowerCase()}</Text>
                </View>
              </View>

              <View className="items-end pl-2 border-l border-slate-200 dark:border-slate-700">
                <Text className="text-xl font-black text-slate-900 dark:text-white italic">{scorePercent}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
