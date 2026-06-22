import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PenTool, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';

export default function ClassAssignmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const classId = Array.isArray(id) ? id[0] : id;

  const { data: classData, isLoading: isClassLoading } = useSingleClass(classId || '');
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useStudentAssignments({ limit: 100 });

  const className = classData?.name || 'Class';
  
  const studentAssignments = assignmentsData?.assignments || [];
  const classAssignments = studentAssignments.filter((a: any) => a.classId === classId);

  // Pagination Logic
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(classAssignments.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedAssignments = classAssignments.slice(startIdx, startIdx + pageSize);

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

  if (isClassLoading || isAssignmentsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center" />
          <View className="ml-4 flex-1">
            <View className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-1" />
            <View className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </View>
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading assignments...</Text>
        </View>
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
          <View className="ml-5 flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
              Assignments
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {className}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {classAssignments.length === 0 ? (
          <View className="py-16 items-center px-4">
            <View className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mb-6">
              <PenTool size={36} className="text-indigo-500" />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">
              No Assignments Yet
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              You're all caught up! There are currently no assignments scheduled for this class.
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 px-2">
              Class Assignments ({classAssignments.length})
            </Text>
            
            {paginatedAssignments.map((assignment: any, index: number) => {
              const statusInfo = getStatusInfo(assignment.status);
              const StatusIcon = statusInfo.icon;
              const dueDateObj = assignment.dueDate ? new Date(assignment.dueDate) : null;
              const assignmentNumber = startIdx + index + 1;
              
              return (
                <TouchableOpacity
                  key={assignment.id || index}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/assignments/${assignment.id}` as any)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800"
                  style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mr-4">
                      <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {assignmentNumber}
                      </Text>
                    </View>
                    
                    <View className="flex-1 mr-2">
                      <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={2}>
                        {assignment.title}
                      </Text>
                      <View className="flex-row items-center">
                        <StatusIcon size={12} className={`${statusInfo.color} mr-1.5`} />
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
                        {dueDateObj ? formatDate(dueDateObj) : 'No Due Date'}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grade</Text>
                      <Text className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {assignment.grade || '--'} / {assignment.totalMarks || 100}
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
      </ScrollView>
    </SafeAreaView>
  );
}
