import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User as UserIcon, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUnreadCount } from '@/lib/api/hooks/useNotifications';

import { ParentHero } from '../../components/parent-dashboard/ParentHero';
import { InsightsGrid } from '../../components/parent-dashboard/InsightsGrid';
import { PerformanceWidget } from '../../components/parent-dashboard/PerformanceWidget';
import { ChildrenOverview } from '../../components/parent-dashboard/ChildrenOverview';
import { FinancialSummary } from '../../components/parent-dashboard/FinancialSummary';
import { AnnouncementsFeed } from '../../components/parent-dashboard/AnnouncementsFeed';
import { SupportCard } from '../../components/parent-dashboard/SupportCard';

export default function ParentHomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
      >
        {/* Top Navigation */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-transparent mt-2 mb-2">
          <TouchableOpacity 
            onPress={() => router.push('/parent-profile')}
            className="h-10 w-10 items-center justify-center"
          >
            <View className="h-9 w-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 items-center justify-center bg-slate-100 dark:bg-slate-800">
              <Text className="text-sm font-LexendBlack text-pink-600 dark:text-pink-500">
                P
              </Text>
            </View>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Qefas <Text className="text-pink-600">Hub</Text>
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              className="h-10 w-10 items-center justify-center relative"
            >
              <Bell size={24} color={isDark ? '#ffffff' : '#0f172a'} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-red-500 rounded-full items-center justify-center border-2 border-slate-50 dark:border-black">
                  <Text className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4">
          <ParentHero />
        </View>

        <View className="mt-4">
          <View className="px-6 mb-4">
            <Text className="text-xl font-LexendBold text-slate-900 dark:text-white uppercase tracking-tight">Academic Insights</Text>
            <Text className="text-[11px] text-orange-500 font-LexendBold uppercase tracking-widest mt-1">Real-time performance monitoring</Text>
          </View>
          <InsightsGrid />
          <PerformanceWidget />
        </View>

        <View className="mt-4">
          <ChildrenOverview />
          <FinancialSummary />
        </View>

        <View className="mt-4">
          <AnnouncementsFeed />
        </View>

        <View className="mt-4">
          <SupportCard />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
