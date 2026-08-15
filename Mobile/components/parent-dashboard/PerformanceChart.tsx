import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { BarChart2, AlertCircle } from 'lucide-react-native';

interface PerformanceChartProps {
  activeChildId?: string;
}

export const PerformanceChart = ({ activeChildId }: PerformanceChartProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data, isLoading } = useParentDashboard(activeChildId);

  const recentGrades = data?.child?.recentGrades || [];



  // Format data: calculate percentage, cap at 5 items, reverse for chronological order
  let chartData = [...recentGrades]
    .slice(0, 5)
    .reverse()
    .map((g: any) => {
      const rawSubject = typeof g.subject === 'string' ? g.subject : (g.subjectPaper?.subject?.name || 'Unkn');
      const label = rawSubject.length > 12 ? rawSubject.substring(0, 12) + '...' : rawSubject;
      const score = g.score || 0;
      const maxMarks = g.maxMarks || 100;
      const value = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;

      // Determine color based on score
      let color = '#ef4444'; // Red (< 50)
      if (value >= 70) color = '#10b981'; // Green (>= 70)
      else if (value >= 50) color = '#f59e0b'; // Orange (>= 50)

      return { label, value, color };
    });

  const hasData = chartData.length > 0;

  return (
    <View className="mb-8">
      <View className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10">

        {/* Header */}
        <View className="flex-row items-center gap-3 mb-6">
          <View className="p-2.5 bg-blue-600/10 rounded-2xl border border-blue-500/20">
            <BarChart2 size={20} color="#2563eb" />
          </View>
          <View className="flex-col">
            <Text className="font-LexendBlack text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">
              Recent Academic Trend
            </Text>
            <Text className="text-[10px] text-blue-500 font-LexendBold uppercase tracking-widest mt-0.5">
              Subject Analytics
            </Text>
          </View>
        </View>

        {/* Chart Area */}
        <View className="w-full justify-center" style={{ height: 224 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : !hasData ? (
            <View className="items-center justify-center h-full">
              <AlertCircle size={36} color={isDark ? '#475569' : '#94a3b8'} className="mb-2 opacity-50" />
              <Text className="text-xs uppercase tracking-widest font-LexendBlack text-slate-400">
                No Grade Data Available
              </Text>
            </View>
          ) : (
            <View className="flex-row justify-between" style={{ height: 224 }}>
              {chartData.map((item, index) => (
                <View key={index} className="items-center flex-1" style={{ height: 224 }}>
                  {/* Fixed top zone: percentage label — always same height so bars stay contained */}
                  <View style={{ height: 20 }} className="justify-end items-center">
                    <Text className="text-[10px] font-LexendBold text-slate-600 dark:text-slate-300">
                      {item.value}%
                    </Text>
                  </View>

                  {/* Bar track — fixed height, bar grows from bottom */}
                  <View
                    className="flex-1 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden justify-end mx-1"
                    style={{ marginTop: 4 }}
                  >
                    <View
                      className="w-full rounded-lg"
                      style={{
                        height: `${Math.min(item.value, 100)}%`,
                        backgroundColor: item.color,
                        minHeight: item.value > 0 ? 4 : 0,
                      }}
                    />
                  </View>

                  {/* Axis label — fixed bottom zone */}
                  <Text
                    className="text-[9px] font-LexendBold text-slate-400 text-center"
                    numberOfLines={2}
                    style={{ height: 32, marginTop: 4 }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

      </View>
    </View>
  );
};
