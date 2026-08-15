import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { CheckCircle2, XCircle, Clock, CalendarCheck, ArrowRight } from 'lucide-react-native';
import { useMyTodayAttendance } from '@/lib/api/hooks/useSchool';
import { useColorScheme } from '@/hooks/use-color-scheme';
interface TodayAttendanceChartProps {
  primaryColor?: string;
  onNavigate?: () => void;
}

// Safe hex to RGB converter - prevents crash when .match() returns null
const hexToRgb = (hex: string): string => {
  const clean = hex.replace('#', '');
  const parts = clean.match(/.{2}/g);
  if (!parts || parts.length < 3) return '37, 99, 235'; // fallback blue-600
  return parts.map(c => parseInt(c, 16)).join(', ');
};


export const TodayAttendanceChart = ({ primaryColor = '#2563eb', onNavigate }: TodayAttendanceChartProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions(); // Proper hook — subscribes to orientation/split-screen changes

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // YYYY-MM-DD
  );

  const { data: classes = [], isLoading } = useMyTodayAttendance(selectedDate);

  const chartData = useMemo(() => {
    if (classes.length === 0) return { labels: [], data: [] };
    
    // Only take max 6 classes for chart readability on mobile
    const chartClasses = classes.slice(0, 6);
    
    return {
      labels: chartClasses.map((c: any) => c.className.length > 5 ? c.className.substring(0, 5) + '..' : c.className),
      data: chartClasses.map((c: any) => c.rate)
    };
  }, [classes]);

  const totals = useMemo(() => {
    const totalPresent = classes.reduce((acc: number, c: any) => acc + c.present, 0);
    const totalAbsent = classes.reduce((acc: number, c: any) => acc + c.absent, 0);
    const totalLate = classes.reduce((acc: number, c: any) => acc + c.late, 0);
    const total = classes.reduce((acc: number, c: any) => acc + c.total, 0);
    const overallRate = total > 0 ? Math.round((totalPresent / total) * 100) : 0;
    return { totalPresent, totalAbsent, totalLate, overallRate };
  }, [classes]);

  const rateColor = totals.overallRate >= 80 ? '#10B981' : totals.overallRate >= 60 ? '#F59E0B' : '#F43F5E';

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
        style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          height: 160, 
          width: 160, 
          borderRadius: 80, 
          opacity: 0.2,
          backgroundColor: rateColor, 
          transform: [{ translateX: 50 }, { translateY: -50 }] 
        }}
      />

      <View className="flex-row items-center justify-between mb-4 relative z-10">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: rateColor }} />
            <Text style={{ fontSize: 9, fontFamily: 'LexendBlack', textTransform: 'uppercase', letterSpacing: 1, color: rateColor }}>
              {selectedDate}
            </Text>
          </View>
          <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Attendance
          </Text>
        </View>

        <View style={{ height: 48, width: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: `${rateColor}15` }}>
          <Text style={{ fontSize: 16, fontFamily: 'LexendBlack', color: rateColor }}>
            {totals.overallRate}%
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'LexendBlack', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, color: rateColor }}>
            Rate
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-4 relative z-10">
        {[
          { label: 'Present', value: totals.totalPresent, color: '#10B981', Icon: CheckCircle2 },
          { label: 'Absent', value: totals.totalAbsent, color: '#F43F5E', Icon: XCircle },
          { label: 'Late', value: totals.totalLate, color: '#F59E0B', Icon: Clock },
        ].map(({ label, value, color, Icon }) => (
          <View
            key={label}
            className="flex-1 mr-2 last:mr-0 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
          >
            <View className="flex-row items-center gap-1 mb-1">
              <Icon size={12} color={color} />
              <Text className="text-[8px] font-LexendBlack uppercase tracking-widest text-slate-400">
                {label}
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontFamily: 'LexendBlack', color }}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: 160, position: 'relative', zIndex: 10, alignItems: 'center', justifyContent: 'center', marginLeft: -16 }}>
        {chartData.data.length > 0 ? (
          <View>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.data }]
              }}
              width={screenWidth - 48} // 24px padding on each side
              height={160}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: isDark ? '#0f172a' : '#ffffff',
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: isDark ? '#0f172a' : '#ffffff',
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) => `rgba(${hexToRgb(primaryColor)}, ${opacity})`,
                labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
                strokeWidth: 3,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#fff"
                }
              }}
              bezier
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          </View>
        ) : (
          <View className="items-center justify-center">
            <View className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-2">
              <CalendarCheck size={24} color="#94a3b8" />
            </View>
            <Text className="font-LexendBlack text-xs text-slate-500">No attendance data</Text>
            <Text className="text-[10px] font-Lexend text-slate-400 mt-1">Mark attendance in classes</Text>
          </View>
        )}
      </View>

      <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <Text className="text-[9px] font-LexendBold text-slate-400">
          {classes.length} class{classes.length !== 1 ? 'es' : ''}
        </Text>
        <TouchableOpacity 
          className="flex-row items-center gap-1"
          onPress={onNavigate}
        >
          <Text style={{ fontSize: 9, fontFamily: 'LexendBlack', textTransform: 'uppercase', letterSpacing: 1, color: primaryColor }}>
            All Classes
          </Text>
          <ArrowRight size={10} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
