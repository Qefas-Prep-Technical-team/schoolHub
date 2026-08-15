import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Sparkles, Activity, ShieldCheck, BarChart3, Gem, Lock } from 'lucide-react-native';
import DonutChart from './DonutChart';
import Toast from 'react-native-toast-message';

interface AdminSchoolPerformanceProps {
  analysis?: {
    averageScore: number;
    totalAssessments: number;
    subjectBreakdown?: { name: string; average: number }[];
    insight?: string;
    isPremium?: boolean;
  };
  isLoading?: boolean;
  hasPerformanceAccess?: boolean;
  primaryColor?: string;
}

export default function AdminSchoolPerformance({
  analysis,
  isLoading,
  hasPerformanceAccess = false,
  primaryColor = '#2563eb',
}: AdminSchoolPerformanceProps) {
  const hasData = (analysis?.totalAssessments || 0) > 0;

  const chartData = useMemo(() => {
    if (!analysis || !analysis.subjectBreakdown) {
      return [
        { name: 'High Performers', value: 0, color: primaryColor },
        { name: 'Average', value: 0, color: '#3b82f6' },
        { name: 'Review', value: 0, color: '#f43f5e' },
      ];
    }

    const excellentCount = analysis.subjectBreakdown.filter((s) => s.average >= 75).length;
    const goodCount = analysis.subjectBreakdown.filter((s) => s.average >= 50 && s.average < 75).length;
    const atRiskCount = analysis.subjectBreakdown.filter((s) => s.average < 50).length;
    const total = excellentCount + goodCount + atRiskCount || 1;

    return [
      { name: 'High Performers', value: Math.round((excellentCount / total) * 100), color: primaryColor },
      { name: 'Average', value: Math.round((goodCount / total) * 100), color: '#3b82f6' },
      { name: 'Review', value: Math.round((atRiskCount / total) * 100), color: '#f43f5e' },
    ];
  }, [analysis, primaryColor]);

  if (isLoading) {
    return (
      <View className="bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-8 h-96 justify-center items-center">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!hasPerformanceAccess) {
    return (
      <View className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 flex-col items-center justify-center relative overflow-hidden h-72">
        <View className="absolute inset-0 opacity-10 bg-slate-900 dark:bg-black" />
        <View className="w-16 h-16 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-md mb-4 z-10">
          <Lock size={32} color="#94a3b8" />
        </View>
        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-2 z-10">
          AI Performance Insights
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6 px-4 z-10">
          Upgrade your subscription plan to unlock deep AI-driven analytics and performance trends for your institution.
        </Text>
        <TouchableOpacity 
          className="px-6 py-3 rounded-full flex-row items-center justify-center shadow-sm z-10"
          style={{ backgroundColor: primaryColor }}
          onPress={() => Toast.show({
            type: 'info',
            text1: 'Upgrade Plan',
            text2: 'Please visit the billing portal on the web to upgrade your plan.',
          })}
        >
          <Text className="text-white font-bold text-sm">Upgrade Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-white/70 dark:bg-slate-900/80 border border-white/50 dark:border-slate-800/50 rounded-[3rem] p-6 md:p-8 shadow-sm overflow-hidden relative">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View 
          className="h-12 w-12 rounded-2xl flex items-center justify-center mr-4"
          style={{ backgroundColor: primaryColor, shadowColor: primaryColor, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}
        >
          <Sparkles size={24} color="white" />
        </View>
        <View>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            School <Text style={{ color: primaryColor }}>Performance</Text>
          </Text>
        </View>
      </View>

      {/* Insight Quote Box */}
      <View className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 mb-6">
        <View className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem]" style={{ backgroundColor: primaryColor }} />
        <View className="pl-2">
          <Text className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-sm italic mb-3">
            "{analysis?.insight || "Analyzing school performance data to provide helpful insights..."}"
          </Text>
          <View className="flex-row items-center">
            <Gem size={12} color={primaryColor} style={{ marginRight: 6 }} />
            <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>
              AI-Powered Insight
            </Text>
          </View>
        </View>
      </View>

      {/* Sub Metrics */}
      <View className="flex-row justify-between mb-8 gap-4">
        <View className="flex-1 p-5 rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
          <View className="flex-row items-center mb-2">
            <Activity size={14} color={primaryColor} style={{ marginRight: 6 }} />
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-500">School Average</Text>
          </View>
          <Text className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">
            {hasData ? `${analysis?.averageScore}%` : "N/A"}
          </Text>
        </View>
        
        <View className="flex-1 p-5 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/50">
          <View className="flex-row items-center mb-2">
            <ShieldCheck size={14} color="#2563eb" style={{ marginRight: 6 }} />
            <Text className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Status</Text>
          </View>
          <Text className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">Normal</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View className="items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
        <DonutChart 
          data={chartData}
          innerRadius={60}
          outerRadius={80}
          centerLabel={{
            title: 'Avg Grade',
            value: hasData ? (analysis!.averageScore >= 75 ? 'A+' : analysis!.averageScore >= 60 ? 'B' : 'C') : 'N/A'
          }}
        />
      </View>

      {/* Footer Metrics */}
      <View className="pt-6 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="flex-row -space-x-2 mr-3">
            {chartData.map((item, i) => (
              <View 
                key={i} 
                className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center" 
                style={{ backgroundColor: item.color }}
              >
                <Text className="text-[6px] font-black text-white">{item.value}%</Text>
              </View>
            ))}
          </View>
          <Text className="text-[8px] font-black uppercase tracking-widest text-slate-400">Performance Dist</Text>
        </View>
        
        <View className="flex-row items-center bg-slate-900 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          <BarChart3 color={primaryColor} size={12} style={{ marginRight: 4 }} />
          <Text className="text-[8px] font-black text-white uppercase tracking-widest">{analysis?.totalAssessments || 0} Records</Text>
        </View>
      </View>

    </View>
  );
}
