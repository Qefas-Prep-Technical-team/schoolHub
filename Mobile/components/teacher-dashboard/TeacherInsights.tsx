import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GraduationCap, TrendingUp, CalendarDays, CheckCircle2, MapPin, Clock } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function TeacherInsights() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const schedule = [
    { id: 1, subject: 'Mathematics', class: 'JSS 3A', time: '08:00 AM - 09:30 AM', location: 'Room 104', type: 'Lecture' },
    { id: 2, subject: 'Further Math', class: 'SSS 2B', time: '11:00 AM - 12:30 PM', location: 'Lab 2', type: 'Practical' },
  ];

  return (
    <View className="mb-6">
      <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight mb-4 ml-2">Insights</Text>
      
      {/* 2x2 Stats Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        <View className="w-[48%] bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
          <View className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl items-center justify-center mb-3">
            <GraduationCap size={20} color="#4f46e5" />
          </View>
          <Text className="text-[10px] font-LexendBold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Avg. Score</Text>
          <Text className="text-2xl font-LexendBlack text-indigo-950 dark:text-white tracking-tighter">78.5%</Text>
        </View>
        
        <View className="w-[48%] bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30">
          <View className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl items-center justify-center mb-3">
            <CheckCircle2 size={20} color="#10b981" />
          </View>
          <Text className="text-[10px] font-LexendBold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Attendance</Text>
          <Text className="text-2xl font-LexendBlack text-emerald-950 dark:text-white tracking-tighter">94%</Text>
        </View>

        <View className="w-[48%] bg-amber-50 dark:bg-amber-900/20 p-5 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
          <View className="h-10 w-10 bg-amber-100 dark:bg-amber-900/50 rounded-2xl items-center justify-center mb-3">
            <TrendingUp size={20} color="#f59e0b" />
          </View>
          <Text className="text-[10px] font-LexendBold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Top Performers</Text>
          <Text className="text-2xl font-LexendBlack text-amber-950 dark:text-white tracking-tighter">12</Text>
        </View>

        <View className="w-[48%] bg-sky-50 dark:bg-sky-900/20 p-5 rounded-[2rem] border border-sky-100 dark:border-sky-800/30">
          <View className="h-10 w-10 bg-sky-100 dark:bg-sky-900/50 rounded-2xl items-center justify-center mb-3">
            <CalendarDays size={20} color="#0ea5e9" />
          </View>
          <Text className="text-[10px] font-LexendBold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-1">Next Class</Text>
          <Text className="text-2xl font-LexendBlack text-sky-950 dark:text-white tracking-tighter">11:00</Text>
        </View>
      </View>

      {/* Daily Schedule Timeline */}
      <View className="flex-row items-center justify-between mb-4 ml-2">
        <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Today's Schedule</Text>
        <TouchableOpacity>
          <Text className="text-[10px] font-LexendBold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Full Week</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        {schedule.map((item) => (
          <View key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex-row gap-4">
            <View className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl items-center justify-center border border-slate-100 dark:border-slate-800">
              <Text className="font-LexendBlack text-indigo-600 dark:text-indigo-400 text-lg tracking-tighter leading-none">{item.time.split(':')[0]}</Text>
              <Text className="font-Lexend text-[8px] text-slate-500 uppercase tracking-widest mt-1">{item.time.split(' ')[1]}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-LexendBold text-slate-900 dark:text-white text-base tracking-tight mb-1">{item.subject}</Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Clock size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                  <Text className="text-xs font-Lexend text-slate-500">{item.time}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MapPin size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                  <Text className="text-xs font-Lexend text-slate-500">{item.location}</Text>
                </View>
              </View>
              <View className="self-start px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md mt-3">
                <Text className="text-[10px] font-LexendBold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{item.class} • {item.type}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
