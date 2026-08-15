import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNetwork } from '@/hooks/use-network';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { ChildCard } from '../../components/parent-children/ChildCard';
import { AddChildCard } from '../../components/parent-children/AddChildCard';

export default function ParentChildrenScreen() {
  const router = useRouter();
  const { data: children = [], isLoading, isError, refetch } = useParentChildren();

  const { isConnected } = useNetwork();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    if (!isConnected) return;
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [isConnected, refetch]);

  const getGradeLabel = (avg: number) => {
    if (avg >= 70) return 'A';
    if (avg >= 60) return 'B';
    if (avg >= 50) return 'C';
    if (avg >= 45) return 'D';
    if (avg >= 40) return 'E';
    return 'F';
  };

  const mappedChildren = children.map((c) => ({
    id: c.id,
    name: c.name,
    age: 0,
    grade: getGradeLabel(c.stats?.averageGrade || 0),
    class: c.currentClass ? `${c.currentClass.name} ${c.currentClass.section || ''}` : 'No Class Assigned',
    studentId: c.studentCode,
    imageUrl: c.profileImage || '',
    attendance: c.stats?.attendanceRate || 0,
    todayAttendance: c.stats?.todayAttendance,
    gradeValue: getGradeLabel(c.stats?.averageGrade || 0),
    gradePercentage: `${c.stats?.averageGrade || 0}%`,
    status: (c.linkStatus === 'ACCEPTED' || c.linkStatus === 'active') ? 'active' as const : 'inactive' as const,
  }));

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <View className="px-6 pt-6 pb-6">
        <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mb-1">
          Parent Dashboard
        </Text>
        <Text className="text-3xl font-LexendBlack text-slate-900 dark:text-white tracking-tight">
          My Linked Children
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />}
      >
        {isError && (
          <View className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 mb-6">
            <Text className="text-red-600 dark:text-red-400 font-bold text-center">Failed to load children.</Text>
          </View>
        )}

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#ea580c" />
            <Text className="text-slate-500 dark:text-slate-400 mt-4 font-Lexend">Loading your linked children...</Text>
          </View>
        ) : (
          mappedChildren.map((child) => (
            <ChildCard 
              key={child.id} 
              child={child} 
              onPress={() => router.push({ pathname: '/child-details', params: { childId: child.id } })}
            />
          ))
        )}

        <AddChildCard />
      </ScrollView>
    </SafeAreaView>
  );
}
