import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Bell, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUnreadCount } from '@/lib/api/hooks/useNotifications';

import { TeacherHero } from '../../components/teacher-dashboard/TeacherHero';
import { TeacherInsights } from '../../components/teacher-dashboard/TeacherInsights';
import { QuickActions } from '../../components/teacher-dashboard/QuickActions';

export default function TeacherHomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 }}
      >
        {/* Top Navigation */}
        <View className="flex-row items-center justify-between px-2 py-4 bg-transparent mt-2 mb-2">
          <TouchableOpacity className="h-10 w-10 items-center justify-center">
            <User size={24} color={isDark ? '#ffffff' : '#0f172a'} strokeWidth={2.5} />
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
                <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full items-center justify-center border-2 border-slate-50 dark:border-black">
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
  );
}
