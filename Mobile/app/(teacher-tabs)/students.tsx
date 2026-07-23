import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchBar } from '../../components/ui/SearchBar';
import { Users, Mail, User, TrendingUp, TrendingDown, Minus, CheckSquare, ChevronRight } from 'lucide-react-native';

// Mock Data
const STUDENTS_DATA = [
  { id: 1, name: 'Alex Johnson', class: 'JSS 3A', avatarSeed: 'Alex', performance: 'Excellent', attendance: '98%', trend: 'up' },
  { id: 2, name: 'Sarah Williams', class: 'SSS 1 Science', avatarSeed: 'Sarah', performance: 'Good', attendance: '85%', trend: 'stable' },
  { id: 3, name: 'Michael Brown', class: 'JSS 3A', avatarSeed: 'Michael', performance: 'Average', attendance: '72%', trend: 'down' },
  { id: 4, name: 'Emily Davis', class: 'Primary 5B', avatarSeed: 'Emily', performance: 'Excellent', attendance: '95%', trend: 'up' },
  { id: 5, name: 'David Wilson', class: 'SSS 1 Science', avatarSeed: 'David', performance: 'Poor', attendance: '60%', trend: 'down' },
];

const FILTERS = ['All', 'JSS 3A', 'SSS 1 Science', 'Primary 5B', 'JSS 1C'];

export default function TeacherStudentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredStudents = STUDENTS_DATA.filter(student => {
    return activeFilter === 'All' ? true : student.class === activeFilter;
  });

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
            My Students
          </Text>
          <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-1">
            Directory and performance overview
          </Text>
        </View>

        <SearchBar />

        {/* Class Filters (Horizontal Scroll) */}
        <View className="mb-6 h-10 mt-2">
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

        {/* Students List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredStudents.map((student) => {
            // Determine performance styling
            let perfColor = 'emerald';
            let TrendIcon = TrendingUp;
            
            if (student.performance === 'Good') {
              perfColor = 'sky';
              TrendIcon = TrendingUp;
            } else if (student.performance === 'Average') {
              perfColor = 'amber';
              TrendIcon = Minus;
            } else if (student.performance === 'Poor') {
              perfColor = 'rose';
              TrendIcon = TrendingDown;
            }

            return (
              <TouchableOpacity
                key={student.id}
                className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <View className="flex-row items-center">
                  
                  {/* Left: Avatar with Online Status */}
                  <View className="relative mr-4">
                    <View className="h-16 w-16 rounded-2xl overflow-hidden bg-indigo-50 dark:bg-indigo-950 items-center justify-center border-2 border-indigo-100 dark:border-indigo-900">
                      <Image 
                        source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${student.avatarSeed}` }} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                    <View className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </View>
                  
                  {/* Middle: Info */}
                  <View className="flex-1 justify-center pr-2">
                    <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-0.5 tracking-tight">
                      {student.name}
                    </Text>
                    <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400 mb-2">
                      {student.class}
                    </Text>

                    <View className="flex-row items-center gap-2">
                      {/* Performance Badge */}
                      <View className={`px-2 py-1 bg-${perfColor}-50 dark:bg-${perfColor}-900/20 border border-${perfColor}-100 dark:border-${perfColor}-800/30 rounded-md flex-row items-center gap-1`}>
                        <TrendIcon size={10} color={
                          perfColor === 'emerald' ? '#10b981' : 
                          perfColor === 'sky' ? '#0ea5e9' : 
                          perfColor === 'amber' ? '#f59e0b' : '#f43f5e'
                        } />
                        <Text className={`text-[9px] font-LexendBold uppercase tracking-widest text-${perfColor}-600 dark:text-${perfColor}-400`}>
                          {student.performance}
                        </Text>
                      </View>

                      {/* Attendance Badge */}
                      <View className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        <Text className="text-[9px] font-LexendBold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          {student.attendance} Attnd
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Right Action */}
                  <View className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center">
                    <ChevronRight size={18} color={isDark ? '#cbd5e1' : '#475569'} />
                  </View>
                </View>

                {/* Bottom Action Bar */}
                <View className="flex-row items-center justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <TouchableOpacity className="flex-row items-center justify-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full mr-3">
                    <View className="mr-2">
                      <Mail size={14} color={isDark ? '#cbd5e1' : '#475569'} />
                    </View>
                    <Text className="text-[10px] font-LexendBold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                      Message
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-row items-center justify-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                    <View className="mr-2">
                      <User size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                    </View>
                    <Text className="text-[10px] font-LexendBold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      Profile
                    </Text>
                  </TouchableOpacity>
                </View>

              </TouchableOpacity>
            );
          })}

          {filteredStudents.length === 0 && (
            <View className="py-10 items-center justify-center">
              <View className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-full items-center justify-center mb-4">
                 <Users size={32} color={isDark ? '#475569' : '#94a3b8'} />
              </View>
              <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-1">No Students Found</Text>
              <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 text-center px-10">
                You do not have any students assigned in this class.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Button (Take Attendance) */}
      <TouchableOpacity 
        className="absolute bottom-28 right-6 h-16 w-16 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-slate-950"
        activeOpacity={0.9}
      >
        <CheckSquare size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
