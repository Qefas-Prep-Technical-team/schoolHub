import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CheckCircle2, AlertCircle, XCircle, Clock, Calendar, ChevronRight, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';

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
  const router = useRouter();

  const gradientColors = isDark 
    ? (['#431407', '#1e293b', '#0f172a'] as const)
    : (['#ffedd5', '#fff7ed', '#ffffff'] as const);

  const [activeChildId, setActiveChildId] = React.useState<string | undefined>();
  const [hasLoadedDefault, setHasLoadedDefault] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('defaultChildId').then(id => {
      if (id) setActiveChildId(id);
      setHasLoadedDefault(true);
    });
  }, []);

  const { data: children } = useParentChildren();

  React.useEffect(() => {
    if (hasLoadedDefault && children && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [hasLoadedDefault, children, activeChildId]);

  const { data: attendanceData, isLoading } = useStudentAttendance(activeChildId || '');
  const { data: dashboardData } = useParentDashboard(activeChildId || undefined);

  let present = 0;
  let late = 0;
  let absent = 0;

  const records = Array.isArray(attendanceData) ? attendanceData : [];

  records.forEach((record: any) => {
    const s = record.status?.toLowerCase() || '';
    if (s === 'present') present++;
    else if (s === 'late') late++;
    else if (s === 'absent') absent++;
  });

  const recent = [...records]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((r: any) => {
      const d = new Date(r.date);
      return {
          id: r.id,
          date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          status: r.status?.toLowerCase() || 'present',
          time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
    });

  const attendanceRate = dashboardData?.stats?.attendanceRate || 0;

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.4, 1]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={['top']}>
      {!hasLoadedDefault ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#f97316' : '#ea580c'} />
        </View>
      ) : (
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

        <AttendanceAlert rate={attendanceRate} />

        <View className="px-4 flex-row gap-3 mb-8">
          <StatCard 
            title="Present" 
            value={present} 
            icon={CheckCircle2} 
            color="#10b981"
            bg="bg-white dark:bg-slate-800"
            border="border-emerald-100 dark:border-slate-700"
          />
          <StatCard 
            title="Late" 
            value={late} 
            icon={Clock} 
            color="#f59e0b"
            bg="bg-white dark:bg-slate-800"
            border="border-amber-100 dark:border-slate-700"
          />
          <StatCard 
            title="Absent" 
            value={absent} 
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
            <TouchableOpacity onPress={() => activeChildId && router.push({ pathname: '/child-attendance', params: { childId: activeChildId } })}>
              <Text className="text-sm font-LexendMedium text-blue-600 dark:text-blue-400">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            {isLoading ? (
               <View className="py-6 items-center justify-center">
                 <Text className="text-slate-500 dark:text-slate-400 font-Lexend">Loading activity...</Text>
               </View>
            ) : recent.length === 0 ? (
               <View className="py-6 items-center justify-center">
                 <Text className="text-slate-500 dark:text-slate-400 font-Lexend">No recent activity.</Text>
               </View>
            ) : (
              recent.map((activity, index) => (
                <React.Fragment key={activity.id || index}>
                  <RecentActivityItem activity={activity} />
                </React.Fragment>
              ))
            )}
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
      )}
      </SafeAreaView>
    </LinearGradient>
  );
}
