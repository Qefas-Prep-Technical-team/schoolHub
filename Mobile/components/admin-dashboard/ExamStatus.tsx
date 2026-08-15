import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, Calendar, CheckCircle2, FileText, AlertCircle, ChevronRight, Zap } from 'lucide-react-native';
import { useExams } from '@/lib/api/hooks/useExams';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

interface ExamStatusProps {
  primaryColor?: string;
}

export const ExamStatus = ({ primaryColor = '#2563eb' }: ExamStatusProps) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Only request 5 exams — component slices to 5 anyway; don't fetch the full list.
  const { data: examsData, isLoading } = useExams({ limit: 5 });

  const exams = (examsData || []).slice(0, 5).map((e: any) => {
    let status = 'upcoming';
    const now = new Date();
    const start = e.startDate ? new Date(e.startDate) : null;
    const end = e.endDate ? new Date(e.endDate) : null;

    if (e.status === 'PUBLISHED') {
      if (start && now >= start && (!end || now <= end)) status = 'ongoing';
      else if (end && now > end) status = 'completed';
    } else if (e.status === 'DRAFT') {
      status = 'upcoming';
    }

    return {
      id: e.id,
      title: e.title,
      subject: e.subjectPapers?.[0]?.title || 'Multiple Subjects',
      grade: e.class?.name || 'All Grades',
      status,
      time: start ? new Date(start).toLocaleDateString() : 'TBD',
      teacher: e.teacher?.name || 'Teacher',
      description: e.description || ''
    };
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ongoing':
        return {
          icon: Clock,
          bg: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: '#d97706',
          label: 'Ongoing',
        };
      case 'upcoming':
        return {
          icon: Calendar,
          bg: `${primaryColor}15`,
          color: primaryColor,
          label: 'Upcoming',
        };
      case 'grading':
        return {
          icon: Zap,
          bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: '#059669',
          label: 'Grading',
        };
      case 'completed':
      default:
        return {
          icon: CheckCircle2,
          bg: isDark ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          color: '#475569',
          label: 'Completed',
        };
    }
  };

  if (isLoading) {
    return (
      <View className="bg-slate-200 dark:bg-slate-800 rounded-[3rem] h-80 mb-6 mx-2 animate-pulse" />
    );
  }

  return (
    <View
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        borderWidth: 1,
        borderRadius: 48,
        marginBottom: 24,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: 128,
          width: 128,
          borderRadius: 64,
          opacity: 0.1,
          backgroundColor: primaryColor,
          transform: [{ translateX: 30 }, { translateY: -30 }]
        }}
      />

      <View className="px-6 py-6 flex-row justify-between items-center relative z-10">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <Text className="text-[9px] font-LexendBlack uppercase tracking-widest" style={{ color: primaryColor }}>
              Exam Overview
            </Text>
          </View>
          <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Exam Status
          </Text>
        </View>

        <TouchableOpacity
          className="h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 items-center justify-center border border-transparent"
          onPress={() => router.push('/(admin-tabs)/exams' as any)}
        >
          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View className="px-4 pb-6">
        {exams.length === 0 ? (
          <View className="py-10 items-center justify-center px-4">
            <View className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mb-3">
              <FileText size={24} color="#94a3b8" />
            </View>
            <Text className="text-xs font-LexendBlack text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">
              No data available
            </Text>
            <Text className="text-[10px] text-slate-500 font-LexendBold italic text-center">
              Active exams will appear here once scheduled.
            </Text>
          </View>
        ) : (
          exams.map((exam: any, idx: number) => {
            const statusConfig = getStatusConfig(exam.status);
            const Icon = statusConfig.icon;

            return (
              <TouchableOpacity
                key={exam.id}
                className="px-4 py-4 flex-row items-center justify-between rounded-[2rem] border border-transparent bg-transparent mb-1"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center shrink-0"
                  >
                    <FileText size={20} color="#94a3b8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight italic mb-1" numberOfLines={1}>
                      {exam.title}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest" numberOfLines={1} style={{ maxWidth: 100 }}>
                        {exam.subject}
                      </Text>
                      <View className="h-1 w-1 rounded-full bg-slate-300" />
                      <Text className="text-[9px] font-LexendBlack uppercase tracking-widest" style={{ color: primaryColor }}>
                        {exam.grade}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end justify-center shrink-0 ml-2">
                  <View
                    className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border"
                    style={{ backgroundColor: statusConfig.bg, borderColor: `${statusConfig.color}30` }}
                  >
                    <Icon size={10} color={statusConfig.color} />
                    <Text className="text-[8px] font-LexendBlack uppercase tracking-widest" style={{ color: statusConfig.color }}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <AlertCircle size={14} color="#f59e0b" />
          <Text className="text-[9px] font-LexendBlack text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Update: <Text className="text-slate-900 dark:text-white">1 exam ending</Text>
          </Text>
        </View>
        <TouchableOpacity>
          <Text className="text-[9px] font-LexendBlack uppercase" style={{ color: primaryColor }}>
            Schedule New →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
