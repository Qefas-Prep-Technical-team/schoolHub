import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Users, UserX, Building, Sparkles, TrendingUp } from 'lucide-react-native';
import { useMyDashboardSummary } from '@/lib/api/hooks/useSchool';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StaffInsightsProps {
  primaryColor?: string;
}

export const StaffInsights = ({ primaryColor = '#2563eb' }: StaffInsightsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: summary, isLoading } = useMyDashboardSummary();

  const insights = useMemo(() => {
    if (!summary) return [];
    const list: any[] = [];

    if (summary.unassignedCount > 0) {
      list.push({
        id: 'unassigned',
        title: `${summary.unassignedCount} Unassigned Teachers`,
        description: `Personnel like ${summary.unassignedTeachers.map((t: any) => t.name).join(', ')} are awaiting class assignment.`,
        icon: UserX,
        color: '#e11d48',
        bg: isDark ? 'rgba(225, 29, 72, 0.1)' : 'rgba(225, 29, 72, 0.1)',
        severity: 'high',
      });
    }

    const lowCoverageClasses = (summary.classesSummary || []).filter((c: any) => c.teacherCount === 0);

    if (lowCoverageClasses.length > 0) {
      list.push({
        id: 'coverage',
        title: `${lowCoverageClasses.length} Unassigned Classes`,
        description: `Classes including ${lowCoverageClasses.slice(0, 2).map((c: any) => c.name).join(', ')} have no primary teacher assigned.`,
        icon: Building,
        color: '#d97706',
        bg: isDark ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.1)',
        severity: 'medium',
      });
    } else if (summary.classesSummary?.length > 0) {
      list.push({
        id: 'full-coverage',
        title: 'Full Teacher Coverage',
        description: `All ${summary.classesSummary.length} classes have verified teacher assignment.`,
        icon: Building,
        color: '#059669',
        bg: isDark ? 'rgba(5, 150, 105, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        severity: 'low',
      });
    }

    const hasData = (summary.unassignedCount > 0) || (summary.classesSummary?.length > 0) || (summary.classesSummary?.some((c: any) => c.teacherCount > 0));

    if (list.length === 0 && hasData) {
      list.push({
        id: 'healthy',
        title: 'Staffing Stable',
        description: 'All classes are currently balanced with optimal workload distribution.',
        icon: Users,
        color: primaryColor,
        bg: `${primaryColor}15`,
        severity: 'low',
      });
    }

    return list;
  }, [summary, primaryColor, isDark]);

  const workload = useMemo(() => {
    if (!summary || !summary.classesSummary || summary.classesSummary.length === 0) return 0;
    const totalAssignments = summary.classesSummary.reduce((acc: number, c: any) => acc + c.teacherCount, 0);
    const totalClasses = summary.classesSummary.length;
    return Math.min(Math.round((totalAssignments / totalClasses) * 100), 100);
  }, [summary]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return { bg: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' };
      case 'medium': return { bg: 'rgba(217, 119, 6, 0.1)', color: '#d97706' };
      case 'low': return { bg: 'rgba(5, 150, 105, 0.1)', color: '#059669' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569' };
    }
  };

  if (isLoading) {
    return (
      <View className="bg-slate-200 dark:bg-slate-800 rounded-[3rem] h-80 mb-6 mx-2 animate-pulse" />
    );
  }

  return (
    <View 
      style={{ backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.7)', borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9', borderWidth: 1, borderRadius: 48, marginBottom: 24, marginHorizontal: 8, overflow: 'hidden', position: 'relative' }}
    >
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          height: 160, 
          width: 160, 
          borderRadius: 80, 
          opacity: 0.1,
          backgroundColor: primaryColor, 
          transform: [{ translateX: 50 }, { translateY: -50 }] 
        }}
      />

      <View className="px-6 py-6 flex-row justify-between items-center relative z-10">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <Text className="text-[9px] font-LexendBlack uppercase tracking-widest" style={{ color: primaryColor }}>
              Staff Overview
            </Text>
          </View>
          <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Teacher Updates
          </Text>
        </View>
        <View 
          className="h-12 w-12 rounded-2xl items-center justify-center shadow-lg"
          style={{ backgroundColor: primaryColor }}
        >
          <Users size={24} color="#fff" />
        </View>
      </View>

      <View className="px-4 pb-6">
        {insights.length === 0 ? (
          <View className="py-10 items-center justify-center px-4">
            <View className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mb-3">
               <Users size={24} color="#94a3b8" />
            </View>
            <Text className="text-xs font-LexendBlack text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">
              No data available
            </Text>
            <Text className="text-[10px] text-slate-500 font-LexendBold italic text-center">
              Teacher updates will appear once teachers are assigned.
            </Text>
          </View>
        ) : (
          insights.map((insight: any, idx: number) => {
            const Icon = insight.icon;
            const sevStyle = getSeverityStyles(insight.severity);

            return (
              <View
                key={insight.id}
                className="p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 bg-white/30 dark:bg-slate-800/20 mb-3"
              >
                <View className="flex-row items-start gap-4">
                  <View 
                    className="p-3 rounded-2xl shrink-0"
                    style={{ backgroundColor: insight.bg }}
                  >
                    <Icon size={24} color={insight.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight italic flex-1 mr-2" numberOfLines={1}>
                        {insight.title}
                      </Text>
                      <View 
                        className="px-2.5 py-1 rounded-full border"
                        style={{ backgroundColor: sevStyle.bg, borderColor: `${sevStyle.color}30` }}
                      >
                        <Text className="text-[8px] font-LexendBlack uppercase tracking-widest" style={{ color: sevStyle.color }}>
                          {insight.severity}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-LexendBold leading-relaxed mb-3 italic">
                      {insight.description}
                    </Text>
                    {insight.severity === 'high' && (
                      <TouchableOpacity className="flex-row items-center gap-1">
                        <Text className="text-[10px] font-LexendBlack uppercase" style={{ color: primaryColor }}>
                          View Details
                        </Text>
                        <TrendingUp size={12} color={primaryColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {insights.length > 0 && (
        <View className="px-6 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 relative z-10">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Sparkles size={14} color={primaryColor} />
              <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-widest">
                Staff Status
              </Text>
            </View>
            <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white tracking-tighter italic">
              {workload}% OPTIMAL
            </Text>
          </View>

          <View className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 mb-6 overflow-hidden">
            <View 
              className="h-full rounded-full"
              style={{ 
                width: `${workload}%`, 
                backgroundColor: workload > 85 ? primaryColor : workload > 65 ? '#10b981' : '#f59e0b'
              }}
            />
          </View>

          <View className="flex-row justify-between gap-3">
            <View className="flex-1 p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 items-center">
              <Text className="font-LexendBlack text-sm tracking-tighter italic mb-1" style={{ color: primaryColor }}>
                98.2%
              </Text>
              <Text className="text-[8px] font-LexendBold text-slate-400 uppercase tracking-widest">Uptime</Text>
            </View>
            <View className="flex-1 p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 items-center">
              <Text className="font-LexendBlack text-sm tracking-tighter italic mb-1" style={{ color: primaryColor }}>
                {summary?.classesSummary?.reduce((acc: number, c: any) => acc + c.teacherCount, 0) || 0}
              </Text>
              <Text className="text-[8px] font-LexendBold text-slate-400 uppercase tracking-widest">Active</Text>
            </View>
            <View className="flex-1 p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 items-center">
              <Text className="font-LexendBlack text-sm tracking-tighter italic mb-1" style={{ color: primaryColor }}>
                {summary?.classesSummary?.length || 0}
              </Text>
              <Text className="text-[8px] font-LexendBold text-slate-400 uppercase tracking-widest">Units</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
