import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { BookOpen, TrendingUp, Zap, Lightbulb } from 'lucide-react-native';
import { useMyPerformanceAnalysis } from '@/lib/api/hooks/useSchool';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AcademicPerformanceChartProps {
  primaryColor?: string;
  stats?: any;
}

// Safe hex to RGB converter - prevents crash when .match() returns null
const hexToRgb = (hex: string): string => {
  const clean = hex.replace('#', '');
  const parts = clean.match(/.{2}/g);
  if (!parts || parts.length < 3) return '37, 99, 235'; // fallback blue-600
  return parts.map(c => parseInt(c, 16)).join(', ');
};


export const AcademicPerformanceChart = ({ primaryColor = '#2563eb', stats }: AcademicPerformanceChartProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  // Pass schoolId when available so backend can return school-scoped AI insights
  const { data: analysis, isLoading, error } = useMyPerformanceAnalysis(stats?.schoolId || stats);
  const isAccessDenied = error && (error as any)?.response?.status === 403;

  const chartData = useMemo(() => {
    if (!analysis?.subjectBreakdown || analysis.subjectBreakdown.length === 0) {
      return null;
    }

    // Take max 6 subjects for readability on mobile
    const breakdown = analysis.subjectBreakdown.slice(0, 6);

    return {
      labels: breakdown.map((s: any) => s.name.substring(0, 4)),
      datasets: [
        {
          data: breakdown.map((s: any) => Math.round(s.average))
        }
      ]
    };
  }, [analysis]);

  const insights = useMemo(() => {
    if (!analysis?.subjectBreakdown || analysis.subjectBreakdown.length === 0) {
      return { avg: 0, best: { average: 0, name: 'N/A' } };
    }

    const values = analysis.subjectBreakdown.map((d: any) => d.average);
    const avg = Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
    const best = analysis.subjectBreakdown.reduce((p: any, c: any) => (p.average > c.average ? p : c));
    return { avg, best };
  }, [analysis]);

  if (isLoading) {
    return (
      <View className="bg-slate-200 dark:bg-slate-800 rounded-[3rem] h-80 mb-6 mx-2 animate-pulse" />
    );
  }

  return (
    <View
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        borderWidth: 1,
        borderRadius: 48,
        padding: 24,
        marginBottom: 24,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <View
        style={[
          styles.glow,
          { backgroundColor: primaryColor }
        ]}
      />

      <View className="flex-row items-center justify-between mb-5 relative z-10">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <Text className="text-[9px] font-LexendBlack uppercase tracking-widest" style={{ color: primaryColor }}>
              Student Grades
            </Text>
          </View>
          <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Performance
          </Text>
        </View>
        <View
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <TrendingUp size={16} color={primaryColor} />
        </View>
      </View>

      <View className="relative z-10 h-44 items-center justify-center -ml-4 mb-4">
        {chartData ? (
          <BarChart
            data={chartData}
            width={screenWidth - 48} // 24px padding on each side
            height={170}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: isDark ? '#0f172a' : '#ffffff',
              backgroundGradientFromOpacity: 0,
              backgroundGradientTo: isDark ? '#0f172a' : '#ffffff',
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) => `rgba(${hexToRgb(primaryColor)}, ${opacity})`,
              labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
              strokeWidth: 2,
              barPercentage: 0.6,
            }}
            style={{ paddingRight: 32 }}
            withInnerLines={false}
            showValuesOnTopOfBars={true}
            fromZero
            yAxisLabel=""
            yAxisSuffix="%"
          />
        ) : (
          <View className="items-center justify-center">
            <View className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
              <BookOpen size={22} color="#94a3b8" />
            </View>
            <Text className="font-LexendBlack text-xs text-slate-500">No performance data</Text>
            <Text className="text-[10px] font-LexendBold text-slate-400 mt-1">Awaiting assessment inputs</Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-3 mb-4 relative z-10">
        <View className="flex-1 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-800/50">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Zap size={11} color="#10b981" />
            <Text className="text-[8px] font-LexendBlack text-slate-400 uppercase tracking-widest">
              Best Subject
            </Text>
          </View>
          <Text className="text-base font-LexendBlack text-slate-900 dark:text-white leading-none">
            {Math.round(insights.best.average)}%
          </Text>
          <Text className="text-[9px] font-LexendBold text-slate-500 mt-1" numberOfLines={1}>
            {insights.best.name}
          </Text>
        </View>

        <View className="flex-1 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-800/50">
          <View className="flex-row items-center gap-1.5 mb-1">
            <TrendingUp size={11} color={primaryColor} />
            <Text className="text-[8px] font-LexendBlack text-slate-400 uppercase tracking-widest">
              School Avg
            </Text>
          </View>
          <Text className="text-base font-LexendBlack text-slate-900 dark:text-white leading-none">
            {insights.avg}%
          </Text>
          <Text className="text-[9px] font-LexendBold text-slate-500 mt-1">
            All subjects
          </Text>
        </View>
      </View>

      {isAccessDenied ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#e2e8f0', position: 'relative', zIndex: 10 }}
        >
          <View
            style={{ height: 28, width: 28, borderRadius: 12, backgroundColor: isDark ? '#1e293b' : '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}
          >
            <Lightbulb size={14} color="#64748b" />
          </View>
          <Text style={{ fontSize: 10, fontFamily: 'LexendBold', color: isDark ? '#94a3b8' : '#64748b', flex: 1, fontStyle: 'italic', lineHeight: 16 }} numberOfLines={2}>
            Upgrade to Premium to unlock AI-powered insights for academic performance.
          </Text>
        </View>
      ) : analysis?.insight ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}15`, position: 'relative', zIndex: 10 }}
        >
          <View
            style={{ height: 28, width: 28, borderRadius: 12, backgroundColor: isDark ? '#0f172a' : '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
          >
            <Lightbulb size={14} color={primaryColor} />
          </View>
          <Text style={{ fontSize: 10, fontFamily: 'LexendBold', color: isDark ? '#cbd5e1' : '#475569', flex: 1, fontStyle: 'italic', lineHeight: 16 }} numberOfLines={2}>
            "{analysis.insight}"
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    right: -24,
    top: -24,
    height: 120,
    width: 120,
    borderRadius: 60,
    opacity: 0.1,
  }
});
