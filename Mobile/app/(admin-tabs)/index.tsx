import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useMySchoolStats } from '@/lib/api/hooks/useSchool';
import { AdminHero } from '../../components/admin-dashboard/AdminHero';
import { AdminInsights } from '../../components/admin-dashboard/AdminInsights';
import { AdminCharts } from '../../components/admin-dashboard/AdminCharts';
import { QuickActions } from '../../components/admin-dashboard/QuickActions';
import { Lock, Bell, User as UserIcon } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableOpacity, Image } from 'react-native';
import { SearchBar } from '../../components/ui/SearchBar';

export default function AdminHomeScreen() {
  const { data: stats, isLoading, refetch } = useMySchoolStats();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          
          {/* Top Navigation - Left aligned avatar and greeting */}
          <View className="flex-row items-center justify-between mb-6 mt-2">
            <View className="flex-row items-center flex-1">
              {/* Left: Profile Avatar */}
              <TouchableOpacity 
                onPress={() => router.push('/admin-profile')}
                className="h-12 w-12 rounded-full overflow-hidden mr-3 bg-indigo-100 dark:bg-indigo-900 items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm"
              >
                <Image 
                  source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Admin' }} 
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Greeting */}
              <View>
                <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
                  Hello, Admin!
                </Text>
                <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                  Manage your school easily
                </Text>
              </View>
            </View>

            {/* Right: Notifications */}
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              className="h-10 w-10 items-center justify-center relative bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <Bell size={20} color={isDark ? '#ffffff' : '#0f172a'} />
              <View className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <SearchBar />

          <AdminHero schoolName="Admin Console" />
          <AdminInsights stats={stats} isLoading={isLoading} />
          <QuickActions />

          <AdminCharts />
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
