import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GraduationCap, ShieldCheck, Activity, Zap, Target, TrendingUp } from 'lucide-react-native';

interface StudentStatsCardsProps {
  stats: {
    total: number;
    verified: number;
    attendance: string;
    pending: number;
  };
  primaryColor?: string;
  isDark?: boolean;
}

export default function StudentStatsCards({ stats, primaryColor = '#2563eb', isDark = false }: StudentStatsCardsProps) {
  const statItems = [
    { 
      label: 'Total Students', 
      value: stats.total, 
      icon: GraduationCap, 
      color: primaryColor,
      desc: 'Registered Students'
    },
    { 
      label: 'Verified Students', 
      value: stats.verified, 
      icon: ShieldCheck, 
      color: '#10b981', // Emerald
      desc: 'Active Accounts'
    },
    { 
      label: 'Attendance Rate', 
      value: stats.attendance, 
      icon: Activity, 
      color: '#2563eb', // Indigo
      desc: 'Average Attendance'
    },
    { 
      label: 'Pending Students', 
      value: stats.pending, 
      icon: Zap, 
      color: '#f59e0b', // Amber
      desc: 'Awaiting Enrollment'
    },
  ];

  return (
    <View className="mb-6 px-4">
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {statItems.map((stat, index) => {
          return (
            <View 
              key={index}
              className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
              style={{ width: '48%' }}
            >
              {/* Top Row */}
              <View className="flex-row items-center justify-between mb-3">
                <View 
                  className="h-10 w-10 rounded-2xl items-center justify-center border"
                  style={{
                    backgroundColor: `${stat.color}15`,
                    borderColor: `${stat.color}30`
                  }}
                >
                  <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
                </View>
                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <TrendingUp size={10} color={isDark ? '#94a3b8' : '#64748b'} />
                </View>
              </View>

              {/* Data Row */}
              <View>
                <Text className="text-[9px] font-LexendBold uppercase tracking-wider text-slate-400 mb-1" numberOfLines={1}>
                  {stat.label}
                </Text>
                <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white" numberOfLines={1}>
                  {stat.value}
                </Text>
              </View>

              {/* Bottom Row */}
              <View className="flex-row items-center mt-3">
                <Target size={10} color={isDark ? '#475569' : '#cbd5e1'} />
                <Text className="text-[8px] font-LexendBold text-slate-500 dark:text-slate-500 ml-1 uppercase tracking-wider" numberOfLines={1}>
                  {stat.desc}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
