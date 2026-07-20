import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, GraduationCap, Building, Shapes, FlaskConical, Globe } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchBar } from '../../components/ui/SearchBar';

// Mock Data
const MOCK_CLASSES = [
  { id: '1', name: '10A - Physics', teacher: 'Dr. Albert Einstein', students: 28, capacity: 30, room: 'Room 302', category: 'Senior', icon: FlaskConical, color: '#3b82f6', bg: '#dbeafe', darkBg: '#1e3a8a' },
  { id: '2', name: '11B - History', teacher: 'Mrs. Jane Doe', students: 25, capacity: 25, room: 'Room 105', category: 'Senior', icon: Globe, color: '#f59e0b', bg: '#fef3c7', darkBg: '#78350f' },
  { id: '3', name: '8C - Mathematics', teacher: 'Mr. John Smith', students: 22, capacity: 30, room: 'Room 204', category: 'Junior', icon: Shapes, color: '#8b5cf6', bg: '#ede9fe', darkBg: '#4c1d95' },
  { id: '4', name: '12A - Chemistry', teacher: 'Dr. Marie Curie', students: 15, capacity: 20, room: 'Lab 1', category: 'Senior', icon: FlaskConical, color: '#10b981', bg: '#d1fae5', darkBg: '#064e3b' },
  { id: '5', name: '7B - Geography', teacher: 'Mr. David Attenborough', students: 30, capacity: 30, room: 'Room 110', category: 'Junior', icon: Globe, color: '#f43f5e', bg: '#ffe4e6', darkBg: '#881337' },
];

const FILTERS = ['All', 'Senior', 'Junior', 'Available', 'Full'];

export default function AdminClassesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter the mock data
  const filteredClasses = MOCK_CLASSES.filter((c) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Senior') return c.category === 'Senior';
    if (activeFilter === 'Junior') return c.category === 'Junior';
    if (activeFilter === 'Full') return c.students >= c.capacity;
    if (activeFilter === 'Available') return c.students < c.capacity;
    return true;
  });

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} style={{ paddingHorizontal: 16, paddingTop: 16, flex: 1 }}>
        
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
            Classes
          </Text>
          <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-1">
            Management & Assignments
          </Text>
        </View>

        {/* Search Bar */}
        <SearchBar />

        {/* Filter Pills */}
        <View className="mb-6 h-10">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-5 py-2 mr-3 rounded-full items-center justify-center border ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 shadow-sm shadow-blue-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Text
                    className={`font-LexendBold text-sm ${
                      isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View className="w-4" />
          </ScrollView>
        </View>

        {/* Classes List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredClasses.map((cls) => {
            const isFull = cls.students >= cls.capacity;
            const fillPercentage = (cls.students / cls.capacity) * 100;
            
            return (
              <TouchableOpacity
                key={cls.id}
                className="mb-4 bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                {/* Header: Icon, Name, and Status */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View 
                      className="h-12 w-12 rounded-[1rem] items-center justify-center mr-3"
                      style={{ backgroundColor: isDark ? cls.darkBg : cls.bg }}
                    >
                      <cls.icon size={22} color={cls.color} />
                    </View>
                    <View>
                      <Text className="text-base font-LexendBold text-slate-900 dark:text-white">
                        {cls.name}
                      </Text>
                      <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                        {cls.room}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Status Badge */}
                  <View 
                    className={`px-3 py-1.5 rounded-full border ${
                      isFull 
                        ? 'bg-rose-100 border-rose-200 dark:bg-rose-950 dark:border-rose-900' 
                        : 'bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900'
                    }`}
                  >
                    <Text 
                      className={`text-[10px] font-LexendBold uppercase tracking-wider ${
                        isFull 
                          ? 'text-rose-700 dark:text-rose-400' 
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {isFull ? 'Full' : 'Available'}
                    </Text>
                  </View>
                </View>

                {/* Body: Teacher */}
                <View className="flex-row items-center mb-4">
                  <GraduationCap size={16} color={isDark ? '#94a3b8' : '#64748b'} className="mr-2" />
                  <Text className="text-sm font-Lexend text-slate-700 dark:text-slate-300">
                    {cls.teacher}
                  </Text>
                </View>

                {/* Capacity Progress Bar */}
                <View>
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-xs font-LexendBold text-slate-700 dark:text-slate-300">
                      Capacity
                    </Text>
                    <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                      <Text className={isFull ? 'text-rose-600 dark:text-rose-400 font-LexendBold' : 'text-slate-900 dark:text-white font-LexendBold'}>
                        {cls.students}
                      </Text>
                      <Text>{` / ${cls.capacity} Students`}</Text>
                    </Text>
                  </View>
                  
                  <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full ${
                        isFull ? 'bg-rose-500' : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </View>
                </View>

              </TouchableOpacity>
            );
          })}

          {filteredClasses.length === 0 && (
            <View className="py-10 items-center justify-center">
              <Text className="text-base font-Lexend text-slate-500 dark:text-slate-400">
                No classes found for this filter.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
