import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export const ChildrenOverview = () => {
  const children = [
    { name: 'Sarah Johnson', grade: 'Grade 10A', status: 'In Class', avatar: 'SJ' },
    { name: 'Mike Johnson', grade: 'Grade 7B', status: 'Absent', avatar: 'MJ' },
  ];

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-2 mb-4">
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
          My Children
        </Text>
      </View>
      
      {children.map((child, index) => (
        <TouchableOpacity 
          key={index}
          className="flex-row items-center justify-between p-4 mb-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <View className="flex-row items-center space-x-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center border border-blue-200 dark:border-blue-800">
              <Text className="text-blue-600 dark:text-blue-400 font-LexendBold">{child.avatar}</Text>
            </View>
            <View>
              <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-0.5">
                {child.name}
              </Text>
              <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400">
                {child.grade} • {child.status}
              </Text>
            </View>
          </View>
          <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
            <ChevronRight size={18} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
