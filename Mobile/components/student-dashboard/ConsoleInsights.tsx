import React from 'react';
import { View, Text } from 'react-native';
import { Trophy, BookOpen, GraduationCap } from 'lucide-react-native';

interface ConsoleInsightsProps {
  gpa: string;
  examsTaken: number;
  credits: string;
}

export function ConsoleInsights({ gpa, examsTaken, credits }: ConsoleInsightsProps) {
  return (
    <View className="flex-row justify-between mx-6 mt-6">
      <View className="flex-1 bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 mr-2 items-center shadow-sm">
        <View className="h-10 w-10 bg-indigo-500/10 rounded-full items-center justify-center mb-2">
          <Trophy size={18} color="#6366f1" />
        </View>
        <Text className="text-xl font-black text-slate-900 dark:text-white">{gpa}</Text>
        <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center">Current GPA</Text>
      </View>

      <View className="flex-1 bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 mx-1 items-center shadow-sm">
        <View className="h-10 w-10 bg-emerald-500/10 rounded-full items-center justify-center mb-2">
          <BookOpen size={18} color="#10b981" />
        </View>
        <Text className="text-xl font-black text-slate-900 dark:text-white">{examsTaken}</Text>
        <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center">Exams Taken</Text>
      </View>

      <View className="flex-1 bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 ml-2 items-center shadow-sm">
        <View className="h-10 w-10 bg-amber-500/10 rounded-full items-center justify-center mb-2">
          <GraduationCap size={18} color="#f59e0b" />
        </View>
        <Text className="text-xl font-black text-slate-900 dark:text-white">
          {credits.split(' ')[0]}
        </Text>
        <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center">Subjects</Text>
      </View>
    </View>
  );
}
