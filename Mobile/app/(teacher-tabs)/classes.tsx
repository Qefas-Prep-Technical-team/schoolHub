import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchBar } from '../../components/ui/SearchBar';
import { Users, ChevronRight, BookOpen, GraduationCap, Building2 } from 'lucide-react-native';

// Mock Data
const CLASSES_DATA = [
  { id: 1, name: 'JSS 3A', level: 'Secondary', students: 32, subject: 'Mathematics', role: 'Subject Teacher', color: 'indigo' },
  { id: 2, name: 'SSS 1 Science', level: 'High School', students: 45, subject: 'Physics', role: 'Form Teacher', color: 'emerald' },
  { id: 3, name: 'Primary 5B', level: 'Primary', students: 28, subject: 'Basic Science', role: 'Subject Teacher', color: 'sky' },
  { id: 4, name: 'JSS 1C', level: 'Secondary', students: 35, subject: 'Mathematics', role: 'Subject Teacher', color: 'indigo' },
];

const FILTERS = ['All', 'Nursery', 'Primary', 'Secondary', 'High School'];

export default function TeacherClassesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredClasses = CLASSES_DATA.filter(cls => {
    return activeFilter === 'All' ? true : cls.level === activeFilter;
  });

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
            My Classes
          </Text>
          <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-1">
            Manage your assigned classrooms
          </Text>
        </View>

        <SearchBar />

        {/* Level Filters (Horizontal Scroll) */}
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

        {/* Classes List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredClasses.map((cls) => {
            // Determine icon and styling based on color
            let IconComp = Building2;
            let iconBgClass = 'bg-slate-100 dark:bg-slate-800';
            let iconColor = isDark ? '#cbd5e1' : '#475569';
            
            if (cls.color === 'indigo') {
              IconComp = GraduationCap;
              iconBgClass = 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800/30';
              iconColor = '#6366f1';
            } else if (cls.color === 'emerald') {
              IconComp = Users;
              iconBgClass = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/30';
              iconColor = '#10b981';
            } else if (cls.color === 'sky') {
              IconComp = BookOpen;
              iconBgClass = 'bg-sky-50 dark:bg-sky-900/30 border-sky-100 dark:border-sky-800/30';
              iconColor = '#0ea5e9';
            }

            return (
              <TouchableOpacity
                key={cls.id}
                className="mb-4 bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  
                  {/* Icon Block */}
                  <View className={`h-14 w-14 rounded-2xl items-center justify-center mr-4 border ${iconBgClass}`}>
                    <IconComp size={24} color={iconColor} strokeWidth={2} />
                  </View>
                  
                  {/* Details Block */}
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-LexendBold text-slate-900 dark:text-white tracking-tight mb-1">
                      {cls.name}
                    </Text>
                    
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Users size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                        <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                          {cls.students} Students
                        </Text>
                      </View>
                    </View>
                    
                    {/* Subject/Role Badge */}
                    <View className="self-start mt-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-md border border-slate-100 dark:border-slate-700/50">
                      <Text className="text-[10px] font-LexendBold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        {cls.subject} • {cls.role}
                      </Text>
                    </View>
                  </View>

                </View>

                {/* Right Action */}
                <View className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center">
                  <ChevronRight size={18} color={isDark ? '#cbd5e1' : '#475569'} />
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredClasses.length === 0 && (
            <View className="py-10 items-center justify-center">
              <View className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-full items-center justify-center mb-4">
                 <Building2 size={32} color={isDark ? '#475569' : '#94a3b8'} />
              </View>
              <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-1">No Classes Found</Text>
              <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 text-center px-10">
                You do not have any classes assigned for this level.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
