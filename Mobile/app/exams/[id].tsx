import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle, Eye, FileText, PlayCircle, BarChart2, Lock } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSingleExam, useExamAttempt, useStartExamAttempt } from '@/lib/api/hooks/useExams';
import Toast from 'react-native-toast-message';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

const PaperRingChart = ({ score, totalMarks, label }: { score: number, totalMarks: number, label: string }) => {
  const percentage = totalMarks > 0 ? score / totalMarks : 0;
  const size = 60;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference - (percentage * circumference);

  return (
    <View className="items-center mr-6">
      <View style={{ width: size, height: size }} className="bg-white dark:bg-slate-900 rounded-full shadow-sm">
        <Svg width={size} height={size}>
          <Circle
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <Circle
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progress}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-[9px] font-black text-slate-800 dark:text-slate-200 tracking-tighter">
            {score}/{totalMarks}
          </Text>
        </View>
      </View>
      <Text className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-2 w-16 text-center leading-tight" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
};

export default function ExamDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const examId = Array.isArray(id) ? id[0] : id;

  const { data: examResponse, isLoading: isExamLoading, refetch: refetchExam, isRefetching: isExamRefetching } = useSingleExam(examId || '');
  const { data: attemptData, isLoading: isAttemptLoading, refetch: refetchAttempt, isRefetching: isAttemptRefetching } = useExamAttempt(examId || '');
  const startAttemptMutation = useStartExamAttempt();

  const onRefresh = useCallback(() => {
    refetchExam();
    refetchAttempt();
  }, [refetchExam, refetchAttempt]);

  useFocusEffect(
    useCallback(() => {
      refetchAttempt();
    }, [refetchAttempt])
  );

  const exam = examResponse?.data || examResponse;
  const attempt = attemptData?.data || attemptData;
  
  const isStarted = !exam?.startDate || new Date() >= new Date(exam.startDate);

  const handleStartAction = () => {
    if (!isStarted) {
      Toast.show({ type: 'info', text1: 'Not Started', text2: "The exam hasn't started yet!" });
      return;
    }

    if (attempt?.status === 'IN_PROGRESS') {
      router.push(`/exams/${exam.id}/take`);
      return;
    }

    startAttemptMutation.mutate(exam.id, {
      onSuccess: () => {
        router.push(`/exams/${exam.id}/take`);
      },
      onError: (error: any) => {
        Toast.show({ type: 'error', text1: 'Error', text2: error?.response?.data?.message || 'Failed to start exam' });
      }
    });
  };
  
  if (isExamLoading || isAttemptLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
          {/* Header Skeleton */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 opacity-50" />
            <View className="ml-5 flex-1 space-y-2">
              <View className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
              <View className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Main Card Skeleton */}
          <View className="bg-white dark:bg-slate-900 p-6 rounded-b-[2.5rem] shadow-sm mb-6 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row justify-between mb-6">
              <View className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
              <View className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
            </View>
            <View className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50 mb-4" />
            <View className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full opacity-50 mb-2" />
            <View className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50 mb-6" />
            <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
              <View className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg opacity-50" />
              <View className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg opacity-50" />
              <View className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg opacity-50" />
            </View>
          </View>

          {/* Exam Structure Skeleton */}
          <View className="px-6">
            <View className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50 mb-4" />
            <View className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl opacity-50 mb-3" />
            <View className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl opacity-50 mb-3" />
          </View>
        </ScrollView>
      </SafeAreaView>
      </>
    );
  }

  if (!exam) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center" edges={['top']}>
          <Text className="text-xl font-bold text-slate-800 dark:text-slate-200">Exam not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-3 bg-indigo-600 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </>
    );
  }

  const subjectName = exam.subject?.name || 'General';
  const typeLabel = exam.category === 'QUIZ' ? 'Test (Quiz)' : exam.category === 'CA' ? 'Continuous Assessment' : 'Exam';
  const dueDate = exam.endDate ? new Date(exam.endDate) : null;
  
  // Calculate status
  const isTaken = attempt?.status === 'SUBMITTED' || attempt?.status === 'SCORED' || attempt?.status === 'EXPIRED';
  const isSubmitted = isTaken;
  const isGraded = attempt?.status === 'SCORED';
  const resultsReleased = isGraded && (
    exam.allowImmediateResult 
      ? true 
      : exam.resultReleaseAt 
        ? new Date() >= new Date(exam.resultReleaseAt) 
        : false
  );
  const isOverdue = !isTaken && dueDate && new Date() > dueDate;
  const isUpcoming = !isStarted;

  const rawPapers = exam.subjectExamPapers || exam.subjectPapers || [];
  const safePapers = rawPapers.map((p: any) => p.subjectPaper || p);
  const totalDuration = exam.durationMinutes > 0 ? exam.durationMinutes : safePapers.reduce((sum: number, p: any) => sum + (p.durationMinutes || 0), 0) || 0;
  const totalQuestions = exam.questions?.length > 0 ? exam.questions.length : safePapers.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0) || 0;

  const totalMarks = exam.totalMarks > 0 ? exam.totalMarks : safePapers.reduce((sum: number, p: any) => sum + (p.totalMarks || 0), 0) || 0;
  let achievedScore = 0;

  if (resultsReleased && attempt) {
    if (attempt.totalScore !== null && attempt.totalScore !== undefined) {
      achievedScore = attempt.totalScore;
    } else {
      achievedScore = safePapers.reduce((sum: number, p: any) => {
        const pAttempt = attempt.subjectExamAttempts?.find((sa: any) => sa.subjectPaperId === p.id);
        return sum + (pAttempt?.score || 0);
      }, 0);
    }
  }

  const scorePercentage = totalMarks > 0 ? Math.round((achievedScore / totalMarks) * 100) : 0;
  const scoreLabel = `${achievedScore} / ${totalMarks}`;

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'Unlimited';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${mins} mins`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

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
            <ArrowLeft size={20} color="#334155"  />
          </TouchableOpacity>
          <View className="ml-5 flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
              {typeLabel}
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {subjectName}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={isExamRefetching || isAttemptRefetching} 
            onRefresh={onRefresh} 
            colors={["#6366f1"]}
            tintColor="#6366f1"
          />
        }
      >
        
        {/* Title & Status Card */}
        <ImageBackground 
          source={require('@/assets/images/backImage.jpeg')}
          className="bg-white dark:bg-slate-900 p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 dark:border-slate-800 mb-6 overflow-hidden"
          imageStyle={{ opacity: 0.15 }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <Text className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                {exam.category || 'EXAM'}
              </Text>
            </View>

            {isGraded ? (
              <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                <CheckCircle size={12} color="#10b981" style={{ marginRight: 4 }}  />
                <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Graded</Text>
              </View>
            ) : isSubmitted ? (
              <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                <CheckCircle size={12} color="#3b82f6" style={{ marginRight: 4 }}  />
                <Text className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Submitted</Text>
              </View>
            ) : isOverdue ? (
              <View className="flex-row items-center bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800">
                <Text className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Overdue</Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                <Clock size={12} color="#f59e0b" style={{ marginRight: 4 }}  />
                <Text className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Upcoming</Text>
              </View>
            )}
          </View>

          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
            {exam.title}
          </Text>
          
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {exam.description || 'No description provided by the instructor for this assessment.'}
          </Text>

          {/* Exam Instructions */}
          {exam.instructions && isStarted && !isTaken && (
            <View className="mb-6 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4">
              <Text className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-2">Important Instructions</Text>
              <LaTeXRenderer content={exam.instructions} />
            </View>
          )}

          {/* Quick Stats Row */}
          <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Limit</Text>
              <Text className="text-sm font-black text-slate-800 dark:text-slate-200">
                {formatDuration(totalDuration)}
              </Text>
            </View>

            <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-4" />

            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Questions</Text>
              <Text className="text-sm font-black text-slate-800 dark:text-slate-200">
                {totalQuestions}
              </Text>
            </View>

            <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-4" />

            <View className="items-end">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Marks</Text>
              <Text className="text-sm font-black text-slate-800 dark:text-slate-200">
                {exam.totalMarks || 100} Points
              </Text>
            </View>
          </View>
        </ImageBackground>
          
          {safePapers.length > 0 && (
            <View className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 px-6">
              <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Exam Structure</Text>
              <View className="space-y-3">
                {safePapers.map((paper: any) => {
                  const paperAttempt = attempt?.subjectExamAttempts?.find((sa: any) => sa.subjectPaperId === paper.id);
                    const hasScore = resultsReleased && paperAttempt?.score !== undefined;
                    
                    return (
                      <View key={paper.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex-row justify-between items-center mb-3">
                        <View className="flex-1 mr-2">
                          <Text className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                            {paper.title || paper.subject?.name || "Unnamed Paper"}
                          </Text>
                          <Text className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDuration(paper.durationMinutes)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          {hasScore && (
                            <View className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
                              <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                {paperAttempt.score} / {paper.totalMarks || '--'}
                              </Text>
                            </View>
                          )}
                          <View className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl">
                            <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                              {paper.questions?.length || 0} Qs
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
          )}

        <View className="px-6 mb-8">
          <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Deadlines & Rules</Text>
          
          <View className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 items-center justify-center mr-4 shadow-sm">
              <Clock size={18} color="#64748b"  />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Due By</Text>
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                {dueDate ? formatDate(dueDate) : 'No specific deadline'}
              </Text>
            </View>
          </View>

          <View className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 items-center justify-center mr-4 shadow-sm">
              <FileText size={18} color="#64748b"  />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Passing Score</Text>
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                {exam.passingScore || 50}% Minimum Required
              </Text>
            </View>
          </View>
        </View>

        {isGraded && !resultsReleased && (
          <View className="px-6 mb-8">
            <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Your Results</Text>
            <View className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 items-center">
              <View className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full items-center justify-center mb-4">
                <Lock size={24} color="#64748b" />
              </View>
              <Text className="text-lg font-black text-slate-900 dark:text-white mb-2">Results Locked</Text>
              <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Your exam has been graded, but the instructor has set the results to be released {exam.resultReleaseAt ? `on ${formatDate(new Date(exam.resultReleaseAt))}` : 'later'}.
              </Text>
            </View>
          </View>
        )}

        {resultsReleased && (
          <View className="px-6 mb-8">
            <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Your Results</Text>
            
            <View className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-[2rem] p-6 items-center mb-6">
              <Text className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{scorePercentage}%</Text>
              <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-500">
                You scored {scoreLabel} points
              </Text>
            </View>

            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Paper Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible px-2">
              {safePapers.map((paper: any) => {
                const paperAttempt = attempt?.subjectExamAttempts?.find((sa: any) => sa.subjectPaperId === paper.id);
                const score = paperAttempt?.score || 0;
                const total = paper.totalMarks || 0;
                return (
                  <PaperRingChart 
                    key={paper.id} 
                    score={score} 
                    totalMarks={total} 
                    label={paper.title || paper.subject?.name || "Paper"} 
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-0 w-full px-6 py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800" style={{ elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20 }}>
        {isSubmitted ? (
          attempt?.status === 'SUBMITTED' ? (
            <View className="w-full bg-amber-100 dark:bg-amber-900/30 px-4 py-4 rounded-xl flex-row items-center justify-center border border-amber-200 dark:border-amber-800/50">
              <Clock size={20} color="#d97706" style={{ marginRight: 8 }} />
              <Text className="text-amber-800 dark:text-amber-400 font-bold tracking-widest uppercase text-xs">
                Grading in Progress
              </Text>
            </View>
          ) : resultsReleased ? (
            <TouchableOpacity 
              className="w-full h-14 bg-emerald-600 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-600/30"
              activeOpacity={0.8}
              onPress={() => router.push(`/exams/${exam.id}/review`)}
            >
              <Eye size={20} color="white" style={{ marginRight: 8 }}  />
              <Text className="text-sm font-black uppercase tracking-widest text-white">
                Review Attempt
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              className="w-full h-14 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex-row items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.push(`/exams/${exam.id}/review`)}
            >
              <Clock size={20} color="#6366f1" style={{ marginRight: 8 }}  />
              <Text className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Check Status
              </Text>
            </TouchableOpacity>
          )
        ) : isOverdue ? (
          <View className="w-full h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex-row items-center justify-center opacity-80">
            <Text className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Submission Closed
            </Text>
          </View>
        ) : (
          <View className="w-full">
            <View className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 mb-3 flex-row items-start">
               <Text className="text-[10px] font-medium text-amber-600 dark:text-amber-500 flex-1 leading-tight">
                 <Text className="font-bold">Important:</Text> You must start and end this exam on the <Text className="font-bold">same device</Text>. If you resume on a different device, your exam will auto-submit.
               </Text>
            </View>
            <TouchableOpacity 
              className={`w-full h-14 rounded-2xl flex-row items-center justify-center shadow-md ${!isStarted || startAttemptMutation.isPending ? 'bg-slate-200 dark:bg-slate-800 shadow-none' : 'bg-indigo-600 shadow-indigo-600/30'}`}
              activeOpacity={0.8}
              onPress={handleStartAction}
              disabled={!isStarted || startAttemptMutation.isPending}
            >
              {startAttemptMutation.isPending ? (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              ) : (
                <PlayCircle size={20} color={!isStarted ? '#94a3b8' : 'white'} style={{ marginRight: 8 }}  />
              )}
              <Text className={`text-sm font-black uppercase tracking-widest ${!isStarted ? 'text-slate-500 dark:text-slate-400' : 'text-white'}`}>
                {attempt?.status === 'IN_PROGRESS' ? 'Resume Assessment' : (!isStarted && exam.startDate ? `Starts ${formatDate(new Date(exam.startDate))}` : 'Start Assessment')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
    </>
  );
}
