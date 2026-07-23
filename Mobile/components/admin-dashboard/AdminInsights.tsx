import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Users, BookOpen, Building, CalendarCheck2 } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatsProps {
  students: number;
  teachers: number;
  classes: number;
  exams: number;
}

interface AdminInsightsProps {
  stats?: StatsProps | null;
  isLoading: boolean;
}

export const AdminInsights = ({ stats, isLoading }: AdminInsightsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const items = [
    { label: 'Students', value: stats?.students || 0, icon: Users, color: '#f43f5e', bg: isDark ? '#881337' : '#ffe4e6' },
    { label: 'Teachers', value: stats?.teachers || 0, icon: BookOpen, color: '#f97316', bg: isDark ? '#7c2d12' : '#ffedd5' },
    { label: 'Classes', value: stats?.classes || 0, icon: Building, color: '#8b5cf6', bg: isDark ? '#4c1d95' : '#ede9fe' },
    { label: 'Exams', value: stats?.exams || 0, icon: CalendarCheck2, color: '#0ea5e9', bg: isDark ? '#082f49' : '#e0f2fe' },
  ];

  if (isLoading) {
    return (
      <View key="skeleton-loader" className="mb-6">
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white mb-4 px-2">
          Overview
        </Text>
        <View className="flex-row justify-between px-2">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-[22%] bg-slate-200 dark:bg-slate-800 rounded-full h-32 animate-pulse" />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View key="content-loaded" className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
          Overview
        </Text>
        <Text className="text-sm font-Lexend text-blue-600 dark:text-blue-400">
          View All
        </Text>
      </View>
      
      <View className="flex-row justify-between px-1">
        {items.map((item, index) => (
          <View 
            key={index} 
            className="w-[23%] items-center"
          >
            <View 
              className="w-full aspect-[4/5] rounded-[2rem] items-center justify-center mb-2 shadow-sm border border-slate-50 dark:border-slate-800"
              style={{ backgroundColor: item.bg }}
            >
              <item.icon size={28} color={item.color} className="mb-2" />
              <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
                {item.value}
              </Text>
            </View>
            <Text className="text-xs font-Lexend text-slate-600 dark:text-slate-400 text-center">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
