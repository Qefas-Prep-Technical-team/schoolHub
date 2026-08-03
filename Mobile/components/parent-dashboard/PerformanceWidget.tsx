import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, BarChart2 } from 'lucide-react-native';

export const PerformanceWidget = () => {
  const subjects = [
    { name: 'Mathematics', score: 92, color: 'bg-emerald-500' },
    { name: 'Science', score: 88, color: 'bg-blue-500' },
    { name: 'English', score: 85, color: 'bg-indigo-500' },
    { name: 'History', score: 78, color: 'bg-orange-500' },
  ];

  return (
    <View className="mb-6 px-4">
      <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center space-x-2">
            <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center border border-blue-100 dark:border-blue-800">
              <BarChart2 size={16} color="#3b82f6" />
            </View>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Performance
            </Text>
          </View>
          <View className="flex-row items-center space-x-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
            <TrendingUp size={12} color="#10b981" />
            <Text className="text-[10px] font-LexendBold text-emerald-600 dark:text-emerald-400">Top 15%</Text>
          </View>
        </View>

        <View className="space-y-4">
          {subjects.map((subject, index) => (
            <View key={index} className="flex-col mb-3">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-xs font-Lexend text-slate-600 dark:text-slate-400">{subject.name}</Text>
                <Text className="text-xs font-LexendBold text-slate-900 dark:text-white">{subject.score}%</Text>
              </View>
              <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <View 
                  className={`h-full rounded-full ${subject.color}`} 
                  style={{ width: `${subject.score}%` }} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
