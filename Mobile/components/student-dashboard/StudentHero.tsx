import React from 'react';
import { View, Text } from 'react-native';
import { Star, Calendar } from 'lucide-react-native';

interface StudentHeroProps {
  username: string;
  termInfo: string;
  globalId?: string;
}

export function StudentHero({ username, termInfo, globalId }: StudentHeroProps) {
  return (
    <View className="mx-6 mt-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-pink-100 dark:border-pink-900/30 overflow-hidden relative">
      {/* Background decorations */}
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 dark:bg-pink-500/20 rounded-full" />
      
      <View className="flex-row flex-wrap items-center gap-2 mb-4">
        <View className="bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
          <Text className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400">
            Student Dashboard
          </Text>
        </View>
        <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          <Star size={10} color="#f59e0b" />
          <Text className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
            Active
          </Text>
        </View>
      </View>

      <Text className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none mb-1">
        Keep Pushing,
      </Text>
      <Text className="text-3xl font-black text-pink-600 tracking-tight uppercase leading-none mb-4">
        {username || 'Scholar'}
      </Text>

      <View className="flex-row items-center gap-3 bg-white dark:bg-slate-800 self-start p-2 pr-4 rounded-xl border border-slate-100 dark:border-slate-700 mt-2">
        <View className="h-10 w-10 bg-pink-500 rounded-lg items-center justify-center">
          <Calendar size={18} color="#ffffff" />
        </View>
        <View>
          <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400">Academic Term</Text>
          <Text className="text-sm font-black text-slate-900 dark:text-white">{termInfo}</Text>
        </View>
      </View>
    </View>
  );
}
