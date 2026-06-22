import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Sparkles, TrendingUp, Target, BookOpen, Calendar, Star, Zap, User, QrCode } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Tabs, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';

const { width } = Dimensions.get('window');

// API Fetchers
const fetchProfile = async () => {
  const res = await apiClient.get('/students/profile');
  return res.data.data;
};

const fetchAttempts = async () => {
  const res = await apiClient.get('/exams/my/attempts');
  return res.data;
};

const fetchGrades = async () => {
  const res = await apiClient.get('/academic/grades');
  return res.data;
};

const fetchAuthUser = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data.data;
};

const fetchUnreadCount = async () => {
  const res = await apiClient.get('/notifications/unread-count');
  return res.data;
};

const SkeletonItem = ({ className, style }: any) => {
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View className={className} style={style}>
      <Animated.View
        style={{
          flex: 1,
          opacity: pulseAnim,
          backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
          borderRadius: 12
        }}
      />
    </View>
  );
};

export default function StudentDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: fetchProfile,
  });

  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: ['studentAttempts'],
    queryFn: fetchAttempts,
  });

  const { data: gradesData, isLoading: loadingGrades } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: fetchGrades,
  });

  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchAuthUser,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
  });

  const isLoading = loadingProfile || loadingAttempts || loadingGrades;

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = apiClient.defaults.baseURL?.replace(/\/api$/, '') || '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const attempts = attemptsData?.attempts || attemptsData?.data || [];
  const standaloneGrades = gradesData?.grades || gradesData?.data || [];
  const activeClass = profile?.classes?.[0]?.class;
  const unreadCount = unreadData?.count || 0;
  const displayImage = profile?.profileImage || authUser?.profileImage;
  
  const termInfo = activeClass?.session || activeClass?.term
    ? `${activeClass.session || 'Current Session'} - ${activeClass.term || 'Active Term'}`
    : "2023/24 - Second Term";

  const enrolledSubjectsCount = activeClass?.subjects?.length || 0;

  // AI Analysis Logic
  const analysis = useMemo(() => {
    if (!attempts || attempts.length === 0) return null;

    const subjectsMap: Record<string, { total: number, score: number, count: number }> = {};

    attempts.forEach((attempt: any) => {
      attempt.subjectAttempts?.forEach((sa: any) => {
        const subName = sa.subjectPaper?.subject?.name || sa.subjectPaper?.title || 'Unknown Subject';
        if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
        subjectsMap[subName].score += sa.score || 0;
        subjectsMap[subName].total += (sa.subjectPaper?.totalMarks || 100);
        subjectsMap[subName].count += 1;
      });
    });

    standaloneGrades?.forEach((grade: any) => {
      const subName = grade.subject || 'Unknown Subject';
      if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
      subjectsMap[subName].score += grade.score || 0;
      subjectsMap[subName].total += (grade.maxMarks || 100);
      subjectsMap[subName].count += 1;
    });

    const chartData = Object.entries(subjectsMap).map(([name, data]) => ({
      subject: name,
      A: Math.round((data.score / (data.total || 1)) * 100),
      fullMark: 100,
    }));

    if (chartData.length === 0) return null;

    const sortedSubjects = [...chartData].sort((a, b) => a.A - b.A);
    const weakest = sortedSubjects[0];
    const strongest = sortedSubjects[sortedSubjects.length - 1];

    let advice = "";
    if (weakest.A < 40) {
      advice = `You need to put more effort into ${weakest.subject} (F9 standing). We recommend getting a tutor and practicing well before the next exam.`;
    } else if (weakest.A < 50) {
      advice = `Your performance in ${weakest.subject} is at a Pass level (D7/E8). Try practicing more past questions so you can hit Credit (C6) or higher.`;
    } else if (weakest.A < 75) {
      advice = `You are doing well in ${weakest.subject} (Credit range). If you push a bit more, you can secure a Distinction (A1/B2) for the next one.`;
    } else {
      advice = `Excellent! You have mastered ${weakest.subject} well at ${weakest.A}% (A1 level). Keep it up and help your peers who are struggling.`;
    }

    return { chartData, weakest, strongest, advice };
  }, [attempts, standaloneGrades]);

  const gpa = useMemo(() => {
    if (attempts.length === 0 && standaloneGrades.length === 0) return "0.00";

    let totalWeight = 0;
    let totalPoints = 0;

    const getPoints = (percent: number) => {
      if (percent >= 75) return 5.0;
      if (percent >= 70) return 4.0;
      if (percent >= 65) return 3.5;
      if (percent >= 50) return 3.0;
      if (percent >= 45) return 2.0;
      if (percent >= 40) return 1.0;
      return 0.0;
    };

    attempts?.forEach((a: any) => {
      const p = (a.totalScore / (a.totalMarks || 1)) * 100;
      if (!isNaN(p)) {
        totalPoints += getPoints(p);
        totalWeight += 1;
      }
    });

    standaloneGrades?.forEach((g: any) => {
      const p = (g.score / (g.maxMarks || 1)) * 100;
      if (!isNaN(p)) {
        totalPoints += getPoints(p);
        totalWeight += 1;
      }
    });

    return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : "0.00";
  }, [attempts, standaloneGrades]);

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-slate-50 dark:bg-[#020617]">
        <Tabs.Screen 
          options={{ 
            headerShown: true, 
            headerTitle: 'QefasHub', 
            headerTitleAlign: 'center',
            headerTitleStyle: { fontFamily: 'LexendBlack', fontSize: 20, color: isDark ? '#ffffff' : '#0f172a' }, 
            headerStyle: { backgroundColor: isDark ? '#020617' : '#ffffff' }, 
            headerShadowVisible: false, 
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.push('/linking' as any)} style={{ paddingLeft: 20 }}>
                <QrCode size={22} color={isDark ? "#cbd5e1" : "#334155"} />
              </TouchableOpacity>
            ),
            headerRight: () => null 
          }} 
        />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Skeleton */}
          <View className="px-6 pt-6 pb-8 bg-white dark:bg-[#020617]">
            <View className="mb-8">
              <SkeletonItem className="w-24 h-4 mb-2" />
              <SkeletonItem className="w-48 h-8 mb-2" />
              <SkeletonItem className="w-40 h-8 mb-4" />
              <SkeletonItem className="w-32 h-6 rounded-full" />
            </View>
            {/* Stats Cards Skeleton */}
            <View className="flex-row gap-3">
              {[1, 2, 3].map(i => (
                <View key={i} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
                  <SkeletonItem className="w-16 h-3 mb-3" />
                  <SkeletonItem className="w-12 h-8" />
                </View>
              ))}
            </View>
          </View>
          {/* Quick Actions Skeleton */}
          <View className="px-6 mb-8">
            <View className="bg-slate-900 dark:bg-slate-900/60 rounded-[2.5rem] p-6">
              <SkeletonItem className="w-32 h-6 mb-6 bg-slate-700" />
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {[1, 2, 3, 4].map(i => (
                  <View key={i} className="w-[48%] p-4 bg-white/5 rounded-3xl items-center">
                    <SkeletonItem className="w-12 h-12 rounded-2xl mb-3 bg-slate-700" />
                    <SkeletonItem className="w-16 h-3 bg-slate-700" />
                  </View>
                ))}
              </View>
            </View>
          </View>
          {/* Progress Skeleton */}
          <View className="px-6 mb-8">
            <View className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-6 shadow-sm">
              <SkeletonItem className="w-48 h-8 mb-6" />
              <SkeletonItem className="w-full h-16 rounded-3xl mb-6" />
              <View className="flex-row gap-3">
                <SkeletonItem className="flex-1 h-24 rounded-3xl" />
                <SkeletonItem className="flex-1 h-24 rounded-3xl" />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-slate-50 dark:bg-[#020617]">
      <Tabs.Screen 
        options={{
          headerShown: true,
          headerTitle: 'QefasHub',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontFamily: 'LexendBlack', fontSize: 20, color: isDark ? '#ffffff' : '#0f172a' },
          headerStyle: { backgroundColor: isDark ? '#020617' : '#ffffff' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/linking' as any)} style={{ paddingLeft: 20 }}>
              <QrCode size={22} color={isDark ? "#cbd5e1" : "#334155"} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 16 }}>
              <TouchableOpacity 
                onPress={() => router.push('/notifications')}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#0f172a' : '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0' }}
              >
                <Bell size={18} color={isDark ? "#cbd5e1" : "#334155"} />
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: isDark ? '#020617' : '#ffffff' }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#ffffff' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1e293b' : '#e2e8f0', overflow: 'hidden', borderWidth: 2, borderColor: isDark ? '#1e293b' : '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                {getImageUrl(displayImage) ? (
                  <Image 
                    source={{ uri: getImageUrl(displayImage)! }} 
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <User size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                )}
              </TouchableOpacity>
            </View>
          )
        }}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header / Hero Section */}
        <View className="px-6 pt-6 pb-8 bg-white dark:bg-[#020617]">
          <View className="flex-row justify-between items-start mb-8">
            <View className="flex-1">
              <Text className="font-lexend text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">
                {profile?.school?.name || profile?.schoolName || 'QefasHub'}
              </Text>
              <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white tracking-tight">
                Welcome back,
              </Text>
              <Text className="font-lexend-bold text-3xl text-pink-500 tracking-tight italic">
                {profile?.name || 'Student'}!
              </Text>
              <View className="mt-2 bg-slate-100 dark:bg-slate-900 self-start px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <Text className="font-lexend text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">
                  {termInfo}
                </Text>
              </View>
            </View>
          </View>

          {/* Console Insights (GPA & Stats) */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
              <Text className="font-lexend text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Current GPA</Text>
              <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white">{gpa}</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
              <Text className="font-lexend text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Exams Taken</Text>
              <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white">{attempts.length}</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
              <Text className="font-lexend text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Subjects</Text>
              <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white">{enrolledSubjectsCount}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 mb-8">
          <View className="bg-slate-900 dark:bg-slate-900/60 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative">
            <View className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            
            <View className="flex-row items-center justify-between mb-6">
              <Text className="font-lexend-bold text-xl text-white uppercase italic tracking-tight">
                Quick <Text className="text-pink-500">Actions</Text>
              </Text>
              <Zap size={20} color="#ec4899" fill="#ec4899" />
            </View>
            
            <View className="flex-row flex-wrap justify-between gap-y-3">
              <QuickActionItem icon={BookOpen} label="My Classes" bgColor="bg-pink-500" iconColor="white" />
              <QuickActionItem icon={Target} label="CA & Exams" bgColor="bg-rose-500" iconColor="white" />
              <QuickActionItem icon={Calendar} label="Assignments" bgColor="bg-slate-800 dark:bg-slate-200" iconColor="white dark:text-slate-900" />
              <QuickActionItem icon={Star} label="Results" bgColor="bg-amber-500" iconColor="white" />
            </View>
          </View>
        </View>

        {/* Academic Progress */}
        {analysis && (
          <View className="px-6 mb-8">
            <View className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
              <View className="flex-row items-center gap-3 mb-6">
                <View className="h-10 w-10 rounded-xl bg-pink-500 items-center justify-center shadow-lg shadow-pink-500/30">
                  <Sparkles size={20} color="white" />
                </View>
                <Text className="font-lexend-bold text-lg text-slate-900 dark:text-white uppercase italic tracking-tight flex-1">
                  Academic <Text className="text-pink-500">Progress</Text>
                </Text>
              </View>

              {analysis.advice ? (
                <View className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 mb-6">
                  <Text className="font-lexend-bold text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{analysis.advice}"
                  </Text>
                </View>
              ) : null}

              <View className="flex-row gap-3">
                {analysis.strongest && (
                  <View className="flex-1 p-4 rounded-3xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10">
                    <View className="flex-row items-center gap-1.5 mb-2">
                      <TrendingUp size={12} color="#10b981" />
                      <Text className="font-lexend-bold text-[9px] uppercase tracking-wider text-emerald-500">Strongest</Text>
                    </View>
                    <Text className="font-lexend-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight" numberOfLines={1}>{analysis.strongest.subject}</Text>
                  </View>
                )}
                {analysis.weakest && analysis.weakest.subject !== analysis.strongest?.subject && (
                  <View className="flex-1 p-4 rounded-3xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10">
                    <View className="flex-row items-center gap-1.5 mb-2">
                      <Target size={12} color="#f43f5e" />
                      <Text className="font-lexend-bold text-[9px] uppercase tracking-wider text-rose-500">Needs Work</Text>
                    </View>
                    <Text className="font-lexend-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight" numberOfLines={1}>{analysis.weakest.subject}</Text>
                  </View>
                )}
              </View>

              {analysis.chartData && analysis.chartData.length > 0 && (
                <View className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Text className="font-lexend-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Subject Mastery</Text>
                  <View className="gap-3">
                    {analysis.chartData.map((data: any, idx: number) => (
                      <View key={idx} className="flex-row items-center gap-3">
                        <Text className="font-lexend text-[10px] text-slate-600 dark:text-slate-300 w-20" numberOfLines={1}>{data.subject}</Text>
                        <View className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-pink-500 rounded-full" 
                            style={{ width: `${data.A}%` }} 
                          />
                        </View>
                        <Text className="font-lexend-bold text-[10px] text-slate-900 dark:text-white w-8 text-right">{data.A}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionItem({ icon: Icon, label, bgColor, iconColor }: { icon: any, label: string, bgColor: string, iconColor: string }) {
  const isDarkText = iconColor.includes('text-slate-900');
  return (
    <TouchableOpacity 
      className="w-[48%] items-center justify-center p-4 bg-white/5 dark:bg-white/[0.02] rounded-3xl border border-white/10 dark:border-white/5"
    >
      <View className={`h-12 w-12 rounded-2xl items-center justify-center mb-3 ${bgColor}`}>
        <Icon size={24} color={isDarkText ? '#0f172a' : 'white'} />
      </View>
      <Text className="font-lexend-bold text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-400">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
