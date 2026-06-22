import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, User, MapPin, ChevronRight } from 'lucide-react-native';

export interface ClassItemData {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}

interface ClassCardProps {
  item: ClassItemData;
  index: number;
  onPress: () => void;
}

export function ClassCard({ item, index, onPress }: ClassCardProps) {
  // Extract RGB values for background opacity
  const getLightBackgroundColor = (hexColor: string) => {
    return `${hexColor}15`; // 15% opacity suffix
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex-row"
    >
      <View className="mr-3 justify-center">
        <Text className="text-lg font-bold text-slate-300 dark:text-slate-600">
          {(index + 1).toString().padStart(2, '0')}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-4">
          <View 
            className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: getLightBackgroundColor(item.color) }}
          >
            <BookOpen size={24} color={item.color} />
          </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {item.subject}
          </Text>
          <Text className="text-xl font-bold text-slate-900 dark:text-white" numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <ChevronRight size={24} className="text-slate-300 dark:text-slate-600" />
      </View>

      <View className="h-[1px] w-full bg-slate-100 dark:bg-slate-800 mb-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mr-2 border border-slate-100 dark:border-slate-700">
            <User size={14} className="text-slate-500 dark:text-slate-400" />
          </View>
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
            {item.teacher}
          </Text>
        </View>
        
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
          <MapPin size={12} className="text-slate-500 dark:text-slate-400 mr-1.5" />
          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {item.room}
          </Text>
        </View>
      </View>
      </View>
    </TouchableOpacity>
  );
}
