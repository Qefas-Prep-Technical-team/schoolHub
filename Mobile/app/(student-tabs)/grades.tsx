import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, GraduationCap, FileText, Zap, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function GradesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#020617' : '#f8fafc';

  const [activeTab, setActiveTab] = useState<'exams' | 'standalone'>('exams');
  const [caTab, setCaTab] = useState<'ALL' | 'CA' | 'QUIZ' | 'ASSIGNMENT'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useStudentProfile();
  
  const { data: attemptsData, isLoading: isLoadingAttempts, refetch: refetchAttempts } = useStudentExamAttempts({ 
    limit: 50 
  });
  
  const { data: standaloneGradesData, isLoading: isLoadingGrades, refetch: refetchGrades } = useGrades(undefined, { 
    limit: 50,
    assessmentType: caTab === 'ALL' ? 'CA,QUIZ,ASSIGNMENT' : caTab
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchAttempts(), refetchGrades()]);
    setRefreshing(false);
  }, [refetchProfile, refetchAttempts, refetchGrades]);

  const attempts = attemptsData?.attempts || attemptsData?.data || [];
  const standaloneGrades = standaloneGradesData?.grades || standaloneGradesData?.data || [];

  const calculateCumulativeAvg = () => {
    const examPercents = attempts.map((a: any) => (a.totalScore / (a.totalMarks || 1)) * 100);
    const standalonePercents = standaloneGrades.map((g: any) => (g.score / (g.maxMarks || 1)) * 100);
    const allPercents = [...examPercents, ...standalonePercents];  
    if (allPercents.length === 0) return "0.0"; 
    const avg = allPercents.reduce((acc, curr) => acc + (curr || 0), 0) / allPercents.length;
    return (avg / 25).toFixed(1); // Rough conversion to 4.0 scale
  };

  const gpa = calculateCumulativeAvg();
  const progressPercent = Math.round((parseFloat(gpa) / 4.0) * 100);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isProfileLoading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: screenBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top']}>
      {/* HEADER */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <View className="h-10 w-10 bg-indigo-100 dark:bg-indigo-950 rounded-full items-center justify-center mr-4 border border-indigo-200 dark:border-indigo-800">
          <BookOpen size={20} color="#4f46e5" />
        </View>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Grades & Results</Text>
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {profile?.name || 'Student'} • Academic Record
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
      >
        {/* OVERALL PERFORMANCE HERO */}
        <View className="mb-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
            Overall Performance
          </Text>
          <View className="flex-row items-baseline mb-4">
            <Text className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white italic">
              {gpa}
            </Text>
            <Text className="text-2xl font-medium text-slate-400 ml-2">/ 4.0</Text>
          </View>
          
          <View className="bg-indigo-600 rounded-3xl p-6 overflow-hidden relative">
            <View className="relative z-10">
              <Text className="text-2xl font-black italic tracking-tight text-white mb-1">
                Distinction Track
              </Text>
              <Text className="text-sm font-medium text-indigo-100 max-w-[200px]">
                You are on track for an excellent standing this term.
              </Text>
            </View>
            <View className="absolute -right-6 -bottom-6 opacity-20">
              <Trophy size={140} color="#ffffff" />
            </View>
          </View>
        </View>

        {/* TABS HEADER */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Records
          </Text>
          <View className="flex-row bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <TouchableOpacity 
              onPress={() => setActiveTab('exams')}
              className={`px-4 py-1.5 rounded-lg ${activeTab === 'exams' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'exams' ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`}>
                Exams
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('standalone')}
              className={`px-4 py-1.5 rounded-lg ${activeTab === 'standalone' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'standalone' ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`}>
                C.A & Tests
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MAIN EXAMS VIEW */}
        {activeTab === 'exams' && (
          <View className="space-y-4">
            {isLoadingAttempts ? (
              <ActivityIndicator size="small" color="#4f46e5" style={{ marginTop: 40 }} />
            ) : attempts.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Text className="text-slate-400 font-medium">No exam records found.</Text>
              </View>
            ) : (
              attempts.map((attempt: any) => {
                const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
                let grade = "C"; let color = "text-indigo-600 dark:text-indigo-400"; let bg = "bg-indigo-100 dark:bg-indigo-900"; let barColor = "bg-indigo-600";
                
                if (scorePercent >= 75) grade = "A";
                else if (scorePercent >= 65) grade = "B";
                else if (scorePercent < 50) { 
                  grade = "F"; 
                  color = "text-rose-600 dark:text-rose-400"; 
                  bg = "bg-rose-100 dark:bg-rose-900";
                  barColor = "bg-rose-600";
                }

                return (
                  <TouchableOpacity 
                    key={attempt.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/exams/${attempt.examId}` as any)}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-1 pr-4">
                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color}`}>
                          Module • {attempt.exam?.code || 'GEN'}
                        </Text>
                        <Text className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white" numberOfLines={1}>
                          {attempt.exam?.title || 'Examination'}
                        </Text>
                      </View>
                      <View className={`w-12 h-12 flex items-center justify-center rounded-full ${bg}`}>
                        <Text className={`text-xl font-black italic ${color}`}>{grade}</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between items-end mb-2">
                      <Text className="text-xs font-bold text-slate-500">Score</Text>
                      <Text className="text-sm font-black text-slate-900 dark:text-white italic">
                        {attempt.totalScore} <Text className="text-xs text-slate-400 font-medium">/ {attempt.totalMarks}</Text>
                      </Text>
                    </View>
                    
                    <View className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <View className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, scorePercent)}%` }} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* STANDALONE C.A & TESTS VIEW */}
        {activeTab === 'standalone' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerClassName="gap-2">
              {['ALL', 'CA', 'QUIZ', 'ASSIGNMENT'].map((tab) => {
                const isActive = caTab === tab;
                const label = tab === 'QUIZ' ? 'Tests' : tab === 'ASSIGNMENT' ? 'Assignments' : tab;
                return (
                  <TouchableOpacity 
                    key={tab}
                    onPress={() => setCaTab(tab as any)}
                    className={`px-4 py-2 rounded-xl border ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-slate-200 dark:border-slate-800'}`}
                  >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="space-y-3">
              {isLoadingGrades ? (
                <ActivityIndicator size="small" color="#4f46e5" style={{ marginTop: 40 }} />
              ) : standaloneGrades.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text className="text-slate-400 font-medium">No records found for this category.</Text>
                </View>
              ) : (
                standaloneGrades.map((grade: any) => {
                  const percent = Math.round((grade.score / (grade.maxMarks || 1)) * 100);
                  const isQuiz = grade.assessmentType === 'QUIZ';
                  
                  let badgeBg = "bg-amber-100 dark:bg-amber-900";
                  let badgeColor = "text-amber-700 dark:text-amber-400";
                  if (isQuiz) { badgeBg = "bg-indigo-100 dark:bg-indigo-900"; badgeColor = "text-indigo-600 dark:text-indigo-400"; }
                  else if (grade.assessmentType === 'ASSIGNMENT') { badgeBg = "bg-pink-100 dark:bg-pink-900"; badgeColor = "text-pink-600 dark:text-pink-400"; }

                  return (
                    <View 
                      key={grade.id} 
                      className="bg-white dark:bg-slate-900 p-4 rounded-3xl flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mr-4">
                        {isQuiz ? <Zap size={20} color="#4f46e5" /> : <FileText size={20} color="#4f46e5" />}
                      </View>
                      
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-black italic uppercase tracking-tight text-slate-900 dark:text-white" numberOfLines={1}>
                          {grade.subject}
                        </Text>
                        <Text className="text-[10px] text-slate-500 font-medium my-0.5" numberOfLines={1}>
                          {grade.remarks || 'Standard Assessment'}
                        </Text>
                        <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          {formatDate(grade.createdAt)}
                        </Text>
                      </View>
                      
                      <View className="items-end">
                        <Text className="text-sm font-black italic text-slate-900 dark:text-white mb-1">
                          {grade.score}<Text className="text-[10px] font-normal text-slate-400">/{grade.maxMarks}</Text>
                        </Text>
                        <View className={`px-2 py-0.5 rounded-full ${badgeBg}`}>
                          <Text className={`text-[8px] font-black uppercase tracking-widest ${badgeColor}`}>
                            {grade.assessmentType || 'TEST'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
