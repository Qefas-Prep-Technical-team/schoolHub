import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, BookOpen } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchBar } from '../../components/ui/SearchBar';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

// Mock Data
const MOCK_TEACHERS = [
  { id: '1', name: 'Dr. Albert Einstein', department: 'Science', role: 'Head of Physics', email: 'albert@school.edu', phone: '555-0101', avatarSeed: 'Albert', active: true },
  { id: '2', name: 'Mrs. Jane Doe', department: 'Arts', role: 'History Teacher', email: 'jane@school.edu', phone: '555-0102', avatarSeed: 'Jane', active: true },
  { id: '3', name: 'Mr. John Smith', department: 'Math', role: 'Math Teacher', email: 'john@school.edu', phone: '555-0103', avatarSeed: 'John', active: true },
  { id: '4', name: 'Dr. Marie Curie', department: 'Science', role: 'Head of Chemistry', email: 'marie@school.edu', phone: '555-0104', avatarSeed: 'Marie', active: false },
  { id: '5', name: 'Mr. David Attenborough', department: 'Arts', role: 'Geography Teacher', email: 'david@school.edu', phone: '555-0105', avatarSeed: 'David', active: true },
  { id: '6', name: 'Ms. Ada Lovelace', department: 'Math', role: 'Computer Science', email: 'ada@school.edu', phone: '555-0106', avatarSeed: 'Ada', active: true },
];

const FILTERS = ['All', 'Science', 'Math', 'Arts', 'Languages'];

export default function AdminTeachersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();

  // Filter the mock data
  const filteredTeachers = MOCK_TEACHERS.filter((t) => {
    if (activeFilter === 'All') return true;
    return t.department === activeFilter;
  });

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} style={{ paddingHorizontal: 16, paddingTop: 16, flex: 1 }}>
        
        {/* Header */}
        <View className="mb-6 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
              Teachers 
            </Text>
            <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-1">
              Faculty & Staff Directory
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
          </TouchableOpacity>
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

        {/* Teachers List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredTeachers.map((teacher) => {
            return (
              <TouchableOpacity
                key={teacher.id}
                className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <View className="flex-row items-center">
                  
                  {/* Left: Avatar with Status Indicator */}
                  <View className="relative mr-4">
                    <View className="h-14 w-14 rounded-full overflow-hidden bg-indigo-50 dark:bg-indigo-950 items-center justify-center border-2 border-indigo-100 dark:border-indigo-900">
                      <Image 
                        source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${teacher.avatarSeed}` }} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                    {/* Online Status Dot */}
                    <View 
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        teacher.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`} 
                    />
                  </View>
                  
                  {/* Middle: Info */}
                  <View className="flex-1 justify-center">
                    <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-0.5">
                      {teacher.name}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="mr-1.5">
                        <BookOpen size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                      </View>
                      <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                        {teacher.role}
                      </Text>
                    </View>
                  </View>

                </View>

                {/* Bottom Action Bar */}
                <View className="flex-row items-center justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <TouchableOpacity className="flex-row items-center justify-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full mr-3">
                    <View className="mr-2">
                      <Mail size={16} color={isDark ? '#cbd5e1' : '#475569'} />
                    </View>
                    <Text className="text-xs font-LexendBold text-slate-700 dark:text-slate-300">
                      Message
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-row items-center justify-center h-9 w-9 bg-slate-50 dark:bg-slate-800 rounded-full">
                    <Phone size={16} color={isDark ? '#cbd5e1' : '#475569'} />
                  </TouchableOpacity>
                </View>

              </TouchableOpacity>
            );
          })}

          {filteredTeachers.length === 0 && (
            <View className="py-10 items-center justify-center">
              <Text className="text-base font-Lexend text-slate-500 dark:text-slate-400">
                No teachers found in this department.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
