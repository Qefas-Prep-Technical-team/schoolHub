import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, CalendarDays, ClipboardCheck, Award } from 'lucide-react-native';

export const QuickAccess = () => {
  const items = [
    {
      id: 'homework',
      title: 'Homework',
      icon: BookOpen,
      iconColor: '#f97316', // Orange
      iconBg: 'bg-orange-100',
    },
    {
      id: 'timetable',
      title: 'Timetable',
      icon: CalendarDays,
      iconColor: '#3b82f6', // Blue
      iconBg: 'bg-blue-100',
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: ClipboardCheck,
      iconColor: '#ef4444', // Red
      iconBg: 'bg-red-100',
    },
    {
      id: 'result',
      title: 'Result',
      icon: Award,
      iconColor: '#10b981', // Emerald
      iconBg: 'bg-emerald-100',
    },
  ];

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-LexendBold text-slate-800 dark:text-white">Quick Access</Text>
      </View>
      
      <View className="flex-row justify-between">
        {items.map((item) => (
          <TouchableOpacity 
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-3xl w-[22%] aspect-square items-center justify-center shadow-sm"
          >
            <View className={`p-2.5 rounded-xl ${item.iconBg} dark:opacity-90 mb-2`}>
              <item.icon size={22} color={item.iconColor} strokeWidth={2.5} />
            </View>
            <Text className="text-[10px] font-LexendBold text-slate-600 dark:text-slate-300">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
