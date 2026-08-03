import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CheckCircle2, AlertCircle, XCircle, Clock, Calendar, ChevronRight, Phone } from 'lucide-react-native';

const AttendanceAlert = ({ rate }: { rate: number }) => (
  <View className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 mb-6 mx-4">
    <View className="flex-row items-start gap-3">
      <View className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full mt-0.5">
        <CheckCircle2 size={16} color="#10b981" />
      </View>
      <View className="flex-1">
        <Text className="text-emerald-800 dark:text-emerald-300 font-LexendMedium text-sm leading-5">
          Student has maintained a {rate}% attendance record this semester. Great job!
        </Text>
      </View>
    </View>
  </View>
);

const StatCard = ({ title, value, icon: Icon, color, bg, border }: any) => (
  <View className={`flex-1 ${bg} border ${border} rounded-2xl p-4 flex-col items-center justify-center`}>
    <Icon size={24} color={color} className="mb-2" />
    <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white">{value}</Text>
    <Text className="text-[10px] font-LexendMedium text-slate-500 uppercase tracking-wider mt-1">{title}</Text>
  </View>
);

const RecentActivityItem = ({ activity }: { activity: any }) => {
  const isPresent = activity.status === 'present';
  const isLate = activity.status === 'late';
  const Icon = isPresent ? CheckCircle2 : isLate ? Clock : XCircle;
  const iconColor = isPresent ? '#10b981' : isLate ? '#f59e0b' : '#ef4444';
  const bg = isPresent ? 'bg-emerald-50 dark:bg-emerald-900/20' : isLate ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <View className="flex-row items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
      <View className={`p-2.5 rounded-full ${bg}`}>
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-LexendBold text-slate-900 dark:text-white capitalize">
          {activity.status}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {activity.date}
        </Text>
      </View>
      <Text className="text-xs font-LexendMedium text-slate-400">
        {activity.time}
      </Text>
    </View>
  );
};

export default function ParentAttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const mockAttendance = {
    rate: 96,
    present: 45,
    late: 2,
    absent: 1,
    recent: [
      { id: '1', date: 'Today, Oct 24', status: 'present', time: '8:05 AM' },
      { id: '2', date: 'Yesterday, Oct 23', status: 'present', time: '8:02 AM' },
      { id: '3', date: 'Tue, Oct 22', status: 'late', time: '8:25 AM' },
      { id: '4', date: 'Mon, Oct 21', status: 'present', time: '7:55 AM' },
      { id: '5', date: 'Fri, Oct 18', status: 'present', time: '8:00 AM' },
    ]
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
      >
        <View className="px-6 mb-6 mt-2">
          <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white tracking-tight">
            Attendance Overview
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-Lexend">
            Track student presence and punctuality
          </Text>
        </View>

        <AttendanceAlert rate={mockAttendance.rate} />

        <View className="px-4 flex-row gap-3 mb-8">
          <StatCard 
            title="Present" 
            value={mockAttendance.present} 
            icon={CheckCircle2} 
            color="#10b981"
            bg="bg-white dark:bg-slate-800"
            border="border-emerald-100 dark:border-slate-700"
          />
          <StatCard 
            title="Late" 
            value={mockAttendance.late} 
            icon={Clock} 
            color="#f59e0b"
            bg="bg-white dark:bg-slate-800"
            border="border-amber-100 dark:border-slate-700"
          />
          <StatCard 
            title="Absent" 
            value={mockAttendance.absent} 
            icon={XCircle} 
            color="#ef4444"
            bg="bg-white dark:bg-slate-800"
            border="border-red-100 dark:border-slate-700"
          />
        </View>

        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text className="text-sm font-LexendMedium text-blue-600 dark:text-blue-400">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            {mockAttendance.recent.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <RecentActivityItem activity={activity} />
              </React.Fragment>
            ))}
          </View>
        </View>

        <View className="px-4 mb-4">
          <TouchableOpacity className="bg-blue-600 dark:bg-blue-600 rounded-2xl p-4 flex-row items-center justify-center gap-2 shadow-sm shadow-blue-600/20">
            <Phone size={18} color="#ffffff" />
            <Text className="text-white font-LexendBold text-sm">
              Report Absence
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
