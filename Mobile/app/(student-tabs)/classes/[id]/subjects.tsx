import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, ChevronRight, User, X, FileText, Award, Calendar, ListChecks } from 'lucide-react-native';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useSubjectScheme } from '@/lib/api/hooks/useSubjects';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

export default function ClassSubjectsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const classId = Array.isArray(id) ? id[0] : id;

  const { data: classData, isLoading: isClassLoading, refetch: refetchClass } = useSingleClass(classId || '');
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchClass?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetchClass]);
  
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: schemeData, isLoading: isSchemeLoading } = useSubjectScheme(selectedSubject?.id || '');
  const schemeOfWork = Array.isArray(schemeData) ? schemeData : schemeData?.data || [];

  const className = classData?.name || 'Class';
  const classSubjects = classData?.subjects || [];

  const handleSubjectPress = (subject: any) => {
    setSelectedSubject(subject);
    setModalVisible(true);
  };

  if (isClassLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 opacity-50" />
          <View className="ml-4 flex-1">
            <View className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-1 opacity-50" />
            <View className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
          </View>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 opacity-50">
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mr-4" />
                <View className="flex-1">
                  <View className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full mb-2" />
                  <View className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </TouchableOpacity>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
              Class Subjects
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {className}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {classSubjects.length === 0 ? (
          <View className="py-16 items-center px-4">
            <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-6">
              <BookOpen size={36} className="text-blue-500" />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">
              No Subjects Assigned
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              There are currently no subjects assigned to this class. Check back later or contact your administrator.
            </Text>
          </View>
        ) : (
          <View className="mb-8">
            <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 px-2">
              Assigned Subjects ({classSubjects.length})
            </Text>
            
            {classSubjects.map((cs: any, index: number) => {
              const subject = cs.subject;
              if (!subject) return null;
              
              const teacherName = subject.teacher?.name || 'Not assigned';
              
              return (
                <TouchableOpacity
                  key={subject.id || index}
                  activeOpacity={0.7}
                  onPress={() => handleSubjectPress(subject)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 flex-row items-center"
                  style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
                >
                  <View className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center mr-4">
                    <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
                  </View>
                  
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={1}>
                      {subject.name}
                    </Text>
                    <View className="flex-row items-center">
                      <User size={12} className="text-slate-400 mr-1" />
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
                        {teacherName}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full mb-2">
                      <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {subject.code}
                      </Text>
                    </View>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Subject Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View 
            className="bg-white dark:bg-slate-900 rounded-t-3xl"
            style={{ height: '70%', maxHeight: '90%' }}
          >
            <View className="flex-row justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <Text className="text-lg font-black text-slate-900 dark:text-white">Subject Details</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
              >
                <X size={16} className="text-slate-500" />
              </TouchableOpacity>
            </View>

            {selectedSubject && (
              <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="items-center mb-8">
                  <View className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center mb-4">
                    <BookOpen size={36} className="text-blue-600 dark:text-blue-400" />
                  </View>
                  <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2">
                    {selectedSubject.name}
                  </Text>
                  <View className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full">
                    <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {selectedSubject.code}
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 mb-6">
                  <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
                    Instructor
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mr-3">
                      <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </View>
                    <Text className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {selectedSubject.teacher?.name || 'Not assigned'}
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 mb-6">
                  <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
                    Description
                  </Text>
                  <Text className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedSubject.description || 'No description available for this subject.'}
                  </Text>
                </View>

                <View className="flex-row mb-8">
                  <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 mr-2 items-center">
                    <FileText size={20} className="text-blue-500 mb-2" />
                    <Text className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedSubject._count?.subjectExamPapers || 0}
                    </Text>
                    <Text className="text-[10px] font-bold text-slate-500 uppercase mt-1">Exams</Text>
                  </View>
                  <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 ml-2 items-center">
                    <Award size={20} className="text-emerald-500 mb-2" />
                    <Text className="text-xl font-black text-slate-900 dark:text-white">--</Text>
                    <Text className="text-[10px] font-bold text-slate-500 uppercase mt-1">Average</Text>
                  </View>
                </View>

                {/* Scheme of Work Section */}
                <View className="mb-6">
                  <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 flex-row items-center">
                    <ListChecks size={14} className="text-slate-400 mr-2" /> 
                    Scheme of Work
                  </Text>
                  
                  {isSchemeLoading ? (
                    <View className="py-6 items-center">
                      <ActivityIndicator size="small" color="#6366f1" />
                    </View>
                  ) : schemeOfWork.length > 0 ? (
                    <View className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4">
                      {schemeOfWork.map((scheme: any, idx: number) => (
                        <View key={scheme.id || idx} className={`py-4 ${idx !== schemeOfWork.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}>
                          <View className="flex-row items-start justify-between mb-2">
                            <Text className="text-sm font-black text-slate-900 dark:text-white flex-1 mr-2">
                              {scheme.topic}
                            </Text>
                            <View className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                              <Text className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                                Week {scheme.week}
                              </Text>
                            </View>
                          </View>
                          {scheme.objectives && (
                            <View className="mb-2">
                              <LaTeXRenderer content={scheme.objectives} />
                            </View>
                          )}
                          <View className="flex-row items-center mt-2">
                            <View className={`w-2 h-2 rounded-full mr-2 ${scheme.status === 'COMPLETED' ? 'bg-emerald-500' : scheme.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            <Text className="text-[10px] font-bold text-slate-500 uppercase">
                              {scheme.status || 'DRAFT'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 items-center">
                      <Calendar size={24} className="text-slate-300 dark:text-slate-600 mb-3" />
                      <Text className="text-sm font-bold text-slate-600 dark:text-slate-400 text-center">
                        No Scheme of Work found
                      </Text>
                      <Text className="text-xs text-slate-500 text-center mt-1">
                        The teacher has not added a scheme of work for this subject yet.
                      </Text>
                    </View>
                  )}
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
