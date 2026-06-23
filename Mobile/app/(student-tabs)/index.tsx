import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TopNavBar } from '../../components/student-dashboard/TopNavBar';
import { StudentHero } from '../../components/student-dashboard/StudentHero';
import { ConsoleInsights } from '../../components/student-dashboard/ConsoleInsights';
import { QuickActions } from '../../components/student-dashboard/QuickActions';
import { MasteryRadarChart } from '../../components/student-dashboard/MasteryRadarChart';
import { PerformanceTrend } from '../../components/student-dashboard/PerformanceTrend';
import { AcademicHistory } from '../../components/student-dashboard/AcademicHistory';
import { DashboardSkeleton } from '../../components/student-dashboard/DashboardSkeleton';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';

export default function StudentHomeScreen() {
  const { data: studentProfile, isLoading: isProfileLoading, refetch: refetchProfile } = useStudentProfile();
  const { data: attemptsData, isLoading: isExamsLoading, refetch: refetchExams } = useStudentExamAttempts();
  const { data: standaloneGradesData, isLoading: isGradesLoading, refetch: refetchGrades } = useGrades();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchExams(), refetchGrades()]);
    setRefreshing(false);
  }, [refetchProfile, refetchExams, refetchGrades]);

  // Silently refetch data every time the screen comes into focus so it's never stale
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchExams();
      refetchGrades();
    }, [refetchProfile, refetchExams, refetchGrades])
  );

  const isLoading = isProfileLoading || isExamsLoading || isGradesLoading;

  // Accurately map from the StudentProfile response model
  const username = studentProfile?.name || 'Scholar';
  const globalId = studentProfile?.studentCode || '#HUB-2024';
  
  const activeClass = studentProfile?.classes?.[0]?.class;
  const termInfo = activeClass?.session || activeClass?.term 
    ? `${activeClass.session || 'Current Session'} - ${activeClass.term || 'Active Term'}`
    : "2023/24 - Second Term";

  const attempts = attemptsData?.attempts || attemptsData?.data || attemptsData || [];
  const standaloneGrades = standaloneGradesData?.grades || standaloneGradesData?.data || standaloneGradesData || [];

  const analysis = useMemo(() => {
    if (!attempts.length && !standaloneGrades.length) return null;

    const subjectsMap: Record<string, { total: number; score: number; count: number }> = {};
    let totalScore = 0;
    let totalMaxMarks = 0;

    attempts.forEach((attempt: any) => {
      attempt.subjectAttempts?.forEach((sa: any) => {
        const subName = sa.subjectPaper?.subject?.name || 'Unknown';
        if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
        subjectsMap[subName].score += sa.score || 0;
        subjectsMap[subName].total += sa.subjectPaper?.totalMarks || 100;
        subjectsMap[subName].count += 1;

        totalScore += sa.score || 0;
        totalMaxMarks += sa.subjectPaper?.totalMarks || 100;
      });
    });

    standaloneGrades.forEach((grade: any) => {
      const subName = grade.subject || 'Unknown';
      if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
      subjectsMap[subName].score += grade.score || 0;
      subjectsMap[subName].total += grade.maxMarks || 100;
      subjectsMap[subName].count += 1;

      totalScore += grade.score || 0;
      totalMaxMarks += grade.maxMarks || 100;
    });

    const chartData = Object.entries(subjectsMap).map(([name, data]) => ({
      subject: name,
      A: Math.round((data.score / (data.total || 1)) * 100),
      fullMark: 100,
    }));

    const gpaRaw = totalMaxMarks > 0 ? (totalScore / totalMaxMarks) * 5 : 0;
    const gpaFormatted = gpaRaw.toFixed(2);

    return { chartData, gpa: gpaFormatted, totalExams: attempts.length + standaloneGrades.length, subjectsCount: Object.keys(subjectsMap).length };
  }, [attempts, standaloneGrades]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      <TopNavBar />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />}
      >
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <StudentHero 
              username={username} 
              termInfo={termInfo}
              globalId={globalId}
            />

            <ConsoleInsights 
              gpa={analysis?.gpa || "0.00"}
              examsTaken={analysis?.totalExams || 0}
              credits={`${analysis?.subjectsCount || 0} Subjects`}
            />

            <QuickActions />

            <MasteryRadarChart data={analysis?.chartData || []} />

            <PerformanceTrend attempts={attempts} standaloneGrades={standaloneGrades} />

            <AcademicHistory attempts={attempts} />
          </>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
