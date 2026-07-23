import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Heart } from 'lucide-react-native';

export const ParentHero = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-6 rounded-3xl overflow-hidden shadow-sm">
      <LinearGradient
        colors={isDark ? ['#1e3a8a', '#0f172a'] : ['#2563eb', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 24, paddingVertical: 32, minHeight: 140, justifyContent: 'flex-end' }}
      >
        <View className="flex-row items-center space-x-3 mb-2">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md border border-white/30">
            <Heart size={20} color="#ffffff" />
          </View>
          <View className="bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
            <Text className="text-white text-xs font-LexendBold">Family Account</Text>
          </View>
        </View>
        <Text className="text-3xl font-LexendBold text-white mb-2 tracking-tight">
          Hello, Mr. Johnson
        </Text>
        <Text className="text-sm font-Lexend text-blue-100/90 leading-relaxed max-w-[90%]">
          Both of your children are doing great this term. No outstanding fees!
        </Text>
      </LinearGradient>
    </View>
  );
};
