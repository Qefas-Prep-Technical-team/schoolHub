import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, ShieldCheck, GraduationCap, MapPin, Activity } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChildCardProps {
  child: {
    id: string;
    name: string;
    age: number;
    grade: string;
    class: string;
    studentId: string;
    imageUrl: string;
    attendance: number;
    gradeValue: string | number;
    gradePercentage?: string;
    todayAttendance?: string;
    status: 'active' | 'inactive';
  };
  onPress: () => void;
}

export const ChildCard = ({ child, onPress }: ChildCardProps) => {
  const isDark = useColorScheme() === 'dark';

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 70) return '#10b981'; // emerald-500
    if (percentage >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const attendanceColor = getAttendanceColor(child.attendance);
  const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=ea580c&color=fff`;

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className="mb-5 rounded-[32px] overflow-hidden"
    >
      <View 
        className="bg-white/80 dark:bg-slate-900/80 p-5 border border-white/40 dark:border-white/10 shadow-sm"
      >
        {/* Top Header: Image + Name + Status */}
        <View className="flex-row items-center gap-4 mb-5">
          <View className="relative">
            <View className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700">
              <Image 
                source={{ uri: (child.imageUrl && child.imageUrl !== "null" && child.imageUrl !== "") ? child.imageUrl : placeholderUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            {child.status === 'active' && (
              <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-white dark:border-slate-900 items-center justify-center">
                <ShieldCheck size={10} color="#ffffff" />
              </View>
            )}
          </View>

          <View className="flex-1 justify-center">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-LexendBold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-0.5">
                {child.studentId}
              </Text>
              
              {child.todayAttendance && (
                <View className={`px-2 py-0.5 rounded-full border ${
                  child.todayAttendance.toLowerCase() === 'present' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' :
                  child.todayAttendance.toLowerCase() === 'absent' ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800' :
                  child.todayAttendance.toLowerCase() === 'late' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' :
                  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  <Text className={`text-[8px] font-LexendBold uppercase tracking-widest ${
                    child.todayAttendance.toLowerCase() === 'present' ? 'text-emerald-600 dark:text-emerald-400' :
                    child.todayAttendance.toLowerCase() === 'absent' ? 'text-rose-600 dark:text-rose-400' :
                    child.todayAttendance.toLowerCase() === 'late' ? 'text-amber-600 dark:text-amber-400' :
                    'text-slate-600 dark:text-slate-400'
                  }`}>
                    {child.todayAttendance.toLowerCase() === 'present' ? 'In School' : 
                     child.todayAttendance.toLowerCase() === 'absent' ? 'Absent' :
                     child.todayAttendance.toLowerCase() === 'late' ? 'Late' :
                     'No Record'}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xl font-LexendBlack text-slate-800 dark:text-white" numberOfLines={1}>
              {child.name}
            </Text>
            <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400 mt-0.5">
              {child.class} • Age {child.age || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3">
          {/* Academic Level */}
          <View className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-LexendBold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Academics
              </Text>
              <GraduationCap size={14} color="#64748b" />
            </View>
            <View className="flex-row items-baseline gap-1.5">
              <Text className="text-xl font-LexendBlack text-slate-800 dark:text-slate-100">
                {child.gradeValue}
              </Text>
              <Text className="text-xs font-LexendBold text-orange-500">
                {child.gradePercentage}
              </Text>
            </View>
          </View>

          {/* Attendance */}
          <View className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-LexendBold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Attendance
              </Text>
              <Activity size={14} color={attendanceColor} />
            </View>
            <View className="flex-col gap-1.5">
              <Text className="text-xl font-LexendBlack text-slate-800 dark:text-slate-100">
                {child.attendance}%
              </Text>
              <View className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full"
                  style={{ width: `${child.attendance}%`, backgroundColor: attendanceColor }} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
