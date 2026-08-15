import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';

export const TodaySchedule = () => {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-LexendBold text-slate-800 dark:text-white">Today's Schedule</Text>
        <TouchableOpacity>
          <Text className="text-xs font-Lexend text-slate-400 dark:text-slate-500">See all</Text>
        </TouchableOpacity>
      </View>
      
      {/* Mock Schedule Item */}
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-4 flex-row items-center shadow-sm">
        <View className="bg-orange-100 dark:bg-orange-500/20 h-12 w-12 rounded-2xl items-center justify-center mr-4">
          <Clock size={24} color="#f97316" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-LexendBold text-slate-800 dark:text-slate-200 mb-1">Parent-Teacher Meeting</Text>
          <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">10:00 AM - 10:30 AM</Text>
        </View>
      </View>
    </View>
  );
};
