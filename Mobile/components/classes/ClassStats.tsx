import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ClassStatsProps {
  totalClasses: number;
}

export function ClassStats({ totalClasses }: ClassStatsProps) {
  return (
    <View className="mb-8 rounded-3xl overflow-hidden shadow-lg shadow-indigo-500/30">
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="p-6 flex-row items-center justify-between">
          {/* Decorative background element */}
          <View className="absolute -right-8 -top-12 opacity-10">
            <BookOpen size={160} color="#FFFFFF" />
          </View>

          <View>
            <Text className="text-indigo-100 font-medium text-sm mb-1">
              Total Enrolled
            </Text>
            <Text className="text-white font-bold text-4xl">
              {totalClasses} <Text className="text-indigo-200 text-lg font-medium">Classes</Text>
            </Text>
          </View>
          
          <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center backdrop-blur-md">
            <BookOpen size={28} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
