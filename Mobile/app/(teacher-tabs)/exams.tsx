import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FileText, Trophy, ClipboardList, Sparkles, BookOpen, Plus, ChevronRight, Clock, CheckCircle2 } from 'lucide-react-native';
import { SearchBar } from '../../components/ui/SearchBar';

// Mock Data
const EXAMS_DATA = [
  { id: 1, title: 'Mid-Term Mathematics', type: 'EXAM', status: 'Published', class: 'JSS 3A', date: 'Oct 24, 2023', score: '85% Avg' },
  { id: 2, title: 'Algebra Pop Quiz', type: 'QUIZ', status: 'Draft', class: 'SSS 1', date: 'Nov 02, 2023', score: '-' },
  { id: 3, title: 'Physics Practical', type: 'EXAM', status: 'Completed', class: 'SSS 2B', date: 'Sep 15, 2023', score: '72% Avg' },
  { id: 4, title: 'English Essay CA', type: 'CA', status: 'Published', class: 'JSS 1', date: 'Oct 28, 2023', score: '-' },
];

const CATEGORIES = [
  { id: 'EXAM', label: 'Exams', icon: Trophy },
  { id: 'QUIZ', label: 'Quizzes', icon: ClipboardList },
  { id: 'SUBJECT_PAPER', label: 'Subject Papers', icon: Sparkles },
  { id: 'CA', label: 'CA', icon: FileText },
  { id: 'ASSIGNMENT', label: 'Assignments', icon: BookOpen },
];

const FILTERS = ['All', 'Published', 'Draft', 'Completed'];

export default function TeacherExamsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeCategory, setActiveCategory] = useState('EXAM');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredExams = EXAMS_DATA.filter(exam => {
    const matchesCat = activeCategory === 'EXAM' ? exam.type === 'EXAM' : exam.type === activeCategory;
    const matchesFilter = activeFilter === 'All' ? true : exam.status === activeFilter;
    return matchesCat && matchesFilter;
  });

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
            Assessments
          </Text>
          <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-1">
            Manage your exams and quizzes
          </Text>
        </View>

        <SearchBar />

        {/* Category Tabs (Horizontal Scroll) */}
        <View className="mb-6 h-12">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`flex-row items-center px-5 mr-3 rounded-[1rem] border ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Icon size={16} color={isActive ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')} className="mr-2" />
                  <Text
                    className={`font-LexendBold text-sm ${
                      isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View className="w-4" />
          </ScrollView>
        </View>

        {/* Status Filters */}
        <View className="mb-6 h-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-4 mr-2 rounded-full items-center justify-center border ${
                    isActive
                      ? 'bg-slate-800 dark:bg-white border-slate-800 dark:border-white'
                      : 'bg-transparent border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Text
                    className={`font-Lexend text-xs ${
                      isActive ? 'text-white dark:text-slate-900 font-LexendBold' : 'text-slate-500 dark:text-slate-400'
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

        {/* Assessment List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredExams.map((exam) => {
            const isDraft = exam.status === 'Draft';
            const isCompleted = exam.status === 'Completed';
            
            return (
              <TouchableOpacity
                key={exam.id}
                className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  
                  {/* Left Side: Icon & Title */}
                  <View className="flex-row items-center flex-1">
                    <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 border ${
                      isDraft ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30' :
                      isCompleted ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' :
                      'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30'
                    }`}>
                      {isDraft ? <Clock size={20} color="#f59e0b" /> :
                       isCompleted ? <CheckCircle2 size={20} color={isDark ? '#94a3b8' : '#64748b'} /> :
                       <FileText size={20} color="#10b981" />}
                    </View>
                    
                    <View className="flex-1 pr-2">
                      <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-0.5" numberOfLines={1}>
                        {exam.title}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">{exam.class}</Text>
                        <View className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">{exam.date}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Side: Action Chevron */}
                  <View className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center">
                     <ChevronRight size={16} color={isDark ? '#cbd5e1' : '#475569'} />
                  </View>
                </View>

                {/* Status Badges Row */}
                <View className="flex-row items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <View className={`px-2 py-1 rounded-md mr-2 ${
                    isDraft ? 'bg-amber-100 dark:bg-amber-900/40' :
                    isCompleted ? 'bg-slate-200 dark:bg-slate-800' :
                    'bg-emerald-100 dark:bg-emerald-900/40'
                  }`}>
                    <Text className={`text-[9px] font-LexendBold uppercase tracking-widest ${
                      isDraft ? 'text-amber-700 dark:text-amber-400' :
                      isCompleted ? 'text-slate-600 dark:text-slate-400' :
                      'text-emerald-700 dark:text-emerald-400'
                    }`}>{exam.status}</Text>
                  </View>

                  {exam.score !== '-' && (
                    <Text className="text-xs font-LexendBold text-slate-400"> • {exam.score}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredExams.length === 0 && (
            <View className="py-10 items-center justify-center">
              <View className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-full items-center justify-center mb-4">
                 <FileText size={32} color={isDark ? '#475569' : '#94a3b8'} />
              </View>
              <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-1">No Assessments Found</Text>
              <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 text-center px-10">
                Try changing your filters or create a new assessment to get started.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-28 right-6 h-16 w-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-600/40 border-2 border-white dark:border-slate-950"
        activeOpacity={0.9}
      >
        <Plus size={28} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
