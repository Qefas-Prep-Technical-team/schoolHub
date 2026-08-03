import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';

export const AddChildCard = () => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex-col items-center justify-center p-10 h-64 mb-6"
    >
      <View className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 items-center justify-center mb-4">
        <Plus size={32} color="#ea580c" />
      </View>
      <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
        Add Child
      </Text>
      <Text className="text-[11px] font-Lexend text-slate-500 text-center px-4">
        Link a new student to your parent account using their student code.
      </Text>
    </TouchableOpacity>
  );
};
