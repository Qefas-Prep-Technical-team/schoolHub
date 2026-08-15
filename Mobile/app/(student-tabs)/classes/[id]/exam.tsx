import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, FlatList, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, Clock, CheckCircle2, AlertCircle, Search, PlayCircle } from 'lucide-react-native';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { CategoryStatsGrid } from '@/components/classes/CategoryStatsGrid';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getStatusInfo = (exam: any, attemptStatus?: string) => {
  if (attemptStatus === 'SCORED') {
    return { key: 'graded', label: 'Graded', color: 'text-emerald-500', icon: CheckCircle2 };
  }
  if (attemptStatus === 'SUBMITTED') {
    return { key: 'submitted', label: 'Submitted', color: 'text-indigo-500', icon: CheckCircle2 };
  }
  if (attemptStatus === 'IN_PROGRESS') {
    return { key: 'in_progress', label: 'In Progress', color: 'text-amber-500', icon: Clock };
  }
  if (exam?.status === 'COMPLETED' || exam?.status === 'ARCHIVED') {
    return { key: 'closed', label: 'Closed', color: 'text-slate-500', icon: AlertCircle };
  }
  
  if (exam?.status === 'DRAFT') {
    return { key: 'closed', label: 'Draft', color: 'text-slate-500', icon: AlertCircle };
  }

  const now = new Date();
  if (exam?.startDate && new Date(exam.startDate) > now) {
    return { key: 'upcoming', label: 'Upcoming', color: 'text-sky-500', icon: Clock };
  }
  if (exam?.endDate && new Date(exam.endDate) < now) {
    return { key: 'overdue', label: 'Overdue', color: 'text-red-500', icon: AlertCircle };
  }
  
  return { key: 'available', label: 'Available', color: 'text-emerald-500', icon: PlayCircle };
};

const ExamCard = ({ exam, index, attempts }: { exam: any; index: number; attempts: any[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const heightValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const examAttempt = attempts.find((a: any) => a.examId === exam.id);
  const statusInfo = getStatusInfo(exam, examAttempt?.status);
  const StatusIcon = statusInfo.icon;
  const examNumber = index + 1;
  
  const rawPapers = exam.subjectExamPapers || exam.subjectPapers || [];
  const safePapers = rawPapers.map((p: any) => p.subjectPaper || p);
  
  const totalDuration = exam.durationMinutes > 0 ? exam.durationMinutes : safePapers.reduce((sum: number, p: any) => sum + (p.durationMinutes || 0), 0) || 0;
  
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'Unlimited';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${mins} mins`;
  };

  const classLabel = exam?.class?.name ? `${exam.class.name} ${exam.class.section || ''}`.trim() : '';
  const deptLabels = exam?.departments?.map((d: any) => d.department?.name).join(', ') || '';
  const displaySubtitle = [classLabel, deptLabels].filter(Boolean).join(' • ') || exam?.description || 'General Examination';



  const totalMarks = exam.totalMarks > 0 ? exam.totalMarks : safePapers.reduce((sum: number, p: any) => sum + (p.totalMarks || 0), 0) || 0;
  
  let scoreDisplay = `${totalMarks} Marks`;
  
  if (examAttempt && examAttempt.status === 'SCORED') {
    const achievedScore = examAttempt.totalScore !== null && examAttempt.totalScore !== undefined 
      ? examAttempt.totalScore 
      : safePapers.reduce((sum: number, p: any) => {
          const pAttempt = examAttempt.subjectAttempts?.find((sa: any) => sa.subjectPaperId === p.id);
          return sum + (pAttempt?.score || 0);
        }, 0);
    
    scoreDisplay = `${achievedScore} / ${totalMarks}`;
  } else if (examAttempt && examAttempt.status === 'SUBMITTED') {
     scoreDisplay = `Pending / ${totalMarks}`;
  }

  const toggleExpand = () => {
    if (safePapers.length > 0) {
      const nextState = !isExpanded;
      setIsExpanded(nextState);
      const targetHeight = safePapers.length * 70 + 20;
      heightValue.value = withTiming(nextState ? targetHeight : 0, { duration: 300, easing: Easing.inOut(Easing.ease) });
      rotationValue.value = withTiming(nextState ? 180 : 0, { duration: 300, easing: Easing.inOut(Easing.ease) });
    } else {
      router.push(`/exams/${exam.id}` as any);
    }
  };

  const animatedHeightStyle = useAnimatedStyle(() => {
    return {
      height: heightValue.value,
    };
  });

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationValue.value}deg` }],
    };
  });

  let numberBgColor = isDark ? '#1e293b' : '#f1f5f9'; // slate-800 : slate-100
  let numberTextColor = isDark ? '#94a3b8' : '#475569'; // slate-400 : slate-600
  
  if (statusInfo.key === 'graded' || statusInfo.key === 'available') {
    numberBgColor = isDark ? '#064e3b' : '#ecfdf5'; // emerald
    numberTextColor = isDark ? '#34d399' : '#059669';
  } else if (statusInfo.key === 'submitted') {
    numberBgColor = isDark ? '#312e81' : '#eef2ff'; // indigo
    numberTextColor = isDark ? '#818cf8' : '#4f46e5';
  } else if (statusInfo.key === 'in_progress') {
    numberBgColor = isDark ? '#78350f' : '#fffbeb'; // amber
    numberTextColor = isDark ? '#fbbf24' : '#d97706';
  } else if (statusInfo.key === 'upcoming') {
    numberBgColor = isDark ? '#0c4a6e' : '#f0f9ff'; // sky
    numberTextColor = isDark ? '#38bdf8' : '#0284c7';
  } else if (statusInfo.key === 'overdue') {
    numberBgColor = isDark ? '#7f1d1d' : '#fef2f2'; // red
    numberTextColor = isDark ? '#f87171' : '#dc2626';
  }

  return (
    <View 
      className="bg-white dark:bg-slate-900 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800 overflow-hidden"
      style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/exams/${exam.id}` as any)}
        className="p-5 pb-3"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: numberBgColor }}>
            <Text className="text-sm font-black" style={{ color: numberTextColor }}>
              {examNumber}
            </Text>
          </View>
          
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={2}>
              {exam.title}
            </Text>
            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1" numberOfLines={1}>
              {displaySubtitle}
            </Text>
            <View className="flex-row items-center mt-2 self-start px-2 py-1 rounded-md" style={{ backgroundColor: numberBgColor }}>
              <View className="mr-1.5">
                <StatusIcon size={12} color={numberTextColor} />
              </View>
              <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: numberTextColor }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          
          <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
        </View>
      </TouchableOpacity>

      {/* Subject Papers Inline - Expandable */}
      {safePapers.length > 0 && (
        <Animated.View style={[animatedHeightStyle, { overflow: 'hidden' }]}>
          <View className="mt-1 mb-2 space-y-2 px-5 pl-[72px]">
            {safePapers.map((paper: any) => {
              const paperAttempt = examAttempt?.subjectAttempts?.find((sa: any) => sa.subjectPaperId === paper.id);
              const hasScore = paperAttempt?.score !== undefined;
              
              return (
                <View key={paper.id} className="flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-300" numberOfLines={1}>
                      {paper.title || paper.subject?.name || "Unnamed Paper"}
                    </Text>
                  </View>
                  {hasScore ? (
                    <View className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                      <Text className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                        {paperAttempt.score} / {paper.totalMarks || '--'}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-[10px] font-bold text-slate-400">
                      {formatDuration(paper.durationMinutes)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      <TouchableOpacity 
        activeOpacity={0.6}
        onPress={toggleExpand}
        className="flex-row items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"
      >
        <View>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time Limit</Text>
          <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {formatDuration(totalDuration)}
          </Text>
        </View>
        
        <View className="items-end flex-row items-center">
          <View className="items-end mr-2">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Score</Text>
            <Text className="text-xs font-black text-slate-700 dark:text-slate-300">
              {scoreDisplay}
            </Text>
          </View>
          {safePapers.length > 0 && (
            <Animated.View style={animatedChevronStyle}>
              <ChevronDown size={16} className="text-slate-400" />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function ClassExamScreen() {
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

  // Filter exams by scope and category (exclude QUIZ and CA)
  const filteredExams = classExams.filter((exam: any) => {
    if (exam.category === 'QUIZ' || exam.category === 'CA') return false;

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
  const mappedExams = filteredExams.map((exam: any) => {
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
  }).sort((a: any, b: any) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return (b.dueDateObj?.getTime() || 0) - (a.dueDateObj?.getTime() || 0);
  });

  // Search & Infinite Scroll Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const searchedExams = mappedExams.filter((e: any) => 
    !searchQuery || e.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedExams = searchedExams.slice(0, visibleCount);

  // Stats calculation
  const completedExams = mappedExams.filter((e: any) => e.status === 'graded' || e.status === 'submitted');
  let totalScoreSum = 0;
  let gradedCount = 0;

  mappedExams.forEach((e: any) => {
    if (e.status === 'graded' && e.gradeStr !== '--') {
      const parts = e.gradeStr.split(' / ');
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
  const completionRate = mappedExams.length > 0 ? Math.round((completedExams.length / mappedExams.length) * 100) : 0;

  const statsConfig = [
    { label: 'Completion Rate', value: completionRate, maxValue: 100, color: '#3b82f6', isPercentage: true },
    { label: 'Exams Taken', value: completedExams.length, maxValue: Math.max(1, mappedExams.length), color: '#8b5cf6', isPercentage: false },
    { label: 'Average Score', value: gradedCount > 0 ? averageGrade : 'N/A', maxValue: 100, color: '#10b981', isPercentage: true },
  ];

  const handleLoadMore = () => {
    if (visibleCount < searchedExams.length) {
      setVisibleCount(prev => prev + 8);
    }
  };

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
              Examinations
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {className}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 h-12">
          <Search size={18} className="text-slate-400 mr-3" />
          <TextInput
            className="flex-1 text-slate-900 dark:text-white text-base font-medium h-full"
            placeholder="Search exams & subject papers..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); setVisibleCount(8); }}
            style={{ paddingVertical: 0 }}
          />
        </View>
      </View>

      <FlatList 
        className="flex-1 px-4 pt-4"
        data={paginatedExams}
        keyExtractor={(item, index) => item.id || index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View className="mb-4">
            <CategoryStatsGrid stats={statsConfig} gradeScore={averageGrade} />
            {searchedExams.length > 0 && (
              <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-2 px-2">
                Class Exams ({searchedExams.length})
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="py-16 items-center px-4">
            <View className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mb-6">
              <BookOpen size={36} className="text-indigo-500" />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">
              No Exams Scheduled
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              There are currently no examinations scheduled for this class.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <ExamCard exam={item} index={index} attempts={attempts} />
        )}
        ListFooterComponent={
          searchedExams.length > 0 ? (
            <View className="py-4 items-center">
              {visibleCount < searchedExams.length ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 mb-8">
                  End of List
                </Text>
              )}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
    </>
  );
}
