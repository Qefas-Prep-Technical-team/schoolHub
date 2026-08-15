import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, GraduationCap } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const ParentHero = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <LinearGradient
      colors={isDark ? (['#ea580c', '#9a3412'] as const) : (['#ffedd5', '#fed7aa'] as const)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-[32px] p-6 mb-6 overflow-hidden relative shadow-sm"
    >
      <View className="w-2/3 z-10">
        <View className="flex-row items-center mb-2">
          <Text className={`text-xl font-LexendBold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ready to Learn? <Text>⭐</Text>
          </Text>
        </View>
        <Text className={`text-[12px] font-Lexend mb-4 leading-relaxed ${isDark ? 'text-orange-100' : 'text-slate-700'}`}>
          Assignments, and upcoming events with your personalized dashboard.
        </Text>
        <TouchableOpacity className="bg-orange-500 dark:bg-white rounded-full py-2.5 px-5 self-start shadow-sm">
          <Text className={`text-xs font-LexendBold ${isDark ? 'text-orange-600' : 'text-white'}`}>View Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative Elements replacing the illustration */}
      <View className="absolute right-0 bottom-0 h-full w-1/3 justify-end items-end p-4 pb-2 z-0 opacity-80">
        <View className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-2xl transform rotate-12 absolute bottom-12 right-2 shadow-sm">
           <GraduationCap size={28} color={isDark ? "#fde047" : "#eab308"} />
        </View>
        <View className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-3xl transform -rotate-6 absolute bottom-2 right-8 shadow-sm">
           <BookOpen size={40} color={isDark ? "#fdba74" : "#f97316"} />
        </View>
      </View>
    </LinearGradient>
  );
};
