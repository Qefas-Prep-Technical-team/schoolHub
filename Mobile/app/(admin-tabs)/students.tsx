import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchBar } from '../../components/ui/SearchBar';

// Mock Data
const MOCK_STUDENTS = [
  { id: '1', name: 'Alice Johnson', grade: 'Grade 10', studentId: 'STU-1001', status: 'Active', avatarSeed: 'Alice' },
  { id: '2', name: 'Bob Smith', grade: 'Grade 11', studentId: 'STU-1002', status: 'Active', avatarSeed: 'Bob' },
  { id: '3', name: 'Charlie Brown', grade: 'Grade 10', studentId: 'STU-1003', status: 'Inactive', avatarSeed: 'Charlie' },
  { id: '4', name: 'Diana Prince', grade: 'Grade 12', studentId: 'STU-1004', status: 'Active', avatarSeed: 'Diana' },
  { id: '5', name: 'Ethan Hunt', grade: 'Grade 11', studentId: 'STU-1005', status: 'Active', avatarSeed: 'Ethan' },
  { id: '6', name: 'Fiona Gallagher', grade: 'Grade 12', studentId: 'STU-1006', status: 'Suspended', avatarSeed: 'Fiona' },
];

const FILTERS = ['All', 'Grade 10', 'Grade 11', 'Grade 12', 'Active', 'Inactive'];

export default function AdminStudentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter the mock data based on the selected filter pill
  const filteredStudents = MOCK_STUDENTS.filter((student) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active' || activeFilter === 'Inactive') return student.status === activeFilter;
    return student.grade === activeFilter;
  });

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} style={{ paddingHorizontal: 16, paddingTop: 16, flex: 1 }}>
        
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
            Students
          </Text>
          <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-1">
            Directory & Management
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

        {/* Students List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {filteredStudents.map((student) => {
            const isStatusActive = student.status === 'Active';
            return (
              <TouchableOpacity
                key={student.id}
                className="flex-row items-center justify-between mb-4 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                {/* Left: Avatar & Info */}
                <View className="flex-row items-center flex-1">
                  <View className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-indigo-50 dark:bg-indigo-950 items-center justify-center border border-indigo-100 dark:border-indigo-900">
                    <Image 
                      source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${student.avatarSeed}` }} 
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-0.5">
                      {student.name}
                    </Text>
                    <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                      {student.grade} • {student.studentId}
                    </Text>
                  </View>
                </View>

                {/* Right: Status Badge & Arrow */}
                <View className="flex-row items-center">
                  <View 
                    className={`px-3 py-1 rounded-full mr-3 border ${
                      isStatusActive 
                        ? 'bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900' 
                        : 'bg-rose-100 border-rose-200 dark:bg-rose-950 dark:border-rose-900'
                    }`}
                  >
                    <Text 
                      className={`text-[10px] font-LexendBold uppercase tracking-wider ${
                        isStatusActive 
                          ? 'text-emerald-700 dark:text-emerald-400' 
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {student.status}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredStudents.length === 0 && (
            <View className="py-10 items-center justify-center">
              <Text className="text-base font-Lexend text-slate-500 dark:text-slate-400">
                No students found.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
