import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search, LayoutGrid, List } from 'lucide-react-native';

interface ClassHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
}

export function ClassHeader({ searchQuery, setSearchQuery, viewMode, setViewMode }: ClassHeaderProps) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">
          My Classes
        </Text>
        
        <View className="flex-row items-center bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
          <TouchableOpacity 
            onPress={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <List size={20} className={viewMode === 'list' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <LayoutGrid size={20} className={viewMode === 'grid' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/50 dark:shadow-none">
        <Search size={20} className="text-slate-400 mr-3" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search classes or subjects..."
          placeholderTextColor="#94A3B8"
          className="flex-1 text-slate-900 dark:text-white font-medium text-base py-0 ml-1"
        />
      </View>
    </View>
  );
}
