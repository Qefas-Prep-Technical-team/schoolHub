import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, BackHandler, ScrollView, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react-native';
import { useSingleExam, useExamAttempt, useSubmitAttempt, useSaveAnswer } from '@/lib/api/hooks/useExams';
import { showInfoToast, showErrorToast } from '@/lib/utils/toast';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { scheduleLocalNotification } from '@/lib/utils/notifications';

export default function ExamTakeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const examId = Array.isArray(id) ? id[0] : id;

  const { data: examResponse, isLoading: isExamLoading } = useSingleExam(examId || '');
  const { data: attemptData, isLoading: isAttemptLoading } = useExamAttempt(examId || '');
  const submitAttemptMutation = useSubmitAttempt();
  const saveAnswerMutation = useSaveAnswer();

  const exam = examResponse?.data || examResponse;
  const attempt = attemptData?.data || attemptData;

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [showReadingModal, setShowReadingModal] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (attempt?.subjectExamAttempts) {
      const answers: Record<string, string> = {};
      attempt.subjectExamAttempts.forEach((sa: any) => {
        sa.answers?.forEach((ans: any) => {
          answers[ans.questionId] = ans.answer;
        });
      });
      setLocalAnswers(answers);
    }
  }, [attempt]);

  // Handle already submitted attempts
  useEffect(() => {
    if (attempt?.status === 'SUBMITTED' || attempt?.status === 'SCORED' || attempt?.status === 'EXPIRED') {
      router.replace(`/exams/${examId}/review`);
    }
  }, [attempt?.status, examId, router]);

  // Prevent hardware back button on Android
  useEffect(() => {
    const onBackPress = () => {
      showErrorToast({ title: 'Action Blocked', message: 'You cannot leave an ongoing exam.' });
      return true; // Return true to stop default back action
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, []);

  // Timer logic
  const totalDuration = useMemo(() => {
    const min = exam?.durationMinutes || attempt?.exam?.durationMinutes;
    if (min && min > 0) return min;
    const papers = attempt?.subjectExamAttempts?.map((sa: any) => sa.subjectPaper) || exam?.subjectPapers || [];
    return papers.reduce((sum: number, p: any) => sum + (p?.durationMinutes || 0), 0) || 0;
  }, [exam, attempt]);

  const handleSubmission = useCallback(async (isAutoSubmit: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (isAutoSubmit) {
      showInfoToast({ title: 'Time Up!', message: 'Submitting exam automatically...' });
    } else {
      showInfoToast({ title: 'Submitting...', message: 'Please wait while we save your exam.' });
    }
    
    try {
      await submitAttemptMutation.mutateAsync(examId as string);
      scheduleLocalNotification(
        "Exam Submitted Successfully! 🎉", 
        `Your submission for ${exam.title || 'the exam'} has been recorded. Check back later for your score.`
      );
      router.replace(`/exams/${examId}/review`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showErrorToast({ title: 'Submission Failed', message: 'An error occurred. Please try again.' });
    }
  }, [examId, isSubmitting, router, submitAttemptMutation]);

  useEffect(() => {
    if (attempt?.startedAt && totalDuration > 0 && attempt.status === "IN_PROGRESS") {
      const calculateInitial = () => {
        const startedAt = new Date(attempt.startedAt).getTime();
        const now = new Date().getTime();
        const totalDurationSeconds = totalDuration * 60;
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        return Math.max(0, totalDurationSeconds - elapsedSeconds);
      };

      setRemainingSeconds(calculateInitial());

      const interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 0) {
            if (prev === 0 && attempt.status === "IN_PROGRESS") {
              handleSubmission(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [attempt?.startedAt, attempt?.status, totalDuration, handleSubmission]);

  // Group papers and their questions
  const papersData = useMemo(() => {
    if (!attempt?.subjectExamAttempts) return [];
    
    return attempt.subjectExamAttempts.map((paperAttempt: any) => {
      const subjectPaperId = paperAttempt.subjectPaperId;
      const subjectName = paperAttempt.subjectPaper?.subject?.name || "Subject Paper";
      const paperQuestions = paperAttempt.subjectPaper?.questions || [];
      const sortedQuestions = [...paperQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return {
        id: subjectPaperId,
        subjectName,
        instructions: paperAttempt.subjectPaper?.instructions,
        readingContent: paperAttempt.subjectPaper?.readingContent,
        questions: sortedQuestions.map((q: any) => ({ ...q, subjectPaperId }))
      };
    });
  }, [attempt]);

  if (isExamLoading || isAttemptLoading || !exam || !attempt) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  // Format timer
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (question: any, optionValue: string) => {
    if (localAnswers[question.id] === optionValue) return;

    // Optimistic UI update
    setLocalAnswers(prev => ({ ...prev, [question.id]: optionValue }));

    // Call mutation in background
    saveAnswerMutation.mutate({
      examId: exam.id,
      payload: {
        subjectPaperId: question.subjectPaperId,
        questionId: question.id,
        answer: optionValue
      }
    });
  };

  const handleTextChange = (question: any, text: string) => {
    setLocalAnswers(prev => ({ ...prev, [question.id]: text }));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      saveAnswerMutation.mutate({
        examId: exam.id,
        payload: {
          subjectPaperId: question.subjectPaperId,
          questionId: question.id,
          answer: text
        }
      });
    }, 1000);
  };

  const currentPaper = papersData[currentPaperIndex];
  const allQuestions = currentPaper?.questions || [];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;
  const answeredCount = allQuestions.filter((q: any) => !!localAnswers[q.id]).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'bottom']}>
      {/* Disable back navigation gestures entirely */}
      <Stack.Screen options={{ 
        headerShown: false, 
        gestureEnabled: false, 
      }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-1">
          <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>{exam.title}</Text>
        </View>
        <View className="bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded flex-row items-center ml-2 border border-amber-200 dark:border-amber-900/50">
           <AlertCircle size={12} color="#d97706" style={{ marginRight: 4 }} />
           <Text className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
             Auto-Submit on Multi-Device
           </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Countdown displayed prominently above everything else */}
        <View className="bg-indigo-600 px-4 py-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center">
            <Clock size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-black text-xl tracking-wider">
              {remainingSeconds !== null ? formatTime(remainingSeconds) : 'NO TIME LIMIT'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Progress</Text>
            <Text className="text-white font-bold text-xs">{answeredCount} Answered / {unansweredCount} Unanswered</Text>
          </View>
        </View>

        {/* Subject Papers Tabs */}
        {papersData.length > 1 && (
          <View className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
              {papersData.map((paper: any, idx: number) => {
                const isSelected = idx === currentPaperIndex;
                return (
                  <TouchableOpacity 
                    key={paper.id}
                    onPress={() => {
                      setCurrentPaperIndex(idx);
                      setCurrentQuestionIndex(0);
                    }}
                    className={`px-4 py-2 rounded-full border flex-row items-center ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <BookOpen size={14} color={isSelected ? '#4f46e5' : '#64748b'} style={{ marginRight: 6 }} />
                    <Text className={`font-bold text-sm ${
                      isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {paper.subjectName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Instructions & Reading Content Button */}
        {currentPaper && (currentPaper.instructions || currentPaper.readingContent) && (
          <View className="px-6 mt-6">
            <TouchableOpacity 
              onPress={() => setShowReadingModal(true)}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex-row items-center"
              activeOpacity={0.7}
            >
              <BookOpen size={24} color="#d97706" style={{ marginRight: 16 }} />
              <View className="flex-1">
                <Text className="text-amber-900 dark:text-amber-500 font-bold text-base">Instructions & Reading</Text>
                <Text className="text-amber-700/80 dark:text-amber-500/80 text-xs mt-1">Tap here to view the reading passage or instructions for this paper.</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content Area */}
        <View className="px-6 pt-6">
          {currentQuestion ? (
            <View className="w-full bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
               <View className="flex-row items-center justify-between mb-4">
                 <Text className="text-lg font-bold text-slate-800 dark:text-slate-200">
                   Question {currentQuestionIndex + 1}
                 </Text>
                 <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                   {currentQuestion.marks} Marks
                 </Text>
               </View>
               
               {/* Images */}
               {currentQuestion.images && currentQuestion.images.length > 0 && (
                 <View className="mb-4 space-y-4">
                   {currentQuestion.images.map((img: string, i: number) => (
                     <View key={i} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                       <Image 
                         source={{ uri: img }} 
                         style={{ width: '100%', height: 200, resizeMode: 'contain' }} 
                       />
                       {currentQuestion.imageLabels?.[i] && (
                         <Text className="text-center text-xs text-slate-500 italic py-2">
                           {currentQuestion.imageLabels[i]}
                         </Text>
                       )}
                     </View>
                   ))}
                 </View>
               )}

               {/* Question Text (LaTeX & Markdown Support) */}
               <View className="mb-6">
                 <LaTeXRenderer content={currentQuestion.question} />
               </View>

               {/* Equation Block */}
               {currentQuestion.equation && (
                 <View className="mb-6 rounded-lg bg-slate-100 dark:bg-slate-800 p-4 items-center">
                   <Text className="font-mono text-lg text-slate-800 dark:text-slate-200">{currentQuestion.equation}</Text>
                 </View>
               )}
               
               {/* Options or Essay */}
               {currentQuestion.type === "SHORT_ANSWER" ? (
                 <View className="space-y-2 mt-2">
                   <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Your Answer</Text>
                   <TextInput
                     className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
                     style={{ minHeight: 120, textAlignVertical: 'top' }}
                     multiline
                     placeholder="Type your essay/answer here..."
                     placeholderTextColor="#94a3b8"
                     value={localAnswers[currentQuestion.id] || ''}
                     onChangeText={(text) => handleTextChange(currentQuestion, text)}
                   />
                 </View>
               ) : currentQuestion.type === "TRUE_FALSE" ? (
                 <View className="space-y-3">
                   {[
                     { key: 'True', value: 'True' },
                     { key: 'False', value: 'False' },
                   ].map((opt) => {
                     const isSelected = localAnswers[currentQuestion.id] === opt.key;
                     return (
                       <TouchableOpacity 
                         key={opt.key} 
                         onPress={() => handleSelectOption(currentQuestion, opt.key)}
                         className={`w-full p-4 rounded-xl border mb-3 flex-row items-center ${
                           isSelected 
                             ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                             : 'border-slate-200 dark:border-slate-700'
                         }`}
                         activeOpacity={0.7}
                       >
                         <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                           isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                         }`}>
                           {isSelected && <Check size={12} color="white" />}
                         </View>
                         <Text className={`flex-1 text-base ${
                           isSelected ? 'text-indigo-900 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'
                         }`}>
                           {opt.value}
                         </Text>
                       </TouchableOpacity>
                     );
                   })}
                 </View>
               ) : (
                 <View className="space-y-3">
                   {[
                     { key: 'A', value: currentQuestion.optionA },
                     { key: 'B', value: currentQuestion.optionB },
                     { key: 'C', value: currentQuestion.optionC },
                     { key: 'D', value: currentQuestion.optionD },
                   ].map((opt) => {
                     if (!opt.value) return null;
                     
                     const isSelected = localAnswers[currentQuestion.id] === opt.key;
                     
                     return (
                       <TouchableOpacity 
                         key={opt.key} 
                         onPress={() => handleSelectOption(currentQuestion, opt.key)}
                         className={`w-full p-4 rounded-xl border mb-3 flex-row items-center ${
                           isSelected 
                             ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                             : 'border-slate-200 dark:border-slate-700'
                         }`}
                         activeOpacity={0.7}
                       >
                         <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                           isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                         }`}>
                           {isSelected && <Check size={12} color="white" />}
                         </View>
                         <Text className={`flex-1 text-base ${
                           isSelected ? 'text-indigo-900 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'
                         }`}>
                           {opt.value}
                         </Text>
                       </TouchableOpacity>
                     );
                   })}
                 </View>
               )}

               {/* Prev/Next Buttons inside Question Card */}
               <View className="flex-row justify-between items-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <TouchableOpacity 
                   className={`px-4 py-2 rounded-lg flex-row items-center ${currentQuestionIndex === 0 ? 'opacity-50' : ''}`}
                   disabled={currentQuestionIndex === 0}
                   onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                 >
                   <ChevronLeft size={20} color="#64748b" />
                   <Text className="font-bold text-slate-600 dark:text-slate-400 ml-1">Prev</Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   className={`px-4 py-2 rounded-lg flex-row items-center ${currentQuestionIndex === totalQuestions - 1 ? 'opacity-50' : ''}`}
                   disabled={currentQuestionIndex === totalQuestions - 1}
                   onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
                 >
                   <Text className="font-bold text-slate-600 dark:text-slate-400 mr-1">Next</Text>
                   <ChevronRight size={20} color="#64748b" />
                 </TouchableOpacity>
               </View>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-slate-500 text-center">No questions available in this subject paper.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Fixed Area: Question Grid & Submit Button */}
      <View className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2">
        <View className="px-4 pb-2">
          <Text className="text-xs font-bold text-slate-500 mb-2 px-2 uppercase tracking-widest">Question Navigation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 10, paddingBottom: 12 }}>
            {allQuestions.map((q: any, idx: number) => {
              const isAnswered = !!localAnswers[q.id];
              const isCurrent = idx === currentQuestionIndex;
              return (
                <TouchableOpacity 
                  key={q.id}
                  onPress={() => setCurrentQuestionIndex(idx)}
                  className={`w-11 h-11 rounded-full items-center justify-center border-2 ${
                    isCurrent 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
                      : isAnswered
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <Text className={`font-black text-sm ${
                    isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isAnswered ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500'
                  }`}>
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Submit Exam Button Below the Grid */}
        <View className="px-6 pb-6 pt-2">
          <TouchableOpacity 
            className="w-full py-4 bg-emerald-600 rounded-xl flex-row items-center justify-center shadow-sm shadow-emerald-600/30"
            onPress={() => {
              Alert.alert(
                "Submit Exam",
                "Are you sure you want to submit your exam?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Submit", onPress: () => handleSubmission(false) }
                ]
              );
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="white" /> : <CheckCircle size={20} color="white" style={{ marginRight: 8 }} />}
            <Text className="text-white font-black uppercase tracking-widest text-sm">Submit Exam</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reading / Instructions Modal */}
      <Modal visible={showReadingModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowReadingModal(false)}>
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950" edges={['top']}>
           <View className="flex-row justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
             <Text className="text-lg font-black text-slate-900 dark:text-white">Instructions & Reading</Text>
             <TouchableOpacity onPress={() => setShowReadingModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
               <Text className="font-bold text-slate-700 dark:text-slate-300">Close</Text>
             </TouchableOpacity>
           </View>
           <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 40 }}>
             {currentPaper?.instructions && (
               <View className="mb-8">
                 <Text className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Paper Instructions</Text>
                 <LaTeXRenderer content={currentPaper.instructions} />
               </View>
             )}
             {currentPaper?.readingContent && (
               <View className="mb-8">
                 <Text className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Reading Passage</Text>
                 <LaTeXRenderer content={currentPaper.readingContent} />
               </View>
             )}
           </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
