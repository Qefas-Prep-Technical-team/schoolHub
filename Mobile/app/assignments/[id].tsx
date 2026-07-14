import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet, RefreshControl, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle, FileText, Upload, Link as LinkIcon, PlayCircle, Eye, Paperclip, Video } from 'lucide-react-native';
import { useAssignmentById, useSubmitAssignment } from '@/lib/api/hooks/useAssignments';
import Toast from 'react-native-toast-message';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

const DeferredTab = ({ isActive, children }: { isActive: boolean, children: React.ReactNode }) => {
  const [hasRendered, setHasRendered] = useState(isActive);

  useEffect(() => {
    if (isActive && !hasRendered) {
      // Allow the UI to update the active tab button first before rendering content
      const timer = setTimeout(() => {
        setHasRendered(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isActive, hasRendered]);

  if (!hasRendered && !isActive) return null;

  return (
    <View style={{ display: isActive ? 'flex' : 'none' }}>
      {!hasRendered ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading content...</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
};

export default function AssignmentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const assignmentId = Array.isArray(id) ? id[0] : id;

  const { data: assignmentData, isLoading, isPending, refetch, isRefetching } = useAssignmentById(assignmentId || '');
  const submitAssignmentMutation = useSubmitAssignment();

  const [activeTab, setActiveTab] = useState<'instructions' | 'materials' | 'quiz'>('instructions');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [isAnswersInitialized, setIsAnswersInitialized] = useState(false);

  const handleTabPress = (tabName: 'instructions' | 'materials' | 'quiz') => {
    setActiveTab(tabName);
  };

  const assignment = assignmentData;
  const isGraded = assignment?.status === 'GRADED' || assignment?.status === 'graded' || assignment?.submissions?.[0]?.status === 'GRADED' || assignment?.submissions?.[0]?.status === 'graded';
  const isSubmitted = assignment?.status === 'SUBMITTED' || assignment?.status === 'submitted' || assignment?.submissions?.[0]?.status === 'SUBMITTED' || assignment?.submissions?.[0]?.status === 'submitted';
  const isLocked = isSubmitted || isGraded;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Refetch on mount
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (assignment && Array.isArray(assignment?.submissions?.[0]?.answers) && !isAnswersInitialized) {
      const initialAnswers: Record<string, string> = {};
      assignment.submissions[0].answers.forEach((ans: any) => {
        initialAnswers[ans.questionId] = ans.answer;
      });
      setQuizAnswers(initialAnswers);
      setIsAnswersInitialized(true);
    } else if (assignment && !Array.isArray(assignment?.submissions?.[0]?.answers)) {
      setIsAnswersInitialized(true);
    }
  }, [assignment, isAnswersInitialized]);

  // Debounced auto-save for draft
  useEffect(() => {
    if (!isAnswersInitialized || !assignment) return;
    if (isLocked) return;

    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount === 0) return;

    const savedAnswers = assignment?.submissions?.[0]?.answers;
    const savedAnswersArray = Array.isArray(savedAnswers) ? savedAnswers : [];
    
    const isDifferent = Object.entries(quizAnswers).some(([qId, ansVal]) => {
      const savedAns = savedAnswersArray.find((sa: any) => sa.questionId === qId);
      return !savedAns || savedAns.answer !== ansVal;
    }) || savedAnswersArray.length !== answeredCount;

    if (!isDifferent) return;

    const timer = setTimeout(() => {
      const formattedAnswers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      submitAssignmentMutation.mutate({
        id: assignmentId,
        data: {
          answers: formattedAnswers,
          isDraft: true,
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [quizAnswers, assignmentId, isAnswersInitialized, isLocked]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (isLocked) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleFinalSubmit = () => {
    if (isLocked) return;
    
    const formattedAnswers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    submitAssignmentMutation.mutate({
      id: assignmentId,
      data: {
        answers: formattedAnswers,
        isDraft: false,
      }
    }, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Assignment submitted successfully!' });
        refetch();
      },
      onError: (err: any) => {
        Toast.show({ type: 'error', text1: 'Error', text2: err?.response?.data?.message || 'Failed to submit assignment' });
      }
    });
  };

  if (isLoading || isPending) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 opacity-50" />
          <View className="ml-5 flex-1">
            <View className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Main Card Skeleton */}
          <View className="bg-white dark:bg-slate-900 p-6 rounded-b-[2.5rem] shadow-sm mb-6 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row justify-between mb-4">
              <View className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
              <View className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
            </View>
            <View className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50 mb-6 mt-2" />
            <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
              <View className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg opacity-50" />
              <View className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg opacity-50" />
            </View>
          </View>

          {/* Tabs Skeleton */}
          <View className="px-6 mb-6">
            <View className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl opacity-50" />
          </View>

          {/* Content Skeleton */}
          <View className="px-6">
            <View className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50 mb-4" />
            <View className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl opacity-50 mb-3" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center" edges={['top']}>
        <Text className="text-xl font-bold text-slate-800 dark:text-slate-200">Assignment not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-3 bg-indigo-600 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = !isLocked && dueDate && new Date() > dueDate;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEmbedUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    return url;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#334155" />
          </TouchableOpacity>
          <View className="ml-5 flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
              Assignment Details
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
            refreshing={isRefetching} 
            onRefresh={onRefresh} 
            tintColor="#6366f1"
          />
        }
      >
        <View 
          className="bg-white dark:bg-slate-900 p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 dark:border-slate-800 mb-6 overflow-hidden"
        >
          <Image 
            source={require('@/assets/images/student-bg.png')}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.15 }]}
            resizeMode="cover"
          />
          <View className="flex-row items-center justify-between mb-4">
            <View className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <Text className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Assignment
              </Text>
            </View>

            {isGraded ? (
              <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                <View className="mr-1"><CheckCircle size={12} color="#10b981" /></View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Graded</Text>
              </View>
            ) : isSubmitted ? (
              <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                <View className="mr-1"><CheckCircle size={12} color="#3b82f6" /></View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Submitted</Text>
              </View>
            ) : isOverdue ? (
              <View className="flex-row items-center bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800">
                <Text className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Overdue</Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                <View className="mr-1"><Clock size={12} color="#f59e0b" /></View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Pending</Text>
              </View>
            )}
          </View>

          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
            {assignment.title}
          </Text>

          {/* Quick Stats Row */}
          <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-4">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</Text>
              <Text className="text-sm font-black text-slate-800 dark:text-slate-200">
                {dueDate ? formatDate(dueDate) : 'No Deadline'}
              </Text>
            </View>

            <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-4" />

            <View className="items-end">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Marks</Text>
              <Text className="text-sm font-black text-slate-800 dark:text-slate-200">
                {isGraded && assignment.grade ? `${assignment.grade} / ` : ''}{assignment.totalMarks || 100} Points
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-slate-200/50 dark:bg-slate-800/50 rounded-xl p-1">
            <TouchableOpacity 
              onPress={() => handleTabPress('instructions')}
              className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'instructions' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === 'instructions' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Instructions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleTabPress('materials')}
              className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'materials' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === 'materials' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Materials</Text>
            </TouchableOpacity>

            {assignment?.questions && assignment.questions.length > 0 ? (
              <TouchableOpacity 
                onPress={() => handleTabPress('quiz')}
                className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              >
                <Text className={`text-xs font-bold ${activeTab === 'quiz' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Quiz</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Tab Content */}
        <View style={{ flex: 1, minHeight: 600 }}>
          <DeferredTab isActive={activeTab === 'instructions'}>
            <View className="px-6">
            <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <Text className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Instructions</Text>
              {assignment.instructions ? (
                <LaTeXRenderer content={assignment.instructions} />
              ) : (
                <Text className="text-sm text-slate-500 dark:text-slate-400 italic">No instructions provided.</Text>
              )}
            </View>
            </View>
          </DeferredTab>

          <DeferredTab isActive={activeTab === 'materials'}>
            <View className="px-6 gap-4">
            {assignment.attachmentUrl ? (
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Attachment</Text>
                <TouchableOpacity 
                  className="flex-row items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"
                  onPress={() => Linking.openURL(assignment.attachmentUrl!)}
                >
                  <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 items-center justify-center mr-4">
                    <Paperclip size={18} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">View Attachment</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">Tap to open file</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {assignment.videoUrl ? (
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Video Reference</Text>
                <TouchableOpacity 
                  className="flex-row items-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800"
                  onPress={() => Linking.openURL(assignment.videoUrl!)}
                >
                  <View className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-800 items-center justify-center mr-4">
                    <Video size={18} color="#e11d48" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">Watch Video</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">Tap to open video link</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {assignment.referenceUrl ? (
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">External Reference</Text>
                <TouchableOpacity 
                  className="flex-row items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800"
                  onPress={() => Linking.openURL(assignment.referenceUrl!)}
                >
                  <View className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 items-center justify-center mr-4">
                    <LinkIcon size={18} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">Open Link</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">Tap to open reference</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {!assignment.attachmentUrl && !assignment.videoUrl && !assignment.referenceUrl ? (
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <Text className="text-sm text-slate-500 dark:text-slate-400 italic">No additional materials provided.</Text>
              </View>
            ) : null}
            </View>
          </DeferredTab>

          {assignment.questions ? (
            <DeferredTab isActive={activeTab === 'quiz'}>
              <View className="px-6 gap-4">
              {isLocked && !isGraded ? (
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-2 border border-blue-100 dark:border-blue-800">
                  <Text className="text-xs text-blue-700 dark:text-blue-400 font-medium">Your submission is currently locked for review.</Text>
                </View>
              ) : null}
              
              {assignment.questions.map((q: any, idx: number) => (
                <View key={q.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <View className="flex-row items-start justify-between mb-4 gap-2">
                    <Text className="flex-1 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {idx + 1}. {q.question}
                    </Text>
                    <View className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{q.marks} Marks</Text>
                    </View>
                  </View>

                  {q.type === 'MULTIPLE_CHOICE' && (
                    <View className="gap-2">
                      {['optionA', 'optionB', 'optionC', 'optionD'].map((optKey) => {
                        const optionVal = q[optKey];
                        if (!optionVal) return null;
                        const optionLetter = optKey.replace('option', '');
                        const isSelected = quizAnswers[q.id] === optionLetter;
                        const isCorrectAnswer = isGraded && q.correctAnswer === optionLetter;
                        
                        let labelClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50';
                        if (isGraded) {
                          if (isCorrectAnswer) {
                            labelClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                          } else if (isSelected && !isCorrectAnswer) {
                            labelClass = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
                          } else {
                            labelClass = 'border-slate-200 dark:border-slate-800 opacity-50';
                          }
                        } else if (isSelected) {
                          labelClass = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
                        }

                        return (
                          <TouchableOpacity
                            key={optKey}
                            activeOpacity={0.7}
                            disabled={isLocked}
                            onPress={() => handleAnswerChange(q.id, optionLetter)}
                            className={`flex-row items-center p-4 rounded-xl border ${labelClass}`}
                          >
                            <View className={`w-5 h-5 rounded-full border items-center justify-center mr-3 
                              ${isSelected ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}
                              ${isGraded && isCorrectAnswer ? 'border-emerald-500 bg-emerald-500' : ''}
                              ${isGraded && isSelected && !isCorrectAnswer ? 'border-rose-500 bg-rose-500' : ''}
                              ${!isGraded && isSelected ? 'bg-indigo-500' : ''}
                            `}>
                              {(isSelected || (isGraded && isCorrectAnswer)) && (
                                <View className={`w-2 h-2 rounded-full bg-white`} />
                              )}
                            </View>
                            <Text className={`flex-1 text-sm ${isSelected ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                              {optionVal}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {q.type === 'TRUE_FALSE' && (
                    <View className="flex-row gap-3">
                      {['True', 'False'].map((val) => {
                        const isSelected = quizAnswers[q.id] === val;
                        const isCorrectAnswer = isGraded && q.correctAnswer === val;
                        
                        let labelClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50';
                        if (isGraded) {
                          if (isCorrectAnswer) {
                            labelClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                          } else if (isSelected && !isCorrectAnswer) {
                            labelClass = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
                          } else {
                            labelClass = 'border-slate-200 dark:border-slate-800 opacity-50';
                          }
                        } else if (isSelected) {
                          labelClass = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
                        }

                        return (
                          <TouchableOpacity
                            key={val}
                            activeOpacity={0.7}
                            disabled={isLocked}
                            onPress={() => handleAnswerChange(q.id, val)}
                            className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border ${labelClass}`}
                          >
                            <Text className={`text-sm ${isSelected ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                              {val}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {q.type === 'SHORT_ANSWER' && (
                    <View>
                      <TextInput
                        value={quizAnswers[q.id] || ''}
                        onChangeText={(text) => handleAnswerChange(q.id, text)}
                        placeholder="Type your answer here..."
                        placeholderTextColor="#94a3b8"
                        editable={!isLocked}
                        multiline
                        numberOfLines={3}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-white ${isLocked ? 'opacity-70' : ''}`}
                        style={{ textAlignVertical: 'top' }}
                      />
                      {isGraded && q.correctAnswer && (
                        <View className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                          <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Correct Answer:</Text>
                          <Text className="text-sm text-emerald-600 dark:text-emerald-300">{q.correctAnswer}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {q.type === 'FILE_UPLOAD' && (
                    <View>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        File uploads are handled separately. Please leave any related notes below.
                      </Text>
                      <TextInput
                        value={quizAnswers[q.id] || ''}
                        onChangeText={(text) => handleAnswerChange(q.id, text)}
                        placeholder="Type reference notes or file name..."
                        placeholderTextColor="#94a3b8"
                        editable={!isLocked}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-white ${isLocked ? 'opacity-70' : ''}`}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
            </DeferredTab>
          ) : null}
        </View>

      </ScrollView>

      {/* Floating Action Bar */}
      {!isLocked && (
        <View className="absolute bottom-0 w-full px-6 py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800" style={{ elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20 }}>
          <TouchableOpacity 
            className={`w-full h-14 rounded-2xl flex-row items-center justify-center shadow-md ${submitAssignmentMutation.isPending ? 'bg-slate-400 dark:bg-slate-700 shadow-none' : 'bg-indigo-600 shadow-indigo-600/30'}`}
            activeOpacity={0.8}
            onPress={handleFinalSubmit}
            disabled={submitAssignmentMutation.isPending}
          >
            {submitAssignmentMutation.isPending ? (
              <View className="mr-2"><ActivityIndicator color="white" /></View>
            ) : (
              <View className="mr-2"><CheckCircle size={20} color="white" /></View>
            )}
            <Text className="text-sm font-black uppercase tracking-widest text-white">
              Submit Assignment
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}
