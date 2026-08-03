import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, CheckCircle, Clock, Award } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const InsightsGrid = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const insights = [
    {
      id: 'attendance',
      title: 'Avg. Attendance',
      value: '94%',
      trend: '+2.4%',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      trendUp: true
    },
    {
      id: 'performance',
      title: 'Overall Grade',
      value: 'B+',
      trend: '+1 Grade',
      icon: Award,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      trendUp: true
    },
    {
      id: 'assignments',
      title: 'Pending Tasks',
      value: '3',
      trend: 'Due this week',
      icon: Clock,
      color: 'bg-orange-500',
      lightBg: 'bg-orange-50 dark:bg-orange-500/10',
      textColor: 'text-orange-600 dark:text-orange-400',
      trendUp: false
    },
    {
      id: 'activity',
      title: 'Recent Activity',
      value: '12',
      trend: 'Updates',
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50 dark:bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
      trendUp: true
    }
  ];

  return (
    <View className="mb-6 px-4">
      <View className="flex-row flex-wrap justify-between">
        {insights.map((insight) => (
          <TouchableOpacity 
            key={insight.id}
            className={`w-[48%] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 ${insight.lightBg} mb-3`}
            activeOpacity={0.7}
          >
            <View className={`w-10 h-10 rounded-2xl ${insight.color} items-center justify-center mb-3 shadow-sm`}>
              <insight.icon size={20} color="#ffffff" />
            </View>
            <Text className="text-[11px] font-Lexend text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {insight.title}
            </Text>
            <Text className="text-2xl font-LexendBold text-slate-900 dark:text-white mb-2 tracking-tight">
              {insight.value}
            </Text>
            <View className="flex-row items-center">
              <Text className={`text-[10px] font-LexendBold ${insight.textColor}`}>
                {insight.trend}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
