import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { useStudentProfile, useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

export interface DayStatus {
  day: 'M' | 'T' | 'W' | 'Th' | 'Fr';
  status: 'present' | 'absent' | 'none';
}

interface ClassWeeklyStatusProps {
  weeklyData?: DayStatus[];
  onPress?: () => void;
}

export function ClassWeeklyStatus({ weeklyData, onPress }: ClassWeeklyStatusProps) {
  const { id } = useLocalSearchParams();
  const classId = Array.isArray(id) ? id[0] : id;

  const { data: studentProfile } = useStudentProfile();
  const { data: allAttendance } = useStudentAttendance(studentProfile?.id || '');

  const classAttendance = useMemo(() => {
    if (!Array.isArray(allAttendance)) return [];
    return allAttendance.filter((rec: any) => rec.classId === classId);
  }, [allAttendance, classId]);

  const realWeeklyData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    const weekDates = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const dayLabels: ('M' | 'T' | 'W' | 'Th' | 'Fr')[] = ['M', 'T', 'W', 'Th', 'Fr'];
    
    return weekDates.map((dateStr, i) => {
      const record = classAttendance.find((rec: any) => rec.date && rec.date.startsWith(dateStr));
      let status: 'present' | 'absent' | 'none' = 'none';
      if (record) {
        if (record.status === 'present' || record.status === 'late') status = 'present';
        else if (record.status === 'absent') status = 'absent';
      }
      return { day: dayLabels[i], status };
    });
  }, [classAttendance]);

  const attendanceRate = useMemo(() => {
    if (classAttendance.length === 0) return 0;
    const presentCount = classAttendance.filter((rec: any) => rec.status === 'present' || rec.status === 'late').length;
    return Math.round((presentCount / classAttendance.length) * 100);
  }, [classAttendance]);

  const today = new Date();
  
  // Custom date formatting
  const dayNum = today.getDate();
  const daySuffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthYear = today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Use real data or fallback
  const data = realWeeklyData;

  const radius = 22;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference;

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-6 border border-slate-100 dark:border-slate-800"
      style={{ elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}
    >
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center flex-1">
          <Text className="text-5xl font-black text-slate-900 dark:text-white mr-2 tracking-tighter">
            {dayNum}
          </Text>
          <View>
            <Text className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-tight">{weekday}</Text>
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{monthYear}</Text>
          </View>
        </View>
        
        {/* Circle Progress Chart */}
        <View className="flex-row items-center">
          <View className="relative w-16 h-16 items-center justify-center mr-2">
            <Svg width={64} height={64}>
              <Circle cx={32} cy={32} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
              <Circle 
                cx={32} cy={32} r={radius} 
                stroke={attendanceRate >= 80 ? "#10b981" : attendanceRate >= 50 ? "#f59e0b" : "#f43f5e"} 
                strokeWidth={strokeWidth} fill="none" 
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                transform="rotate(-90 32 32)"
              />
            </Svg>
            <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text className="text-[12px] font-black text-slate-700 dark:text-slate-200">{attendanceRate}%</Text>
            </View>
          </View>
          <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
            <ChevronRight size={16} className="text-slate-400" />
          </View>
        </View>
      </View>

      <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">This week status</Text>
      
      <View className="flex-row justify-between pr-4">
        {data.map((item, i) => (
          <View key={i} className="items-center">
            <Text className="text-xs font-bold text-slate-400 mb-2">{item.day}</Text>
            <View 
              className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
                item.status === 'present' 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : item.status === 'absent'
                    ? 'bg-rose-400 border-rose-400'
                    : 'bg-transparent border-slate-200 dark:border-slate-700'
              }`}
            >
              {item.status === 'present' && <Check size={14} color="#ffffff" strokeWidth={3} />}
              {item.status === 'absent' && <Text className="text-white font-bold text-xs">A</Text>}
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
