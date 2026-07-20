import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { FileBarChart2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface AdminHeroProps {
  schoolName: string;
}

export const AdminHero = ({ schoolName }: AdminHeroProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  return (
    <View className="mb-6 overflow-hidden rounded-[2.5rem] shadow-lg shadow-purple-600/30">
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 24, paddingVertical: 24, minHeight: 180, justifyContent: 'space-between' }}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <View className="flex-row items-center space-x-2 mb-2">
              <FileBarChart2 size={24} color="#ffffff" strokeWidth={2.5} />
              <Text className="text-white/90 font-LexendBold text-lg">
                School Overview
              </Text>
            </View>
            <Text className="text-white/80 font-Lexend text-sm">
              Comprehensive Analytics
            </Text>
          </View>
        </View>

        <View className="flex-row items-end justify-between mt-6">
          <View>
            <Text className="text-white/60 font-Lexend text-xs mb-1">
              Active Term
            </Text>
            <Text className="text-white font-LexendBold text-sm">
              Spring 2026
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => router.push('/(admin-tabs)/reports')}
            className="bg-slate-950 px-6 py-3 rounded-full flex-row items-center justify-center border border-slate-800"
          >
            <Text className="text-white font-LexendBold text-sm">View Reports</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};
