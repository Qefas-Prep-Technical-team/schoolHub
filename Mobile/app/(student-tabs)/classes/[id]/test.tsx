import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Edit3, ChevronRight, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react-native';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { CategoryStatsGrid } from '@/components/classes/CategoryStatsGrid';

export default function ClassTestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const classId = Array.isArray(id) ? id[0] : id;

  const { data: classData, isLoading: isClassLoading, refetch: refetchClass } = useSingleClass(classId || '');
  const { data: attemptsData, isLoading: isAttemptsLoading, refetch: refetchAttempts } = useStudentExamAttempts({ limit: 100 });
  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchClass?.(),
        refetchAttempts?.()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchClass, refetchAttempts]);

  const className = classData?.name || 'Class';
  const classExams = classData?.exams || [];
  const attempts = attemptsData?.attempts || [];
  
  const studentDepartmentId = profile?.departmentId;
  const hasDepartment = !!studentDepartmentId;

  // Filter exams by scope and category === 'QUIZ'
  const filteredTests = classExams.filter((exam: any) => {
    if (exam.category !== 'QUIZ') return false;

    const scope: string = exam.scope || 'CLASS';
    if (scope === 'SCHOOL') return true;
    if (scope === 'CLASS') return true;
    if (scope === 'DEPARTMENT') {
      if (!hasDepartment) return false;
      const examDeptIds: string[] = (exam.departments || []).map((d: any) =>
        d.departmentId || d.department?.id || d.id
      );
      return examDeptIds.includes(studentDepartmentId!);
    }
    return false;
  });

  // Map to status and sort
  const mappedTests = filteredTests.map((exam: any) => {
    const now = new Date();
    const end = exam.endDate ? new Date(exam.endDate) : null;
    const attempted = attempts.some((a: any) => a.examId === exam.id);

    let status: 'graded' | 'submitted' | 'upcoming' | 'overdue' = 'upcoming';
    let gradeStr = '--';
    
    if (attempted) {
      const a = attempts.find((a: any) => a.examId === exam.id);
      status = a?.status === 'SCORED' ? 'graded' : 'submitted';
      if (a?.totalScore != null && a?.totalMarks) {
        gradeStr = `${a.totalScore} / ${a.totalMarks}`;
      }
    } else if (end && now > end) {
      status = 'overdue';
    }

    return {
      ...exam,
      status,
      gradeStr,
      dueDateObj: end,
    };
  }).sort((a, b) => {
    // Sort upcoming first, then graded
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return (b.dueDateObj?.getTime() || 0) - (a.dueDateObj?.getTime() || 0);
  });

  // Search & Pagination Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const searchedTests = mappedTests.filter((t: any) => 
    !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(searchedTests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedTests = searchedTests.slice(startIdx, startIdx + pageSize);

  // Stats calculation
  const completedTests = mappedTests.filter((t: any) => t.status === 'graded' || t.status === 'submitted');
  let totalScoreSum = 0;
  let gradedCount = 0;

  mappedTests.forEach((t: any) => {
    if (t.status === 'graded' && t.gradeStr !== '--') {
      const parts = t.gradeStr.split(' / ');
      if (parts.length === 2) {
        const score = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        if (!isNaN(score) && max > 0) {
          totalScoreSum += (score / max) * 100;
          gradedCount++;
        }
      }
    }
  });

  const averageGrade = gradedCount > 0 ? Math.round(totalScoreSum / gradedCount) : 0;
  const completionRate = mappedTests.length > 0 ? Math.round((completedTests.length / mappedTests.length) * 100) : 0;

  const statsConfig = [
    { label: 'Completion Rate', value: completionRate, maxValue: 100, color: '#3b82f6', isPercentage: true },
    { label: 'Tests Taken', value: completedTests.length, maxValue: Math.max(1, mappedTests.length), color: '#8b5cf6', isPercentage: false },
    { label: 'Average Score', value: gradedCount > 0 ? averageGrade : 'N/A', maxValue: 100, color: '#10b981', isPercentage: true },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'graded':
        return { 
          color: 'text-emerald-600 dark:text-emerald-400', 
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          label: 'Graded',
          icon: CheckCircle2
        };
      case 'submitted':
        return { 
          color: 'text-blue-600 dark:text-blue-400', 
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          label: 'Submitted',
          icon: CheckCircle2
        };
      case 'overdue':
        return { 
          color: 'text-rose-600 dark:text-rose-400', 
          bg: 'bg-rose-100 dark:bg-rose-900/30',
          label: 'Overdue',
          icon: AlertCircle
        };
      default:
        return { 
          color: 'text-amber-600 dark:text-amber-400', 
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          label: 'Upcoming',
          icon: Clock
        };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isClassLoading || isAttemptsLoading || isProfileLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
          {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center opacity-50" />
          <View className="ml-5 flex-1">
            <View className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-1 opacity-50" />
            <View className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
          </View>
        </View>

        {/* Skeleton Cards */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="w-1/3 h-3 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 mt-2 opacity-50" />
          
          {[1, 2, 3, 4].map((item) => (
            <View 
              key={item}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mr-4 opacity-50" />
                <View className="flex-1 mr-2">
                  <View className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-2 opacity-50" />
                  <View className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full opacity-50" />
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <View className="w-1/4">
                  <View className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-2 opacity-50" />
                  <View className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full opacity-50" />
                </View>
                <View className="w-1/4 items-end">
                  <View className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-2 opacity-50" />
                  <View className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full opacity-50" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </TouchableOpacity>
          <View className="ml-5 flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
              Tests & Quizzes
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {className}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        <View className="px-4 pt-4">
          <CategoryStatsGrid stats={statsConfig} gradeScore={averageGrade} />
        </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 h-12">
          <Search size={18} className="text-slate-400 mr-3" />
          <TextInput
            className="flex-1 text-slate-900 dark:text-white text-base font-medium h-full"
            placeholder="Search quizzes & tests..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); setPage(1); }}
            style={{ paddingVertical: 0 }}
          />
        </View>
      </View>

      <View className="px-4 pb-4">
        {searchedTests.length === 0 ? (
          <View className="py-16 items-center px-4">
            <View className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mb-6">
              <Edit3 size={36} className="text-indigo-500" />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">
              No Tests Scheduled
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              There are currently no quizzes or tests scheduled for this class.
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 px-2">
              Class Tests ({searchedTests.length})
            </Text>
            
            {paginatedTests.map((test: any, index: number) => {
              const statusInfo = getStatusInfo(test.status);
              const StatusIcon = statusInfo.icon;
              const testNumber = startIdx + index + 1;
              const subjectName = test.subject?.name || 'General';
              
              return (
                <TouchableOpacity
                  key={test.id || index}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/exams/${test.id}` as any)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800"
                  style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mr-4">
                      <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {testNumber}
                      </Text>
                    </View>
                    
                    <View className="flex-1 mr-2">
                      <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={2}>
                        {test.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className="mr-2">
                          <StatusIcon size={14} className={statusInfo.color} />
                        </View>
                        <Text className={`text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>
                    
                    <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <View>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</Text>
                      <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {test.dueDateObj ? formatDate(test.dueDateObj) : 'No Due Date'}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score</Text>
                      <Text className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {test.gradeStr}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View className="flex-row items-center justify-between mt-4 mb-8 px-2">
                <TouchableOpacity
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 ${safePage === 1 ? 'opacity-50' : 'bg-white dark:bg-slate-800'}`}
                >
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Previous</Text>
                </TouchableOpacity>
                
                <Text className="text-xs font-black text-slate-500 dark:text-slate-400">
                  Page <Text className="text-indigo-600 dark:text-indigo-400">{safePage}</Text> of {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 ${safePage === totalPages ? 'opacity-50' : 'bg-white dark:bg-slate-800'}`}
                >
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Next</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
