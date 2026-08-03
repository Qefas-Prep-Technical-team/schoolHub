import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';

export const ActiveSubjectsWidget = ({ subjectsCount }: { subjectsCount: number }) => {
  return (
    <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Subjects</Text>
        <View className="px-2 py-1 rounded-full bg-pink-50 dark:bg-pink-500/10 border border-pink-500/20">
          <Text className="text-[9px] font-black uppercase text-pink-600">{subjectsCount} Enrolled</Text>
        </View>
      </View>
      
      {subjectsCount === 0 ? (
        <View className="flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <View className="h-14 w-14 rounded-full bg-pink-500/10 flex items-center justify-center mb-3">
            <BookOpen size={24} color="#ec4899" />
          </View>
          <Text className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Loading...</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Setting up your subjects.</Text>
        </View>
      ) : (
        <View className="flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <View className="h-14 w-14 rounded-full bg-pink-500/10 flex items-center justify-center mb-3">
            <BookOpen size={24} color="#ec4899" />
          </View>
          <Text className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Viewing {subjectsCount} Subjects</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Check timetable for details</Text>
        </View>
      )}
    </View>
  );
};
