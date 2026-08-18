import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, InteractionManager, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Bell } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUnreadCount } from '@/lib/api/hooks/useNotifications';
import { useNetwork } from '@/hooks/use-network';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ParentDashboardCarousel } from '../../components/parent-dashboard/ParentDashboardCarousel';
import { QuickAccess } from '../../components/parent-dashboard/QuickAccess';
import { AcademicOverview } from '../../components/parent-dashboard/AcademicOverview';
import { InsightsGrid } from '../../components/parent-dashboard/InsightsGrid';
import { PerformanceChart } from '../../components/parent-dashboard/PerformanceChart';
import { UpcomingExams } from '../../components/parent-dashboard/UpcomingExams';
import { NotificationsFeed } from '../../components/parent-dashboard/NotificationsFeed';
import { FeeSummary } from '../../components/parent-dashboard/FeeSummary';

export default function ParentHomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: unreadData, refetch: refetchUnread } = useUnreadCount();
  const router = useRouter();
  const unreadCount = unreadData?.count || 0;

  const [refreshing, setRefreshing] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string | undefined>();
  const [hasLoadedDefault, setHasLoadedDefault] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('defaultChildId').then(id => {
      if (id) setActiveChildId(id);
      setHasLoadedDefault(true);
    });
  }, []);

  const { isConnected } = useNetwork();

  const { data: user } = useAuthUser();
  const { data: children, refetch: refetchChildren } = useParentChildren();
  
  const activeChild = children?.find(c => c.id === activeChildId) || children?.[0];
  
  // If activeChildId is not set yet but we have children, initialize it to the default (or first)
  React.useEffect(() => {
    if (hasLoadedDefault && children && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [hasLoadedDefault, children, activeChildId]);

  const activeChildClass = activeChild?.currentClass 
    ? `${activeChild.currentClass.name} - ${activeChild.currentClass.section}`
    : 'No Class Assigned';

  const { data: dashboardData, isError, error, refetch: refetchDashboard } = useParentDashboard(activeChildId);

  useFocusEffect(
    useCallback(() => {
      if (!isConnected) return;
      const task = InteractionManager.runAfterInteractions(() => {
        refetchChildren();
        refetchDashboard();
        refetchUnread();
      });
      return () => task.cancel();
    }, [isConnected, refetchChildren, refetchDashboard, refetchUnread])
  );

  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    if (!isConnected) return;
    setRefreshing(true);
    await Promise.all([
      refetchUnread(),
      refetchDashboard(),
      refetchChildren()
    ]);
    setRefreshing(false);
  }, [isConnected, refetchUnread, refetchDashboard, refetchChildren]);

  // Orange theme gradients
  const gradientColors = isDark 
    ? (['#431407', '#1e293b', '#0f172a'] as const) // Dark orange to dark slate
    : (['#ffedd5', '#fff7ed', '#ffffff'] as const); // Light orange to white

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.4, 1]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Top Navigation */}
        <View className="flex-row items-center justify-between px-6 py-2 mb-2 mt-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.push('/parent-profile')}
              className="h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm mr-3"
            >
              <Image 
                source={{ uri: user?.profileImage || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Neutral%20Face.png' }} 
                placeholder={{ uri: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Neutral%20Face.png' }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={500}
              />
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-LexendBold text-slate-800 dark:text-white">Hello, {user?.name?.split(' ')[0] || 'Parent'}</Text>
              <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                {activeChildClass}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              className="h-10 w-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center relative shadow-sm"
            >
              <Bell size={20} color={isDark ? '#94a3b8' : '#475569'} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 rounded-full items-center justify-center border-2 border-white dark:border-slate-800">
                  <Text className="text-[9px] font-black text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {!hasLoadedDefault ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#f97316' : '#ea580c'} />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? '#f97316' : '#ea580c'} // iOS spinner color
                colors={['#ea580c']} // Android spinner color
              />
            }
          >

          <View className="px-6">
            <ParentDashboardCarousel 
              childrenData={children || []} 
              isLoading={!children} 
              onChildChange={setActiveChildId} 
            />
            <QuickAccess />
            <InsightsGrid activeChildId={activeChildId} />
            <AcademicOverview activeChildId={activeChildId} />
            <PerformanceChart activeChildId={activeChildId} />
            <UpcomingExams activeChildId={activeChildId} />
            <NotificationsFeed activeChildId={activeChildId} />
            <FeeSummary activeChildId={activeChildId} />
          </View>

        </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
