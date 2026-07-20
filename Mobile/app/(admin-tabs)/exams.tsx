import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FileText, PlusCircle, Search, Calendar, ChevronRight, CheckCircle2, Clock, ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExamsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeExams = [
    { id: 1, title: 'Mathematics', class: 'JSS 3', status: 'Ongoing', time: '45 mins left' },
    { id: 2, title: 'Basic Science', class: 'SSS 1', status: 'Upcoming', time: 'Starts 2:00 PM' },
  ];

  const recentResults = [
    { id: 1, title: 'English Language (Mid-Term)', date: 'Oct 10, 2023', published: true },
    { id: 2, title: 'Civic Education (Mid-Term)', date: 'Oct 12, 2023', published: true },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER SECTION */}
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
            <View>
              <Text className="text-sm font-LexendBold text-slate-500 uppercase tracking-widest italic mb-1">Academic</Text>
              <Text className="text-3xl font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight italic">Exams</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="h-12 w-12 bg-white dark:bg-slate-900 rounded-full items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
              <Search size={22} color={isDark ? '#cbd5e1' : '#64748b'} />
            </View>
            <TouchableOpacity className="h-12 w-12 bg-pink-600 rounded-full items-center justify-center shadow-lg shadow-pink-600/30">
              <PlusCircle size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* OVERVIEW BENTO */}
        <View className="px-6 mb-8">
          <View className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border border-slate-800">
            <View className="absolute -right-6 -top-6 h-32 w-32 bg-pink-500 rounded-full blur-3xl opacity-20" />
            
            <View className="flex-row items-center justify-between mb-6 relative z-10">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 bg-white/10 rounded-2xl items-center justify-center backdrop-blur-md">
                  <Calendar size={20} color="#ffffff" />
                </View>
                <Text className="text-white/80 font-LexendBold uppercase tracking-widest text-xs">Current Session</Text>
              </View>
              <View className="px-3 py-1 bg-pink-500/20 rounded-lg border border-pink-500/30">
                <Text className="text-pink-400 font-LexendBold text-[10px] uppercase tracking-widest">Mid-Term</Text>
              </View>
            </View>
            
            <View className="relative z-10 flex-row justify-between items-end">
              <View>
                <Text className="text-3xl font-LexendBlack text-white italic tracking-tighter mb-1">2023/2024</Text>
                <Text className="text-slate-400 font-Lexend text-sm">Academic Year</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-LexendBlack text-white tracking-tighter">14</Text>
                <Text className="text-slate-400 font-Lexend text-xs">Exams Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ACTIVE EXAMS */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4 ml-2">
            <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Active Monitor</Text>
            <Text className="text-xs font-LexendBold text-pink-600 dark:text-pink-400 uppercase tracking-widest">View All</Text>
          </View>

          <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
            {activeExams.map((exam) => (
              <View key={exam.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className={`h-12 w-12 rounded-2xl items-center justify-center ${exam.status === 'Ongoing' ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <Clock size={20} color={exam.status === 'Ongoing' ? '#db2777' : (isDark ? '#cbd5e1' : '#64748b')} />
                  </View>
                  <View>
                    <Text className="font-LexendBold text-slate-900 dark:text-white mb-0.5">{exam.title}</Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest">{exam.class}</Text>
                      <View className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <Text className={`text-[10px] font-LexendBold uppercase tracking-widest ${exam.status === 'Ongoing' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-500'}`}>{exam.time}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
              </View>
            ))}
          </View>
        </View>

        {/* RECENT RESULTS */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4 ml-2">
            <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Recent Results</Text>
          </View>

          <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {recentResults.map((result, idx) => (
              <View key={result.id} className={`p-5 flex-row items-center justify-between ${idx !== recentResults.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                    <CheckCircle2 size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text className="font-LexendBold text-slate-900 dark:text-white">{result.title}</Text>
                    <Text className="text-xs font-Lexend text-slate-500 mt-1">{result.date}</Text>
                  </View>
                </View>
                <Text className="text-[10px] font-LexendBold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/30">
                  Published
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
