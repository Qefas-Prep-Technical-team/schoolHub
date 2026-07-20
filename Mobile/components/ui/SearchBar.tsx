import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SearchBar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
      <Search size={20} color={isDark ? '#94a3b8' : '#94a3b8'} />
      <TextInput
        placeholder="Search"
        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
        className="flex-1 ml-3 font-Lexend text-slate-900 dark:text-white text-base h-full"
      />
      <TouchableOpacity>
        <SlidersHorizontal size={20} color={isDark ? '#94a3b8' : '#94a3b8'} />
      </TouchableOpacity>
    </View>
  );
}
