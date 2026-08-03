import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles, TrendingUp, Target } from 'lucide-react-native';
import { MasteryRadarChart } from './MasteryRadarChart';

interface AcademicProgressWidgetProps {
  advice: string;
  strongest: { subject: string; A: number } | null;
  weakest: { subject: string; A: number } | null;
  chartData: any[];
}

export const AcademicProgressWidget = ({ advice, strongest, weakest, chartData }: AcademicProgressWidgetProps) => {
  if (!chartData || chartData.length === 0) {
    return (
      <View className="mx-6 mt-6 p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm items-center justify-center">
        <Text className="text-slate-400 font-LexendBold italic text-center">Waiting for your results...</Text>
      </View>
    );
  }

  return (
    <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
      <View className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl opacity-50 -translate-y-10 translate-x-10 pointer-events-none" />
      
      <View className="flex-row items-center gap-3 mb-6 relative z-10">
        <View className="h-10 w-10 rounded-xl bg-pink-500 items-center justify-center shadow-sm shadow-pink-500/30">
          <Sparkles size={18} color="#ffffff" />
        </View>
        <View>
          <Text className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Your Academic <Text className="text-pink-500">Progress</Text>
          </Text>
        </View>
      </View>

      <View className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 shadow-inner mb-4">
        <Text className="text-slate-600 dark:text-slate-300 font-LexendBold text-[11px] leading-relaxed italic">
          "{advice}"
        </Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        {strongest && (
          <View className="flex-1 p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 overflow-hidden">
            <View className="flex-row items-center gap-1.5 mb-2">
              <TrendingUp size={12} color="#10b981" />
              <Text className="text-[9px] font-black uppercase tracking-wider text-[#10b981]">Strongest</Text>
            </View>
            <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight" numberOfLines={2}>
              {strongest.subject}
            </Text>
          </View>
        )}
        
        {weakest && (
          <View className="flex-1 p-3 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 overflow-hidden">
            <View className="flex-row items-center gap-1.5 mb-2">
              <Target size={12} color="#f43f5e" />
              <Text className="text-[9px] font-black uppercase tracking-wider text-[#f43f5e]">Needs Work</Text>
            </View>
            <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight" numberOfLines={2}>
              {weakest.subject}
            </Text>
          </View>
        )}
      </View>

      <View className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-2 border border-slate-100 dark:border-slate-800">
        <MasteryRadarChart data={chartData} />
      </View>
    </View>
  );
};
