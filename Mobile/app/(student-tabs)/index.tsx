import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TopNavBar } from '../../components/student-dashboard/TopNavBar';
import { StudentHero } from '../../components/student-dashboard/StudentHero';
import { ConsoleInsights } from '../../components/student-dashboard/ConsoleInsights';
import { QuickActions } from '../../components/student-dashboard/QuickActions';
import { AcademicProgressWidget } from '../../components/student-dashboard/AcademicProgressWidget';
import { PerformanceTrend } from '../../components/student-dashboard/PerformanceTrend';
import { AcademicHistory } from '../../components/student-dashboard/AcademicHistory';
import { ActiveSubjectsWidget } from '../../components/student-dashboard/ActiveSubjectsWidget';
import { StudentQuotaCard } from '../../components/student-dashboard/StudentQuotaCard';
import { DashboardSkeleton } from '../../components/student-dashboard/DashboardSkeleton';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';

export default function StudentHomeScreen() {
  const { data: studentProfile, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useStudentProfile();
  const { data: attemptsData, isLoading: isExamsLoading, isError: isExamsError, refetch: refetchExams } = useStudentExamAttempts();
  const { data: standaloneGradesData, isLoading: isGradesLoading, isError: isGradesError, refetch: refetchGrades } = useGrades();

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

  const isLoading = isProfileLoading;
  const isError = !isProfileLoading && (isProfileError || isExamsError || isGradesError);

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

    let weakest = null;
    let strongest = null;
    let advice = "";

    if (chartData.length > 0) {
      const sortedSubjects = [...chartData].sort((a, b) => a.A - b.A);
      weakest = sortedSubjects[0];
      strongest = sortedSubjects[sortedSubjects.length - 1];

      if (weakest.A < 40) {
        advice = `You need to put more effort into ${weakest.subject} (F9 standing). We recommend getting a tutor and practicing well before the next exam.`;
      } else if (weakest.A < 50) {
        advice = `Your performance in ${weakest.subject} is at a Pass level (D7/E8). Try practicing more past questions so you can hit Credit (C6) or higher.`;
      } else if (weakest.A < 75) {
        advice = `You are doing well in ${weakest.subject} (Credit range). If you push a bit more, you can secure a Distinction (A1/B2) for the next one.`;
      } else {
        advice = `Excellent! You have mastered ${weakest.subject} well at ${weakest.A}% (A1 level). Keep it up and help your peers who are struggling.`;
      }
    }

    const gpaRaw = totalMaxMarks > 0 ? (totalScore / totalMaxMarks) * 5 : 0;
    const gpaFormatted = gpaRaw.toFixed(2);

    return { 
      chartData, 
      gpa: gpaFormatted, 
      totalExams: attempts.length + standaloneGrades.length, 
      subjectsCount: Object.keys(subjectsMap).length,
      weakest,
      strongest,
      advice
    };
  }, [attempts, standaloneGrades]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
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

            <AcademicProgressWidget 
              advice={analysis?.advice || ""} 
              strongest={analysis?.strongest || null}
              weakest={analysis?.weakest || null}
              chartData={analysis?.chartData || []} 
            />

            <PerformanceTrend attempts={attempts} standaloneGrades={standaloneGrades} />

            <AcademicHistory attempts={attempts} />

            <StudentQuotaCard />

            <QuickActions />

            <ActiveSubjectsWidget subjectsCount={analysis?.subjectsCount || 0} />
          </>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
