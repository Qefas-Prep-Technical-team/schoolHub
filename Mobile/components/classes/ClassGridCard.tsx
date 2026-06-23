import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, User, MapPin } from 'lucide-react-native';
import { ClassItemData } from './ClassCard';

interface ClassGridCardProps {
  item: ClassItemData;
  index: number;
  onPress: () => void;
}

export function ClassGridCard({ item, index, onPress }: ClassGridCardProps) {
  const getLightBackgroundColor = (hexColor: string) => {
    return `${hexColor}15`;
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex-1 m-2"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: getLightBackgroundColor(item.color) }}
        >
          <BookOpen size={24} color={item.color} />
        </View>
        <Text className="text-lg font-bold text-slate-300 dark:text-slate-600">
          {(index + 1).toString().padStart(2, '0')}
        </Text>
      </View>
      
      <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1" numberOfLines={1}>
        {item.subject}
      </Text>
      <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4" numberOfLines={2}>
        {item.title}
      </Text>

      <View className="h-[1px] w-full bg-slate-100 dark:bg-slate-800 mb-4 mt-auto" />

      <View className="flex-row items-center mb-2">
        <User size={12} className="text-slate-400 dark:text-slate-500 mr-1.5" />
        <Text className="text-xs font-medium text-slate-600 dark:text-slate-400 flex-1" numberOfLines={1}>
          {item.teacher}
        </Text>
      </View>
      
      <View className="flex-row items-center">
        <MapPin size={12} className="text-slate-400 dark:text-slate-500 mr-1.5" />
        <Text className="text-xs font-medium text-slate-600 dark:text-slate-400" numberOfLines={1}>
          {item.room}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
