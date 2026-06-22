import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, Target, Calendar, Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function QuickActions() {
  const router = useRouter();

  return (
    <View className="mx-6 mt-6 bg-slate-900 dark:bg-slate-900/60 rounded-[2rem] p-6 overflow-hidden relative shadow-2xl">
      <View className="absolute top-0 right-0 w-40 h-40 bg-white/10 dark:bg-pink-500/10 rounded-full" />
      
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-black uppercase tracking-tighter italic text-white">
          Quick <Text className="text-pink-500">Actions</Text>
        </Text>
        <Zap size={24} color="#ec4899" />
      </View>

      <View className="flex-row gap-4 mb-4">
        <ActionCard 
          icon={<BookOpen size={24} color="#ffffff" />} 
          label="My Classes" 
          color="bg-pink-500" 
          onPress={() => router.push('/(student-tabs)/classes')} 
        />
        <ActionCard 
          icon={<Target size={24} color="#ffffff" />} 
          label="CA & Exams" 
          color="bg-rose-500" 
          onPress={() => {}} 
        />
      </View>
      <View className="flex-row gap-4">
        <ActionCard 
          icon={<Calendar size={24} color="#0f172a" />} 
          label="Assignments" 
          color="bg-slate-200" 
          textColor="text-slate-300 dark:text-slate-400"
          onPress={() => {}} 
        />
        <ActionCard 
          icon={<Star size={24} color="#ffffff" />} 
          label="Results" 
          color="bg-amber-500" 
          onPress={() => router.push('/(student-tabs)/grades')} 
        />
      </View>
    </View>
  );
}

function ActionCard({ icon, label, color, textColor = "text-slate-300 dark:text-slate-400", onPress }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 flex-col items-center justify-center p-4 bg-white/5 dark:bg-white/10 rounded-[1.5rem] border border-white/10"
    >
      <View className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${color}`}>
        {icon}
      </View>
      <Text className={`text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-400 text-center`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
