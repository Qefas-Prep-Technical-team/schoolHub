import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react-native';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface UsageLimitsCardProps {
  primaryColor?: string;
  title?: string;
  role?: 'ADMIN' | 'PARENT' | 'TEACHER' | 'STUDENT';
}

export const UsageLimitsCard = ({
  primaryColor = '#2563eb',
  title = "Usage Limits",
  role = 'ADMIN'
}: UsageLimitsCardProps) => {
  // Removed useRouter
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data, isLoading, isError } = useSubscriptionUsage();

  if (isLoading) {
    return (
      <View className="bg-slate-200 dark:bg-slate-800 rounded-[3rem] h-96 mx-2 animate-pulse" />
    );
  }

  if (isError || !data) {
    return (
      <View className="bg-white/70 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/50 rounded-[3rem] p-10 mx-2 shadow-sm items-center justify-center h-80">
        <View className="h-20 w-20 rounded-[2rem] bg-rose-50 dark:bg-rose-900/10 items-center justify-center border border-rose-100 dark:border-rose-900/20 mb-4">
          <AlertTriangle size={36} color="#f43f5e" />
        </View>
        <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white italic uppercase tracking-tight mb-2">
          Protocol Interrupted
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 font-LexendBold text-center max-w-[200px]">
          System unable to synchronize institutional metrics.
        </Text>
      </View>
    );
  }

  const { usage, limits, percentages, planName, subscriptionStatus, isTrial } = data;

  const allMetrics = [
    { id: 'students', label: "Students", count: usage.students, limit: limits.students, percent: percentages.students, color: "#3b82f6" },
    { id: 'exams', label: "Exams", count: usage.exams, limit: limits.exams, percent: percentages.exams, color: primaryColor },
    { id: 'classes', label: "Classes", count: usage.classes, limit: limits.classes, percent: percentages.classes, color: "#a855f7" },
    { id: 'teachers', label: "Teachers", count: usage.teachers, limit: limits.teachers, percent: percentages.teachers, color: "#f43f5e" },
    { id: 'storage', label: "Storage", count: `${usage.storageGb}GB`, limit: `${limits.storageGb}GB`, percent: percentages.storage, color: "#10b981" },
    { id: 'ai', label: "AI Usage", count: usage.aiUsage, limit: limits.aiUsage, percent: percentages.aiUsage, color: "#6366f1" },
  ];

  const metrics = allMetrics.filter(m => {
    if (role === 'ADMIN') return true;
    return false;
  }).concat(
    (data.planFeatures || [])
      .filter((f: any) => f.enabled && f.limit > 0)
      .map((f: any) => ({
        id: f.name,
        label: f.label,
        count: 0,
        limit: f.limit,
        percent: 0,
        color: "#64748b",
      }))
  );

  const otherFeatures = (data.planFeatures || [])
    .filter((f: any) => f.enabled && (f.limit <= 0 || !f.limit));

  const hasWarning = Object.values(percentages).some((p) => (p as number) >= 80);

  const getBarColor = (percentage: number, defaultColor: string) => {
    if (percentage >= 90) return "#f43f5e";
    if (percentage >= 80) return "#f59e0b";
    return defaultColor;
  };

  const getTextColor = (percentage: number, defaultColor: string) => {
    if (percentage >= 90) return "#e11d48";
    if (percentage >= 80) return "#d97706";
    return defaultColor;
  };

  return (
    <View
      className="bg-white/70 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/50 rounded-[3rem] p-6 mx-2 shadow-sm overflow-hidden relative mb-6"
    >
      {hasWarning && (
        <View
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: '#f59e0b' }}
        />
      )}

      <View className="flex-row items-center justify-between mb-8 relative z-10">
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: hasWarning ? 'rgba(245, 158, 11, 0.1)' : `${primaryColor}15` }}
          >
            {hasWarning ? <AlertTriangle size={20} color="#f59e0b" /> : <Clock size={20} color={primaryColor} />}
          </View>
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-LexendBlack text-base text-slate-900 dark:text-white uppercase tracking-tight">
                {title}
              </Text>
              <View className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
                <Text className="text-[8px] font-LexendBlack uppercase text-slate-600 dark:text-slate-400">
                  {isTrial ? 'Trial' : subscriptionStatus}
                </Text>
              </View>
            </View>
            <Text className="text-[9px] text-slate-500 font-LexendBold uppercase tracking-tight">
              Current Plan: {planName}
            </Text>
          </View>
        </View>
      </View>

      <View className="relative z-10">
        {metrics.map((m, i) => (
          <View key={i} className="mb-4">
            <View className="flex-row justify-between items-end mb-2">
              <Text className="text-xs font-LexendBold text-slate-500">
                {m.label}
              </Text>
              <View className="flex-row items-baseline">
                <Text
                  className="text-sm font-LexendBlack tracking-tight"
                  style={{ color: getTextColor(m.percent, primaryColor) }}
                >
                  {m.count}
                </Text>
                <Text className="text-[10px] font-LexendBold text-slate-400 ml-1">
                  / {typeof m.limit === 'number' && m.limit >= 999999 ? "∞" : m.limit}
                </Text>
              </View>
            </View>
            <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${m.percent}%`,
                  backgroundColor: getBarColor(m.percent, primaryColor)
                }}
              />
            </View>
          </View>
        ))}

        {otherFeatures.length > 0 && (
          <View className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1 h-1 rounded-full bg-slate-400" />
              <Text className="text-[9px] font-LexendBlack uppercase tracking-widest text-slate-400">
                Premium Features Locked-In
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {otherFeatures.map((f: any, i: number) => (
                <View
                  key={i}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                >
                  <Text className="text-[9px] font-LexendBlack uppercase tracking-tight text-slate-600 dark:text-slate-400">
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="w-full mt-8 h-14 rounded-2xl flex-row items-center justify-center gap-2 relative z-10"
        style={{ backgroundColor: hasWarning ? '#f59e0b' : primaryColor }}
        onPress={() => { }}
      >
        <Text className="font-LexendBlack uppercase tracking-widest text-[11px] text-white">
          Upgrade Capacity
        </Text>
        <ArrowUpRight size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
