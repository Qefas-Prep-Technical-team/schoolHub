import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';

interface AcademicOverviewProps {
  activeChildId?: string;
}

export const AcademicOverview = ({ activeChildId }: AcademicOverviewProps) => {
  const { data: childrenData } = useParentChildren();
  const activeChild = childrenData?.find(c => c.id === activeChildId) || childrenData?.[0];
  
  const { data } = useParentDashboard(activeChildId);

  // Calculate attendance
  const attendanceRate = activeChild?.stats?.attendanceRate ?? data?.stats?.attendanceRate ?? 0;
  
  // Calculate pending assignments progress
  const assignments = data?.child?.assignments || [];
  
  const totalAssignments = assignments.length > 0 ? assignments.length : 1;
  const pendingAssignmentsCount = assignments.filter((a: any) => !a.submissions || a.submissions.length === 0).length;
  const pendingAssignmentsPercentage = assignments.length > 0 
    ? Math.round((pendingAssignmentsCount / totalAssignments) * 100)
    : 0;

  return (
    <View className="bg-white dark:bg-slate-800 rounded-[32px] p-6 mb-8 shadow-sm">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-lg font-LexendBold text-slate-800 dark:text-white">Academic Overview</Text>
        <TouchableOpacity className="flex-row items-center bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1.5">
          <Text className="text-xs font-Lexend text-slate-600 dark:text-slate-300 mr-1">Month</Text>
          <ChevronDown size={14} color="#64748b" />
        </TouchableOpacity>
      </View>
      <Text className="text-xs font-Lexend text-slate-400 dark:text-slate-500 mb-6">Track your progress</Text>

      {/* Attendance Progress */}
      <View className="mb-5">
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-sm font-LexendBold text-slate-800 dark:text-slate-200">Attendance</Text>
          <Text className="text-xs font-LexendBold text-slate-500 dark:text-slate-400">{attendanceRate}%</Text>
        </View>
        <View className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex-row">
          <View className="h-full bg-orange-400 rounded-full" style={{ width: `${attendanceRate}%` }} />
        </View>
      </View>

      {/* Pending Assignments Progress */}
      <View>
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-sm font-LexendBold text-slate-800 dark:text-slate-200">Pending Assignments</Text>
          <Text className="text-xs font-LexendBold text-slate-500 dark:text-slate-400">
            {pendingAssignmentsCount}/{assignments.length}
          </Text>
        </View>
        <View className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex-row">
          <View className="h-full bg-amber-400 rounded-full" style={{ width: `${pendingAssignmentsPercentage}%` }} />
        </View>
      </View>
    </View>
  );
};
