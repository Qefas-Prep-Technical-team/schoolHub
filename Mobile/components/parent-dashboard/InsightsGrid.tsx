import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, Calendar, UserCheck, Bell } from 'lucide-react-native';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';

interface InsightsGridProps {
  activeChildId?: string;
}

export const InsightsGrid = ({ activeChildId }: InsightsGridProps) => {
  const { data: childrenData } = useParentChildren();
  const activeChild = childrenData?.find(c => c.id === activeChildId) || childrenData?.[0];
  
  const { data, isLoading } = useParentDashboard(activeChildId);

  const avgGrade = activeChild?.stats?.averageGrade ?? data?.stats?.averageGrade ?? 0;
  const attendanceRate = activeChild?.stats?.attendanceRate ?? data?.stats?.attendanceRate ?? 0;
  const upcomingExamsCount = data?.upcomingExams?.length ?? 0;
  const notificationsCount = data?.notifications?.filter(n => n.status === 'UNREAD').length ?? 0;

  const insights = [
    {
      id: 'gpa',
      title: 'Academic Average',
      value: isLoading ? '...' : `${avgGrade}%`,
      subtitle: 'Current Standing',
      icon: TrendingUp,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: '#f97316', // orange-500
    },
    {
      id: 'attendance',
      title: 'Attendance Rate',
      value: isLoading ? '...' : `${attendanceRate}%`,
      subtitle: 'Present',
      icon: UserCheck,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: '#3b82f6', // blue-500
    },
    {
      id: 'exams',
      title: 'Upcoming Exams',
      value: isLoading ? '...' : upcomingExamsCount.toString(),
      subtitle: 'Scheduled',
      icon: Calendar,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: '#10b981', // emerald-500
    },
    {
      id: 'notifications',
      title: 'Unread Alerts',
      value: isLoading ? '...' : notificationsCount.toString(),
      subtitle: 'Recent',
      icon: Bell,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: '#a855f7', // purple-500
    },
  ];

  return (
    <View className="mb-8">
      <View className="mb-4">
        <Text className="text-lg font-LexendBold text-slate-800 dark:text-white uppercase tracking-tight">Academic Insights</Text>
        <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mt-1">Real-time performance</Text>
      </View>
      
      <View className="flex-row flex-wrap justify-between">
        {insights.map((item) => (
          <View 
            key={item.id}
            className="w-[48%] bg-white dark:bg-slate-800 p-4 rounded-3xl mb-4 shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <View className={`h-10 w-10 rounded-xl ${item.iconBg} items-center justify-center mb-3`}>
              <item.icon size={20} color={item.iconColor} />
            </View>
            <Text className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1">{item.value}</Text>
            <Text className="text-xs font-LexendBold text-slate-600 dark:text-slate-300 mb-0.5">{item.title}</Text>
            <Text className="text-[10px] font-Lexend text-slate-400 dark:text-slate-500">{item.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
