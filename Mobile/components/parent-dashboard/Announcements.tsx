import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Megaphone, Calendar } from 'lucide-react-native';

export const Announcements = () => {
  const updates = [
    {
      id: 1,
      title: 'Science Fair Registration',
      date: 'Today, 10:00 AM',
      icon: Megaphone,
    },
    {
      id: 2,
      title: 'End of Term Exams Schedule',
      date: 'Yesterday, 2:30 PM',
      icon: Calendar,
    },
  ];

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-LexendBold text-slate-800 dark:text-white uppercase tracking-tight">School Activity</Text>
          <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mt-1">Latest updates</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-xs font-Lexend text-slate-400 dark:text-slate-500">View all</Text>
        </TouchableOpacity>
      </View>
      
      {updates.map((update) => (
        <View key={update.id} className="bg-white dark:bg-slate-800 rounded-3xl p-4 flex-row items-center shadow-sm mb-3 border border-slate-100 dark:border-slate-700">
          <View className="bg-orange-100 dark:bg-orange-500/20 h-12 w-12 rounded-2xl items-center justify-center mr-4">
            <update.icon size={22} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-LexendBold text-slate-800 dark:text-slate-200 mb-1">{update.title}</Text>
            <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">{update.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};
