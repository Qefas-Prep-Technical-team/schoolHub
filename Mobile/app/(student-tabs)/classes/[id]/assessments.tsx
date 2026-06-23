import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { format } from 'date-fns';

import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';

import { AssessmentsList } from '@/components/classes/tabs/AssessmentsList';
import { CategoryStatsGrid } from '@/components/classes/CategoryStatsGrid';

const formatDateLocal = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export default function ClassAssessmentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const classId = id as string;

  const [activeTab, setActiveTab] = useState<'All' | 'Exam' | 'Assignment' | 'CA'>('All');

  const { data: classData, isLoading: isLoadingClass } = useSingleClass(classId);
  const { data: attemptsData, isLoading: isLoadingAttempts } = useStudentExamAttempts();
  const { data: standaloneGradesData, isLoading: isLoadingGrades } = useGrades();
  const { data: studentProfile, isLoading: isLoadingProfile } = useStudentProfile();
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useStudentAssignments({ limit: 100 });

  const isLoading = isLoadingClass || isLoadingAttempts || isLoadingGrades || isLoadingProfile || isLoadingAssignments;

  const assessmentsList = useMemo(() => {
    if (!classData) return [];

    const attempts = attemptsData?.attempts || [];
    const standaloneGrades = standaloneGradesData?.grades || [];
    
    const studentDepartmentId: string | null = (studentProfile as any)?.departmentId || null;
    const hasDepartment = !!studentDepartmentId;
    const allSubjects: string[] = classData.subjects?.map((s: any) => s.subject?.name).filter(Boolean) || [];

    // Assignments
    const studentAssignments = assignmentsData?.assignments || [];
    const classAssignments = studentAssignments.filter((a: any) => a.classId === classId);

    // Exams
    const classExams: any[] = classData.exams || [];
    const filteredExams = classExams.filter((exam: any) => {
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

    const examsAsAssessments = filteredExams.map((exam: any, idx: number) => {
      const now = new Date();
      const end = exam.endDate ? new Date(exam.endDate) : null;
      const start = exam.startDate ? new Date(exam.startDate) : null;
      const attempted = attempts.find((a: any) => a.examId === exam.id);

      let status: 'graded' | 'submitted' | 'upcoming' | 'overdue' = 'upcoming';
      if (attempted) {
        status = attempted?.status === 'SCORED' ? 'graded' : 'submitted';
      } else if (end && now > end) {
        status = 'overdue';
      }

      const gradeStr = attempted?.totalScore != null && attempted?.totalMarks
        ? `${attempted.totalScore}/${attempted.totalMarks}`
        : undefined;

      const type = exam.category === 'QUIZ' 
        ? 'Test (Quiz)' 
        : exam.subject?.name 
          ? 'Subject Paper' 
          : 'Exam';

      return {
        id: `exam-${exam.id || idx}`,
        title: exam.title || `Assessment ${idx + 1}`,
        dueDate: end ? formatDateLocal(end) : (start ? formatDateLocal(start) : 'TBD'),
        status,
        grade: gradeStr,
        type: type.includes('Exam') ? 'Exam' : 'Exam', // normalize for filter
        timestamp: end ? end.getTime() : (start ? start.getTime() : 0),
        link: `/exams/${exam.id}`,
      };
    });

    const assignmentsAsAssessments = classAssignments.map((a: any, idx: number) => {
      const dueDateVal = a.dueDate ? new Date(a.dueDate) : null;
      return {
        id: `assignment-${a.id || idx}`,
        title: a.title,
        dueDate: dueDateVal ? formatDateLocal(dueDateVal) : 'N/A',
        status: (a.status as 'graded' | 'submitted' | 'upcoming' | 'overdue') || 'upcoming',
        grade: a.grade || undefined,
        type: 'Assignment',
        timestamp: dueDateVal ? dueDateVal.getTime() : 0,
        link: `/assignments/${a.id}`,
      };
    });

    const subjectNames = new Set(allSubjects.map((s: string) => s.toLowerCase()));
    const classGrades = (standaloneGrades as any[]).filter((g) => subjectNames.has((g.subject || '').toLowerCase()));
    
    const gradesAsAssessments = classGrades.map((g, idx) => {
      const gDate = g.createdAt ? new Date(g.createdAt) : null;
      return {
        id: `ca-${g.id || idx}`,
        title: `${g.subject} — ${g.examTitle || 'Assessment'}`,
        dueDate: gDate ? formatDateLocal(gDate) : 'N/A',
        status: 'graded' as const,
        grade: `${g.score}/${g.maxMarks}`,
        type: 'CA',
        timestamp: gDate ? gDate.getTime() : 0,
        link: '#',
      };
    });

    return [
      ...examsAsAssessments,
      ...assignmentsAsAssessments,
      ...gradesAsAssessments,
    ].sort((a, b) => b.timestamp - a.timestamp);

  }, [classData, attemptsData, standaloneGradesData, classId, studentProfile, assignmentsData]);

  const filteredAssessments = assessmentsList.filter(a => {
    if (activeTab === 'All') return true;
    return a.type === activeTab;
  });

  // Calculate dynamic stats based on filtered list
  const completedAssessments = filteredAssessments.filter(a => a.status === 'graded' || a.status === 'submitted');
  let totalScoreSum = 0;
  let gradedCount = 0;

  filteredAssessments.forEach(a => {
    if (a.status === 'graded' && a.grade) {
      const parts = a.grade.split('/');
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
  const completionRate = filteredAssessments.length > 0 ? Math.round((completedAssessments.length / filteredAssessments.length) * 100) : 0;

  const statsConfig = [
    { label: 'Completion Rate', value: completionRate, maxValue: 100, color: '#3b82f6', isPercentage: true },
    { label: 'Tasks Done', value: completedAssessments.length, maxValue: Math.max(1, filteredAssessments.length), color: '#8b5cf6', isPercentage: false },
    { label: 'Average Score', value: gradedCount > 0 ? averageGrade : 'N/A', maxValue: 100, color: '#10b981', isPercentage: true },
  ];

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <View className="absolute top-0 left-0 right-0 h-[140px] bg-indigo-600 rounded-b-[40px]" />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Top Header Row */}
        <View className="px-6 py-2 flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full">
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">Assessments</Text>
            </View>
          </View>
          <TouchableOpacity className="p-2 rounded-full bg-white/20">
            <Filter size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View className="px-6 mb-6">
              <View className="flex-row bg-white/10 p-1 rounded-xl mb-4 self-center">
                {['All', 'Exam', 'Assignment', 'CA'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Text className={`text-sm font-bold ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <CategoryStatsGrid stats={statsConfig} gradeScore={averageGrade} />
            </View>

            <View className="px-6">
              <AssessmentsList assessments={filteredAssessments} />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
