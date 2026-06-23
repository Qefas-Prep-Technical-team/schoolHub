import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const CLASS_IMAGES = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800',
  'https://images.unsplash.com/photo-1513258496099-4816c02422eb?q=80&w=800',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800'
];

export const getClassImage = (title: string | undefined) => {
  if (!title) return CLASS_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLASS_IMAGES[Math.abs(hash) % CLASS_IMAGES.length];
};

import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile, useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';

import { ClassSkeleton } from '@/components/classes/ClassSkeleton';
import { ClassOverviewCard } from '@/components/classes/ClassOverviewCard';
import { ClassWeeklyStatus } from '@/components/classes/ClassWeeklyStatus';
import { ClassStatsGrid } from '@/components/classes/ClassStatsGrid';
import { ClassNavGrid } from '@/components/classes/ClassNavGrid';

export default function ClassDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const classId = id as string;

  const { data: classData, isLoading: isLoadingClass, refetch: refetchClass } = useSingleClass(classId);
  const { data: attemptsData, isLoading: isLoadingAttempts, refetch: refetchAttempts } = useStudentExamAttempts();
  const { data: standaloneGradesData, isLoading: isLoadingGrades, refetch: refetchGrades } = useGrades();
  const { data: studentProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useStudentProfile();
  
  const studentId = (studentProfile as any)?.id || '';
  const { data: attendanceData, isLoading: isLoadingAttendance, refetch: refetchAttendance } = useStudentAttendance(studentId);
  const { data: assignmentsData, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useStudentAssignments({ limit: 100 });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchClass?.(),
        refetchAttempts?.(),
        refetchGrades?.(),
        refetchProfile?.(),
        refetchAttendance?.(),
        refetchAssignments?.()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchClass, refetchAttempts, refetchGrades, refetchProfile, refetchAttendance, refetchAssignments]);

  const isLoading = isLoadingClass || isLoadingProfile;

  const classItem = useMemo(() => {
    if (!classData) return null;

    const attempts = attemptsData?.attempts || [];
    const standaloneGrades = standaloneGradesData?.grades || [];
    
    const studentDepartmentId: string | null = (studentProfile as any)?.departmentId || null;
    const studentDepartmentName: string | null = (studentProfile as any)?.department?.name || null;

    const allClassTeachers = classData.teachers?.map((t: any) => t.teacher).filter(Boolean) || [];
    const allSubjects: string[] = classData.subjects?.map((s: any) => s.subject?.name).filter(Boolean) || [];
    const primarySubject = allSubjects[0] || 'General';

    // Attendance
    const studentAttendance = attendanceData || [];
    const classAttendanceRecords = studentAttendance.filter((rec: any) => rec.classId === classId);
    const presentCount = classAttendanceRecords.filter((rec: any) => rec.status === 'present' || rec.status === 'late').length;
    const attendanceRate = classAttendanceRecords.length > 0
      ? Math.round((presentCount / classAttendanceRecords.length) * 100)
      : 0;

    // Assignments
    const studentAssignments = assignmentsData?.assignments || [];
    const classAssignments = studentAssignments.filter((a: any) => a.classId === classId);
    const completedAssignments = classAssignments.filter((a: any) => a.status === 'graded' || a.status === 'submitted');
    const assignmentsCompleted = completedAssignments.length;
    const assignmentsTotal = classAssignments.length;

    // Exams
    const classExams: any[] = classData.exams || [];
    const classAttempts = attempts.filter((a: any) => a.classId === classId || a.exam?.classId === classId);

    // CA Grades
    const subjectNames = new Set(allSubjects.map((s: string) => s.toLowerCase()));
    const classGrades = (standaloneGrades as any[]).filter((g) => subjectNames.has((g.subject || '').toLowerCase()));
    
    // Calculate Grade
    let totalScoreSum = 0;
    let gradedCount = 0;

    classAttempts.forEach((a: any) => {
      if (a.totalScore != null && a.totalMarks) {
        totalScoreSum += (a.totalScore / a.totalMarks) * 100;
        gradedCount++;
      }
    });

    classAssignments.forEach((a: any) => {
      if (a.status === 'graded' && a.grade) {
        let score = 0;
        let max = 100;
        if (a.grade.includes('/')) {
          const [sPart, mPart] = a.grade.split('/');
          score = parseFloat(sPart);
          max = parseFloat(mPart);
        } else {
          score = parseFloat(a.grade.replace(/[^0-9.]/g, ''));
        }
        if (!isNaN(score) && max > 0) {
          totalScoreSum += (score / max) * 100;
          gradedCount++;
        }
      }
    });

    classGrades.forEach((g: any) => {
      if (g.score != null && g.maxMarks) {
        totalScoreSum += (g.score / g.maxMarks) * 100;
        gradedCount++;
      }
    });

    let gradeLabel = 'N/A';
    let gradeScore = 0;
    if (gradedCount > 0) {
      const avg = totalScoreSum / gradedCount;
      gradeScore = Math.round(avg);
      if (avg >= 75) gradeLabel = 'A';
      else if (avg >= 60) gradeLabel = 'B';
      else if (avg >= 50) gradeLabel = 'C';
      else if (avg >= 45) gradeLabel = 'D';
      else gradeLabel = 'F';
    }

    // Calculate Last Activity
    let datesList: Date[] = [];
    classAttempts.forEach((a: any) => { if (a.submittedAt) datesList.push(new Date(a.submittedAt)); });
    classAssignments.forEach((a: any) => { if (a.submissionDate) datesList.push(new Date(a.submissionDate)); });
    classGrades.forEach((g: any) => { if (g.createdAt) datesList.push(new Date(g.createdAt)); });

    const validDates = datesList.filter(d => !isNaN(d.getTime()));
    let lastActivity = 'No activity yet';
    if (validDates.length > 0) {
      const latestDate = new Date(Math.max(...validDates.map(d => d.getTime())));
      lastActivity = formatDate(latestDate);
    }

    // Calculate Weekly Attendance for M, T, W, Th, Fr
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const mondayDiff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const mondayDate = new Date(today.setDate(mondayDiff));
    mondayDate.setHours(0, 0, 0, 0);

    const weeklyStatus: Array<{ day: 'M'|'T'|'W'|'Th'|'Fr', status: 'present'|'absent'|'none' }> = [
      { day: 'M', status: 'none' },
      { day: 'T', status: 'none' },
      { day: 'W', status: 'none' },
      { day: 'Th', status: 'none' },
      { day: 'Fr', status: 'none' },
    ];

    classAttendanceRecords.forEach((rec: any) => {
      const recDate = new Date(rec.date);
      if (recDate >= mondayDate) {
        const diffDays = Math.floor((recDate.getTime() - mondayDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 5) {
          const status = (rec.status === 'present' || rec.status === 'late') ? 'present' : 'absent';
          weeklyStatus[diffDays].status = status;
        }
      }
    });

    const teachersList = allClassTeachers.map((teacher: any) => {
      const name = teacher.name || 'Unassigned Teacher';
      const mockPhone = `+234 80${(name.charCodeAt(0) % 9) + 1} ${Math.floor(100 + (name.charCodeAt(1) || 0) * 8.7)}-${Math.floor(1000 + (name.charCodeAt(2) || 0) * 7.3)}`;
      return {
        name,
        title: teacher.email ? `Teacher — ${teacher.email}` : 'Class Teacher',
        avatar: teacher.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`,
        email: teacher.email || '',
        phone: mockPhone,
      };
    });

    const descriptionText = allSubjects.length > 0
      ? `This class covers ${allSubjects.join(', ')}. It is part of the ${classData.session || 'current'} academic session${classData.term ? ` — ${classData.term} Term` : ''}${studentDepartmentName ? `. Your department: ${studentDepartmentName}.` : ''}`
      : `${classData.name} — ${classData.session || 'Current Session'}`;

    return {
      title: classData.name,
      code: classData.code || classData.section || primarySubject,
      teachers: teachersList,
      description: descriptionText,
      weeklyStatus,
      stats: {
        attendance: attendanceRate,
        assignments: { completed: assignmentsCompleted, total: assignmentsTotal },
        grade: gradeLabel,
        gradeScore,
        lastActivity,
      },
    };
  }, [classData, attemptsData, standaloneGradesData, classId, studentProfile, attendanceData, assignmentsData]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <View className="absolute top-0 left-0 right-0 h-[240px] rounded-b-[40px] overflow-hidden bg-indigo-900">
          <Image 
            source={{ uri: getClassImage(classData?.name) }} 
            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.8 }}
            contentFit="cover"
          />
          <LinearGradient 
            colors={['rgba(79, 70, 229, 0.65)', 'rgba(67, 56, 202, 0.85)']} 
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
        </View>
        <SafeAreaView className="flex-1 px-6 pt-6">
          <ClassSkeleton viewMode="details" />
        </SafeAreaView>
      </View>
    );
  }

  if (!classItem) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <Text className="text-slate-800 dark:text-slate-200">Class not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-500 rounded-lg">
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      {/* Dynamic Image Header Background */}
      <View className="absolute top-0 left-0 right-0 h-[240px] rounded-b-[40px] overflow-hidden bg-indigo-900">
        <Image 
          source={{ uri: getClassImage(classItem.title) }} 
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.8 }}
          contentFit="cover"
        />
        <LinearGradient 
          colors={['rgba(79, 70, 229, 0.65)', 'rgba(67, 56, 202, 0.85)']} 
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </View>

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Top Header Row */}
        <View className="px-6 py-2 flex-row items-center justify-between z-10">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 -ml-2 rounded-full">
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>

            <View className="flex-1 mr-2">
              <Text className="text-xl font-bold text-white" numberOfLines={1}>{classItem.title}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push(`/notifications?classId=${classId}&className=${encodeURIComponent(classItem.title)}`)}
            className="p-2 rounded-full bg-white/20"
          >
            <Bell size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
        >
          <View className="px-6">
            <ClassOverviewCard 
              title={classItem.title}
              teachers={classItem.teachers} 
              description={classItem.description} 
            />
            
            <ClassWeeklyStatus 
              weeklyData={classItem.weeklyStatus} 
              onPress={() => router.push(`/classes/${classId}/attendance` as any)}
            />

            <ClassStatsGrid 
              attendance={classItem.stats.attendance}
              assignments={classItem.stats.assignments}
              grade={classItem.stats.grade}
              gradeScore={classItem.stats.gradeScore}
              lastActivity={classItem.stats.lastActivity}
            />
            
            <ClassNavGrid />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
