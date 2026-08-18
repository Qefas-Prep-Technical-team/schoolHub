import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle, Eye, Clock } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSingleExam, useExamReview, useExamAttempt } from '@/lib/api/hooks/useExams';
import { useAuthUser } from '@/lib/api/hooks/useAuth';

export default function ExamReviewScreen() {
  const router = useRouter();
  const { id, studentId } = useLocalSearchParams();
  const examId = Array.isArray(id) ? id[0] : id;
  const childId = Array.isArray(studentId) ? studentId[0] : studentId;

  const { data: examResponse, isLoading: isLoadingExam, refetch: refetchExam } = useSingleExam(examId || '');
  const exam = examResponse?.data || examResponse;
  
  const { data: attemptData, isLoading: isLoadingAttempt, refetch: refetchAttempt } = useExamAttempt(examId || '', childId);
  const attempt = attemptData?.data || attemptData;
  
  const { data: review, isLoading: isLoadingReview, refetch: refetchReview } = useExamReview(examId || '', childId);

  const { data: user } = useAuthUser();
  const returnPath = user?.role === 'PARENT' ? '/(parent-tabs)/exams' : '/(student-tabs)/grades';

  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchExam(),
        refetchAttempt(),
        refetchReview()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchExam, refetchAttempt, refetchReview]);

  if (isLoadingExam || isLoadingReview || isLoadingAttempt) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  if (!review) {
    if (attempt?.status === 'SUBMITTED') {
      return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 items-center justify-center">
          <Stack.Screen options={{ headerShown: false }} />
          <View className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-6">
            <CheckCircle2 size={48} color="#10b981" />
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2">Exam Submitted!</Text>
          <Text className="text-slate-500 text-center leading-relaxed max-w-[80%]">
            Your exam has been successfully submitted and is currently pending manual review by your instructor. Check back later for your final grade!
          </Text>
          <TouchableOpacity 
            className="mt-8 bg-indigo-600 px-8 py-4 rounded-xl flex-row items-center shadow-sm shadow-indigo-600/30"
            onPress={() => router.replace(returnPath as any)}
          >
            <Text className="text-white font-black tracking-widest uppercase text-xs">Return to Exams & Results</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView 
          contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} tintColor="#6366f1" />
          }
        >
          <View className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-6">
            <Clock size={48} color="#6366f1" />
        </View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2">Results Pending</Text>
          <Text className="text-slate-500 text-center leading-relaxed max-w-[80%]">
            Detailed reviews and scores will be available once the instructor officially releases the results. Pull down to refresh and check again.
          </Text>
          <TouchableOpacity 
            className="mt-8 bg-indigo-600 px-8 py-4 rounded-xl flex-row items-center shadow-sm shadow-indigo-600/30"
            onPress={() => router.replace(returnPath as any)}
          >
            <Text className="text-white font-black tracking-widest uppercase text-xs">Return to Exams & Results</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const subjects = review.subjects || [];
  const currentSubject = subjects[activeSubjectIndex];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#0B0F1A]" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
        >
          <ArrowLeft size={20} color="#334155"  />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-black text-slate-900 dark:text-white uppercase italic" numberOfLines={1}>
            Review Session
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="w-4 h-1 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" numberOfLines={1}>
              {exam?.title || "Examination Review"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} tintColor="#6366f1" />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        
        {/* Subject Tabs */}
        {subjects.length > 0 && (
          <View className="bg-white dark:bg-slate-900 py-4 border-b border-slate-100 dark:border-slate-800">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {subjects.map((sub: any, idx: number) => {
                const isActive = activeSubjectIndex === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveSubjectIndex(idx)}
                    className={`px-6 py-2.5 rounded-full mr-3 ${
                      isActive ? 'bg-emerald-600' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <Text className={`text-xs font-black uppercase tracking-widest ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {sub.subjectName || "Subject"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!currentSubject ? (
          <View className="p-10 items-center justify-center">
            <HelpCircle size={48} color="#cbd5e1" style={{ marginBottom: 16 }}  />
            <Text className="text-lg font-bold text-slate-500 text-center">No subjects found in this review.</Text>
          </View>
        ) : (
          <View className="p-4">
            
            {/* Subject Mastery Card */}
            <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 items-center">
              <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Subject Mastery</Text>
              
              <View className="items-center justify-center mb-6">
                <View className="relative w-32 h-32 items-center justify-center">
                  <Svg width="128" height="128" viewBox="0 0 128 128">
                    <Circle
                      stroke="#f1f5f9" // slate-100
                      strokeWidth="12"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <Circle
                      stroke="#10b981" // emerald-500
                      strokeWidth="12"
                      strokeDasharray="351.86"
                      strokeDashoffset={351.86 - (351.86 * ((currentSubject.score || 0) / (currentSubject.totalMarks || 1)))}
                      strokeLinecap="round"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                      rotation="-90"
                      origin="64, 64"
                    />
                  </Svg>
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-3xl font-black text-slate-900 dark:text-white">
                      {Math.round(((currentSubject.score || 0) / (currentSubject.totalMarks || 1)) * 100)}%
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row w-full justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-3">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</Text>
                <Text className="font-black text-slate-900 dark:text-white">{currentSubject.score || 0} / {currentSubject.totalMarks || 0}</Text>
              </View>
              <View className="flex-row w-full justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</Text>
                <Text className="font-black text-slate-900 dark:text-white">{currentSubject.questions?.length || 0}</Text>
              </View>
            </View>

            {/* Questions Stream */}
            <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Questions Stream</Text>
            
            {!currentSubject.questions || currentSubject.questions.length === 0 ? (
              <View className="p-10 rounded-[2rem] bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 items-center">
                <HelpCircle size={32} color="#cbd5e1" style={{ marginBottom: 12 }}  />
                <Text className="font-bold text-slate-500 text-center">Zero Data points</Text>
              </View>
            ) : (
              <View className="space-y-6">
                {currentSubject.questions.map((q: any, idx: number) => {
                  const isCorrect = q.studentAnswer === q.correctAnswer;
                  
                  return (
                    <View key={idx} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 shadow-sm">
                      
                      {/* Question Header */}
                      <View className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <View className="bg-slate-200 dark:bg-slate-700 w-8 h-8 rounded-lg items-center justify-center mr-3">
                            <Text className="text-slate-600 dark:text-slate-300 font-black text-xs">{idx + 1}</Text>
                          </View>
                          <View className={`h-8 w-8 rounded-xl items-center justify-center mr-3 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            {isCorrect ? <CheckCircle2 size={16} color="white" /> : <XCircle size={16} color="white" />}
                          </View>
                          <Text className={`text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isCorrect ? 'Precision Perfect' : 'Learning Opportunity'}
                          </Text>
                        </View>
                        <View className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Value: {q.maxMarks || 0} Pts
                          </Text>
                        </View>
                      </View>

                      {/* Question Content */}
                      <View className="p-5">
                        {q.images && q.images.length > 0 && (
                          <View className="mb-4 space-y-3">
                            {q.images.map((url: string, i: number) => (
                              <Image 
                                key={i}
                                source={{ uri: url }}
                                className="w-full h-40 rounded-xl bg-slate-100 dark:bg-slate-800"
                                resizeMode="cover"
                              />
                            ))}
                          </View>
                        )}
                        
                        <Text className="text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
                          {q.question}
                        </Text>

                        {/* MCQ / TRUE_FALSE */}
                        {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                          <View className="space-y-3">
                            {(() => {
                              const options = (q.type === 'TRUE_FALSE' && (!q.options || !q.options.optionA))
                                  ? { optionA: 'True', optionB: 'False' }
                                  : (q.options || {});
                              
                              return Object.entries(options).map(([key, option]: [string, any]) => {
                                  if (!option) return null;
                                  const label = key.replace('option', '');
                                  const isStudent = q.studentAnswer === label || (q.type === 'TRUE_FALSE' && q.studentAnswer?.toLowerCase() === option.toLowerCase());
                                  const isCorrectOpt = q.correctAnswer === label || (q.type === 'TRUE_FALSE' && q.correctAnswer?.toLowerCase() === option.toLowerCase());
                                  
                                  let bgClass = "bg-slate-50 dark:bg-slate-800";
                                  let borderClass = "border-transparent";
                                  let textClass = "text-slate-600 dark:text-slate-300";
                                  let labelBgClass = "bg-white dark:bg-slate-700";
                                  let labelTextClass = "text-slate-400";

                                  if (isCorrectOpt) {
                                    bgClass = "bg-emerald-50 dark:bg-emerald-900/20";
                                    borderClass = "border-emerald-200 dark:border-emerald-800";
                                    textClass = "text-emerald-900 dark:text-emerald-100";
                                    labelBgClass = "bg-emerald-500";
                                    labelTextClass = "text-white";
                                  } else if (isStudent) {
                                    bgClass = "bg-rose-50 dark:bg-rose-900/20";
                                    borderClass = "border-rose-200 dark:border-rose-800";
                                    textClass = "text-rose-900 dark:text-rose-100";
                                    labelBgClass = "bg-rose-500";
                                    labelTextClass = "text-white";
                                  }

                                  return (
                                    <View key={key} className={`flex-row items-center p-4 rounded-2xl border ${borderClass} ${bgClass} mb-2`}>
                                      <View className={`h-8 w-8 rounded-xl items-center justify-center mr-3 ${labelBgClass}`}>
                                        <Text className={`text-[10px] font-black ${labelTextClass}`}>{label}</Text>
                                      </View>
                                      <Text className={`flex-1 font-bold text-sm ${textClass}`}>
                                        {option}
                                      </Text>
                                      {isCorrectOpt && <CheckCircle2 size={20} color="#10b981"  />}
                                      {!isCorrectOpt && isStudent && <XCircle size={20} color="#f43f5e"  />}
                                    </View>
                                  );
                              });
                            })()}
                          </View>
                        )}

                        {/* Short Answer */}
                        {(q.type === 'SHORT_ANSWER' || (!q.options && q.type !== 'TRUE_FALSE')) && (
                          <View className="space-y-4">
                            <View className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
                              <Text className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Your Submission</Text>
                              <Text className="text-sm font-bold text-rose-900 dark:text-rose-100 italic">
                                {q.studentAnswer || "Explicit refusal/omission"}
                              </Text>
                            </View>
                            <View className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                              <Text className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Validated Criterion</Text>
                              <Text className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                                {q.correctAnswer}
                              </Text>
                            </View>
                          </View>
                        )}

                      </View>
                    </View>
                  );
                })}
              </View>
            )}

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
