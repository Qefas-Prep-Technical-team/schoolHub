import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Sparkles, Activity, ShieldCheck, BarChart3, Gem, Lock } from 'lucide-react-native';
import DonutChart from '../ui/DonutChart';
import Toast from 'react-native-toast-message';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SchoolPerformanceProps {
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

export const SchoolPerformance = ({
  analysis,
  isLoading,
  hasPerformanceAccess = false,
  primaryColor = '#2563eb',
}: SchoolPerformanceProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

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
      <View className="bg-slate-200 dark:bg-slate-800 rounded-[3rem] h-96 mb-6 mx-2 animate-pulse" />
    );
  }

  if (!hasPerformanceAccess) {
    return (
      <View className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 flex-col items-center justify-center relative overflow-hidden h-80 mb-6 mx-2">
        <View className="w-16 h-16 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-md mb-4 z-10 border border-slate-100 dark:border-slate-800">
          <Lock size={32} color="#94a3b8" />
        </View>
        <Text className="text-xl font-LexendBlack text-slate-800 dark:text-white mb-3 z-10 text-center">
          AI Performance Insights
        </Text>
        <Text className="text-xs font-Lexend text-slate-500 text-center mb-8 px-2 z-10 leading-relaxed">
          Upgrade your subscription plan to unlock deep AI-driven analytics and performance trends for your institution.
        </Text>
        <TouchableOpacity 
          className="px-8 py-4 rounded-full flex-row items-center justify-center shadow-md z-10"
          style={{ backgroundColor: primaryColor }}
          onPress={() => Toast.show({
            type: 'info',
            text1: 'Premium Feature',
            text2: 'Please visit the billing portal on the web to upgrade your plan.',
          })}
        >
          <Text className="text-white font-LexendBold text-xs uppercase tracking-widest">Upgrade Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-white/70 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/50 rounded-[3rem] p-6 mb-6 mx-2 shadow-sm overflow-hidden relative">
      {/* Ambient glow */}
      <View style={[styles.glow, { backgroundColor: primaryColor }]} />

      <View className="flex-row items-center gap-3 mb-6 relative z-10">
        <View 
          className="h-10 w-10 rounded-2xl items-center justify-center shadow-lg"
          style={{ backgroundColor: primaryColor }}
        >
          <Sparkles size={20} color="#fff" />
        </View>
        <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tighter">
          School <Text style={{ color: primaryColor }}>Performance</Text>
        </Text>
      </View>

      <View className="relative z-10">
        <View className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden mb-4">
          <View className="absolute left-0 top-0 w-1 h-full" style={{ backgroundColor: primaryColor }} />
          <Text className="text-slate-600 dark:text-slate-300 font-LexendBold text-xs leading-relaxed mb-2">
            {analysis?.insight || 'Analyzing school performance data to provide helpful insights...'}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Gem size={12} color={primaryColor} />
            <Text className="text-[9px] font-LexendBlack uppercase tracking-widest" style={{ color: primaryColor }}>
              AI-Powered Insight
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 p-4 rounded-[2rem] bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm items-center justify-center">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Activity size={12} color={primaryColor} />
              <Text className="text-[8px] font-LexendBlack uppercase tracking-widest" style={{ color: primaryColor }}>
                School Avg
              </Text>
            </View>
            <Text className="text-xl font-LexendBlack text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">
              {hasData ? `${analysis?.averageScore}%` : "N/A"}
            </Text>
          </View>
          
          <View className="flex-1 p-4 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 shadow-sm items-center justify-center">
            <View className="flex-row items-center gap-1.5 mb-1">
              <ShieldCheck size={12} color="#2563eb" />
              <Text className="text-[8px] font-LexendBlack uppercase tracking-widest text-blue-600">
                Status
              </Text>
            </View>
            <Text className="text-xl font-LexendBlack text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">
              Normal
            </Text>
          </View>
        </View>

        <View 
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(2, 6, 23, 0.5)' : '#ffffff',
            borderRadius: 40,
            borderWidth: 1,
            borderColor: isDark ? '#1e293b' : '#f1f5f9',
            paddingVertical: 24,
            marginBottom: 16
          }}
        >
          <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-widest mb-6">Grade Distribution</Text>
          <DonutChart 
            data={chartData}
            innerRadius={60}
            outerRadius={85}
            centerLabel={{
              title: 'Avg Grade',
              value: hasData ? (analysis!.averageScore >= 75 ? 'A+' : analysis!.averageScore >= 60 ? 'B' : 'C') : 'N/A'
            }}
          />
        </View>
      </View>

      {/* Footer Metrics */}
      <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="flex-row -space-x-2 mr-3">
            {chartData.map((item, i) => (
              <View 
                key={i} 
                className="h-8 w-8 rounded-full border-[3px] border-white dark:border-slate-900 flex items-center justify-center shadow-sm" 
                style={{ backgroundColor: item.color }}
              >
                <Text className="text-[7px] font-LexendBlack text-white">{item.value}%</Text>
              </View>
            ))}
          </View>
          <Text className="text-[8px] font-LexendBlack uppercase tracking-widest text-slate-400">Dist</Text>
        </View>
        
        <View className="flex-row items-center gap-2 bg-slate-900 dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
          <BarChart3 color={primaryColor} size={12} />
          <Text className="text-[9px] font-LexendBlack text-white uppercase tracking-widest">
            {analysis?.totalAssessments || 0} Records
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
  }
});
