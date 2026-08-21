import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNetwork } from '@/hooks/use-network';
import { Bell, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { useUnreadCount } from '@/lib/api/hooks/useNotifications';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

import { TeacherHero } from '../../components/teacher-dashboard/TeacherHero';
import { TeacherInsights } from '../../components/teacher-dashboard/TeacherInsights';
import { QuickActions } from '../../components/teacher-dashboard/QuickActions';

export default function TeacherHomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { isConnected } = useNetwork();
  const { data: unreadData, refetch: refetchUnread } = useUnreadCount();
  const { data: user, refetch: refetchUser } = useAuthUser();
  const unreadCount = unreadData?.count || 0;

  const [refreshing, setRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    if (!isConnected) return;
    setRefreshing(true);
    await Promise.all([
      refetchUser(), 
      refetchUnread(),
      queryClient.invalidateQueries({ queryKey: ['teacherDashboardStats'] })
    ]);
    setRefreshing(false);
  }, [isConnected, refetchUser, refetchUnread, queryClient]);

  const gradientColors = isDark 
    ? (['#064e3b', '#022c22', '#0f172a'] as const)
    : (['#dcfce7', '#f0fdf4', '#ffffff'] as const);

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.4, 1]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={isDark ? '#34d399' : '#059669'}
            colors={['#059669']}
          />
        }
      >
        {/* Top Navigation */}
        <View className="flex-row items-center justify-between px-6 py-2 mb-2 mt-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm mr-3"
            >
              {(() => {
                const fallbackUrl = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nerd%20Face.png';
                return (
                  <Image 
                    source={{ uri: user?.profileImage || fallbackUrl }} 
                    placeholder={{ uri: fallbackUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={500}
                  />
                );
              })()}
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-LexendBold text-slate-800 dark:text-white">{user?.name?.split(' ')[0] || 'Teacher'}</Text>
              <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                Teacher Dashboard
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
                <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 rounded-full items-center justify-center border-2 border-white dark:border-slate-800">
                  <Text className="text-[9px] font-black text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TeacherHero />
        <TeacherInsights />
        <QuickActions />
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}
