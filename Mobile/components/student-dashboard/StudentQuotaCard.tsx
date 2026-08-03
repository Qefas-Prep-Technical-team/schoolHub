import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldAlert, ArrowRight } from 'lucide-react-native';

export const StudentQuotaCard = () => {
  return (
    <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
          <ShieldAlert size={18} color="#64748b" />
        </View>
        <Text className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Student Quota</Text>
      </View>

      <Text className="text-[11px] font-Lexend text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        Monitoring your active assessments and AI tool usage.
      </Text>

      <TouchableOpacity className="flex-row items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 active:opacity-80">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">View Plans</Text>
        <ArrowRight size={14} color="#0f172a" className="dark:text-white" />
      </TouchableOpacity>
    </View>
  );
};
