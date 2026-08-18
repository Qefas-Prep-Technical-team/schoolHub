import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Calculator, Beaker, BookOpen, Globe, CalendarX, AlarmClock as Alarm, Calendar, CheckCircle, ClipboardList, BarChart2, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChildAssignments, useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';

const iconMap = {
  calculate: Calculator,
  science: Beaker,
  book_2: BookOpen,
  public: Globe,
};

const statusConfig = {
  late: {
    borderColor: 'border-l-red-500 dark:border-l-red-500',
    badge: {
      text: 'Late Submission',
      bg: 'bg-red-100 dark:bg-red-900/30',
      textClass: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
    dueIcon: CalendarX,
    dueColor: 'text-red-500',
    dueBg: 'bg-red-50 dark:bg-red-900/20',
    button: 'bg-blue-600',
    buttonText: 'text-white',
  },
  urgent: {
    borderColor: 'border-l-orange-500 dark:border-l-orange-500',
    badge: {
      text: 'In Progress',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      textClass: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
    },
    dueIcon: Alarm,
    dueColor: 'text-orange-600 dark:text-orange-400',
    dueBg: 'bg-orange-50 dark:bg-orange-900/20',
    button: 'bg-white dark:bg-slate-800',
    buttonText: 'text-slate-700 dark:text-white',
  },
  pending: {
    borderColor: 'border-l-blue-600 dark:border-l-blue-600',
    badge: {
      text: 'Not Started',
      bg: 'bg-slate-100 dark:bg-slate-800',
      textClass: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
    },
    dueIcon: Calendar,
    dueColor: 'text-slate-500 dark:text-slate-400',
    dueBg: '',
    button: 'bg-white dark:bg-slate-800',
    buttonText: 'text-slate-700 dark:text-white',
  },
  graded: {
    borderColor: 'border-l-emerald-500 dark:border-l-emerald-500',
    badge: {
      text: 'Graded',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    dueIcon: CheckCircle,
    dueColor: 'text-emerald-600 dark:text-emerald-400',
    dueBg: '',
    button: 'bg-white dark:bg-slate-800',
    buttonText: 'text-slate-700 dark:text-white',
  },
};

const AssignmentCard = ({ assignment, index, childId }: { assignment: any, index: number, childId?: string }) => {
  const router = useRouter();
  const statusRaw = (assignment.status || 'pending').toLowerCase();
  
  // Map API status to config keys
  let mappedStatus = 'pending';
  if (statusRaw === 'graded' || statusRaw === 'scored') mappedStatus = 'graded';
  else if (statusRaw === 'submitted') mappedStatus = 'urgent'; // Treating submitted as 'in progress' visually, or you can map differently
  else if (statusRaw === 'late' || statusRaw === 'overdue') mappedStatus = 'late';
  
  const config = statusConfig[mappedStatus as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = iconMap[assignment.icon as keyof typeof iconMap] || BookOpen;
  const DueIcon = config.dueIcon;

  const formattedDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date';
  const displayScore = assignment.grade || assignment.score;

  return (
    <View className={`bg-white dark:bg-slate-800 rounded-2xl border-l-4 ${config.borderColor} border-t border-b border-r border-slate-200 dark:border-slate-700 p-4 mb-4 shadow-sm flex-col`}>
      <View className="flex-row items-center gap-3 w-full">
        <View className="w-6 items-center justify-center">
          <Text className="text-slate-400 dark:text-slate-500 font-LexendBold text-sm">{index}.</Text>
        </View>
        <View className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-2 shrink-0 border border-slate-100 dark:border-slate-700">
          <IconComponent size={20} color="#64748b" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {assignment.subject || assignment.department?.name || 'Subject'}
            </Text>
            {assignment.teacher && (
              <>
                <View className="w-1 h-1 bg-slate-300 rounded-full" />
                <Text className="text-[10px] text-slate-400">{assignment.teacher}</Text>
              </>
            )}
          </View>
          <Text className="text-sm font-LexendBold text-slate-900 dark:text-white" numberOfLines={1}>
            {assignment.title}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3 pl-10">
        <View className={`flex-row items-center gap-1.5 px-2 py-1 rounded-md ${config.dueBg}`}>
          <DueIcon size={14} className={config.dueColor} color={mappedStatus === 'graded' ? '#10b981' : mappedStatus === 'late' ? '#ef4444' : '#f97316'} />
          <Text className={`text-xs font-LexendMedium ${config.dueColor}`}>
            {formattedDate}
          </Text>
        </View>

        <View className={`px-2 py-1 rounded-full border ${config.badge.bg} ${config.badge.border}`}>
          <Text className={`text-[10px] font-LexendBold ${config.badge.textClass}`}>
            {statusRaw === 'graded' ? 'Graded' : statusRaw === 'submitted' ? 'Submitted' : config.badge.text}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-4 pl-10 pt-3 border-t border-slate-100 dark:border-slate-700/50">
        {displayScore ? (
          <View>
            <Text className="text-[10px] text-slate-400 font-LexendMedium uppercase">Score</Text>
            <Text className="text-sm font-LexendBold text-emerald-600 dark:text-emerald-400">{displayScore}</Text>
          </View>
        ) : (
          <View />
        )}
        <TouchableOpacity 
          onPress={() => childId && router.push({ pathname: '/child-assignment-details', params: { childId, assignmentId: assignment.id } })}
          className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 ${config.button}`}>
          <Text className={`text-xs font-LexendBold ${config.buttonText}`}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ParentAssignmentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const { data: assignmentsData, isLoading, refetch: refetchAssignments, isRefetching: isRefetchingAssignments } = useChildAssignments(activeChildId || null);
  const { data: dashboardData, refetch: refetchDashboard, isRefetching: isRefetchingDashboard } = useParentDashboard(activeChildId || undefined);

  const onRefresh = React.useCallback(() => {
    if (activeChildId) {
      refetchAssignments();
      refetchDashboard();
    }
  }, [activeChildId, refetchAssignments, refetchDashboard]);

  const assignments = assignmentsData?.assignments || [];

  const highestScore = assignments.length > 0
    ? Math.round(Math.max(0, ...assignments.map((a: any) => {
        if (!a.grade) return 0;
        const parts = a.grade.split('/');
        const score = parseFloat(parts[0]);
        const max = parts.length > 1 ? parseFloat(parts[1]) : 100;
        if (isNaN(score) || isNaN(max) || max === 0) return 0;
        return (score / max) * 100;
    })))
    : 0;

  const widgets = [
    {
      id: 1,
      title: 'Total Assignments',
      value: `${assignmentsData?.total || 0}`,
      subtitle: 'Recorded Assessments',
      icon: ClipboardList,
      color: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-900/30',
        iconColor: '#2563eb'
      },
    },
    {
      id: 2,
      title: 'Average Score',
      value: `${dashboardData?.stats?.averageGrade || 0}%`,
      subtitle: 'Overall Performance',
      icon: BarChart2,
      color: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-100 dark:border-orange-900/30',
        iconColor: '#f97316'
      },
    },
    {
      id: 3,
      title: 'Highest Score',
      value: `${highestScore}%`,
      subtitle: 'Top Achievement',
      icon: Award,
      color: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        iconColor: '#10b981'
      },
    },
  ];

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
          refreshControl={
            <RefreshControl refreshing={isRefetchingAssignments || isRefetchingDashboard} onRefresh={onRefresh} tintColor={isDark ? '#f97316' : '#ea580c'} />
          }
        >
        <View className="px-6 mb-6 mt-2">
          <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white tracking-tight">
            Assignments Overview
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-Lexend">
            Manage and track academic progress
          </Text>
        </View>

        {/* Overview Widgets */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="pl-6 mb-8"
          contentContainerStyle={{ paddingRight: 32 }}
        >
          {widgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <View 
                key={widget.id} 
                className={`w-48 bg-white dark:bg-slate-800 p-4 rounded-2xl border ${widget.color.border} mr-4 shadow-sm`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-LexendMedium uppercase">
                      {widget.title}
                    </Text>
                    <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white mt-1">
                      {widget.value}
                    </Text>
                  </View>
                  <View className={`p-2 rounded-xl ${widget.color.bg}`}>
                    <Icon size={18} color={widget.color.iconColor} />
                  </View>
                </View>
                <Text className="text-[10px] font-LexendMedium text-slate-400 mt-2 uppercase tracking-wider">
                  {widget.subtitle}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Assignments List */}
        <View className="px-4">
          {isLoading ? (
            <View className="py-10 items-center justify-center">
              <Text className="text-slate-500 dark:text-slate-400 font-Lexend">Loading assignments...</Text>
            </View>
          ) : assignments.length === 0 ? (
            <View className="py-10 items-center justify-center">
              <Text className="text-slate-500 dark:text-slate-400 font-Lexend">No assignments found.</Text>
            </View>
          ) : (
            assignments.map((assignment: any, index: number) => (
              <AssignmentCard key={assignment.id || index} assignment={assignment} index={index + 1} childId={activeChildId} />
            ))
          )}
        </View>

      </ScrollView>
      )}
      </SafeAreaView>
    </LinearGradient>
  );
}
