import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';
import { useStudentProfile, useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useSingleClass } from '@/lib/api/hooks/useClasses';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ClassAttendanceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const classId = Array.isArray(id) ? id[0] : id;

  const { data: classData, isLoading: isClassLoading } = useSingleClass(classId || '');
  const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
  
  const studentId = studentProfile?.id || '';
  const { data: allAttendanceRecords, isLoading: isAttendanceLoading, isError } = useStudentAttendance(studentId);

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Filter records specifically for this class
  const classAttendanceRecords = Array.isArray(allAttendanceRecords) 
    ? allAttendanceRecords.filter((record: any) => record.classId === classId)
    : [];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getAttendanceForDate = (day: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;
    
    return classAttendanceRecords.find((record: any) => {
      if (!record.date) return false;
      const recordDate = record.date.split('T')[0];
      return recordDate === targetDate;
    });
  };

  // Calculate stats for current month
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  classAttendanceRecords.forEach((record: any) => {
    if (!record.date) return;
    const rDate = new Date(record.date);
    if (rDate.getFullYear() === year && rDate.getMonth() === month) {
      const s = record.status?.toLowerCase() || '';
      if (s === 'present') presentCount++;
      else if (s === 'late') lateCount++;
      else if (s === 'absent') absentCount++;
    }
  });

  const totalDays = presentCount + lateCount + absentCount;
  const attendanceRate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0;

  if (isClassLoading || isProfileLoading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Gracefully handle errors by defaulting to empty state instead of crashing/blocking the screen
  if (isError) {
    console.warn("Failed to load attendance data");
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* HEADER */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mr-4">
          <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Attendance</Text>
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">{classData?.name || 'Class Attendance'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Month Selector */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 shadow-sm border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
          <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <ChevronLeft size={24} className="text-slate-600 dark:text-slate-300" />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {MONTHS[month]} {year}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <ChevronRight size={24} className="text-slate-600 dark:text-slate-300" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-[48%] bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 items-center">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</Text>
            <Text className="text-2xl font-black text-emerald-500">{presentCount}</Text>
          </View>
          <View className="w-[48%] bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 items-center">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</Text>
            <Text className="text-2xl font-black text-amber-500">{lateCount}</Text>
          </View>
          <View className="w-[48%] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 items-center">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent</Text>
            <Text className="text-2xl font-black text-rose-500">{absentCount}</Text>
          </View>
          <View className="w-[48%] bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-800/50 items-center">
            <Text className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">Rate</Text>
            <Text className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{attendanceRate}%</Text>
          </View>
        </View>

        {/* Calendar Grid */}
        <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <View className="flex-row mb-4">
            {DAYS.map(day => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</Text>
              </View>
            ))}
          </View>
          
          <View className="flex-row flex-wrap">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} className="p-1">
                <View className="flex-1 rounded-xl bg-slate-50/50 dark:bg-slate-800/20" />
              </View>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const record = getAttendanceForDate(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              let bgColor = "bg-slate-50 dark:bg-slate-800/50";
              let textColor = "text-slate-400";
              let borderColor = "border-transparent";
              let Icon = null;
              let iconColor = "";

              if (record) {
                const s = record.status?.toLowerCase() || '';
                if (s === 'present') {
                  bgColor = "bg-emerald-50 dark:bg-emerald-900/20";
                  borderColor = "border-emerald-200 dark:border-emerald-800";
                  textColor = "text-emerald-700 dark:text-emerald-400";
                  Icon = CheckCircle;
                  iconColor = "#10b981";
                } else if (s === 'late') {
                  bgColor = "bg-amber-50 dark:bg-amber-900/20";
                  borderColor = "border-amber-200 dark:border-amber-800";
                  textColor = "text-amber-700 dark:text-amber-400";
                  Icon = AlertCircle;
                  iconColor = "#f59e0b";
                } else if (s === 'absent') {
                  bgColor = "bg-rose-50 dark:bg-rose-900/20";
                  borderColor = "border-rose-200 dark:border-rose-800";
                  textColor = "text-rose-700 dark:text-rose-400";
                  Icon = XCircle;
                  iconColor = "#f43f5e";
                }
              } else if (isToday) {
                borderColor = "border-indigo-500";
                textColor = "text-slate-900 dark:text-white";
              }

              return (
                <View key={day} style={{ width: '14.28%', aspectRatio: 0.8 }} className="p-1">
                  <View className={`flex-1 rounded-xl border ${bgColor} ${borderColor} p-1 items-center justify-between py-2`}>
                    <Text className={`text-xs font-black ${textColor}`}>
                      {day}
                    </Text>
                    {Icon && <Icon size={14} color={iconColor} strokeWidth={3} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Policy Cards */}
        <View className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 mb-4">
          <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
            Attendance Policy
          </Text>
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            Minimum 80% attendance required to pass. Late arrivals count as 0.5 absence after 15 minutes.
          </Text>
        </View>

        <View className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 mb-4">
          <Text className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
            Good Standing
          </Text>
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            Your current attendance rate of {attendanceRate}% {attendanceRate >= 80 ? 'exceeds' : 'is below'} the minimum requirement.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
