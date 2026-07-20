import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sparkles, Calendar, BookOpen, Users, Clock } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function TeacherHero() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-6">
      <View className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <View className="absolute -right-10 -top-10 h-40 w-40 bg-pink-600 rounded-full blur-3xl opacity-30" />
        <View className="absolute -left-10 -bottom-10 h-40 w-40 bg-indigo-600 rounded-full blur-3xl opacity-20" />
        
        <View className="flex-row items-center justify-between mb-8 relative z-10">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 bg-white/10 rounded-2xl items-center justify-center backdrop-blur-md border border-white/10">
              <Sparkles size={24} color="#ffffff" />
            </View>
            <View>
              <Text className="text-white/60 font-LexendBold text-xs uppercase tracking-widest">Welcome Back</Text>
              <Text className="text-white font-LexendBlack text-xl tracking-tight">Mr. Adeola</Text>
            </View>
          </View>
        </View>

        <View className="bg-white/5 rounded-3xl p-5 border border-white/10 relative z-10">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#db2777" />
              <Text className="text-pink-400 font-LexendBold text-[10px] uppercase tracking-widest">Active Session</Text>
            </View>
            <View className="px-2 py-1 bg-white/10 rounded-lg">
              <Text className="text-white font-LexendBold text-[10px] uppercase tracking-widest">Mid-Term</Text>
            </View>
          </View>
          
          <Text className="text-3xl font-LexendBlack text-white italic tracking-tighter mb-1">2023/2024</Text>
          <Text className="text-slate-400 font-Lexend text-sm mb-6">Academic Year</Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/10 p-3 rounded-2xl">
              <Text className="text-2xl font-LexendBlack text-white mb-1">4</Text>
              <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest">Assigned Classes</Text>
            </View>
            <View className="flex-1 bg-white/10 p-3 rounded-2xl">
              <Text className="text-2xl font-LexendBlack text-white mb-1">128</Text>
              <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest">Total Students</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
