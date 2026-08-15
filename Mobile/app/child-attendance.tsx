import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Activity, CalendarDays } from 'lucide-react-native';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChildAttendanceScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const { data: student, isLoading } = useChildDetails(childId);
    const { data: dashboardData } = useParentDashboard(childId);
    
    const isDark = useColorScheme() === 'dark';
    const primaryColor = '#10b981';

    const attendanceStats = useMemo(() => {
        // Sort all history chronological descending
        const history = student?.attendances ? [...student.attendances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
        
        // Calculate monthly days
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyAttendances = history.filter(a => {
            const d = new Date(a.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        
        // Use server-computed rate for consistency
        const rate = dashboardData?.stats?.attendanceRate ?? 0;
        
        return { rate, history, monthlyDays: monthlyAttendances.length };
    }, [student?.attendances, dashboardData?.stats?.attendanceRate]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
                <ActivityIndicator size="large" color={primaryColor} />
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full items-center justify-center mr-4 border border-emerald-200 dark:border-emerald-800">
                        <Activity size={20} color="#10b981" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Attendance History</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {student?.name || 'Student'} • {student?.classes?.[0]?.class?.name || 'No Class'}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 pt-6">
                    <FlatList
                        data={attendanceStats.history}
                        keyExtractor={(_, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListHeaderComponent={
                            <View>
                                {/* Overview Card */}
                                <View className="bg-emerald-500 rounded-[2rem] p-8 shadow-lg shadow-emerald-500/30 mb-8 relative overflow-hidden">
                                    <View className="absolute -right-8 -top-8 opacity-20">
                                        <CalendarDays size={120} color="#fff" />
                                    </View>
                                    <Text className="text-emerald-100 font-LexendBold uppercase tracking-widest text-xs mb-2">This Month's Rate</Text>
                                    <View className="flex-row items-baseline gap-2">
                                        <Text className="text-6xl font-LexendBlack text-white">{attendanceStats.rate}</Text>
                                        <Text className="text-xl font-LexendBold text-emerald-200">%</Text>
                                    </View>
                                    <Text className="text-emerald-100 font-Lexend mt-4">
                                        Based on {attendanceStats.monthlyDays} recorded days this month.
                                    </Text>
                                </View>
                                <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight mb-6">Full Log</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <View className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-12 items-center shadow-sm">
                                <Activity size={48} color="#cbd5e1" className="mb-4" />
                                <Text className="text-lg font-bold text-slate-400 dark:text-slate-500">No Attendance Data</Text>
                                <Text className="text-sm text-slate-400 dark:text-slate-600 mt-2 text-center">Your child hasn't had any attendance recorded.</Text>
                            </View>
                        }
                        renderItem={({ item: record }) => {
                            const statusStr = record.status?.toUpperCase() || '';
                            const isPresent = statusStr === 'PRESENT';
                            const isLate = statusStr === 'LATE';
                            
                            const dotClass = isPresent ? 'bg-emerald-500 shadow-emerald-500/50' : 
                                                isLate ? 'bg-amber-500 shadow-amber-500/50' : 'bg-rose-500 shadow-rose-500/50';
                                                
                            const badgeBgClass = isPresent ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 
                                                    isLate ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' : 
                                                    'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20';
                                                    
                            const textClass = isPresent ? 'text-emerald-600 dark:text-emerald-400' : 
                                                isLate ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
                                                
                            return (
                                <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] mb-4 p-5 flex-row items-center justify-between shadow-sm">
                                    <View className="flex-row items-center gap-4">
                                        <View className={`w-3 h-3 rounded-full shadow-sm ${dotClass}`} />
                                        <Text className="text-sm font-LexendBold text-slate-700 dark:text-slate-300">
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                    </View>
                                    <View className={`px-4 py-1.5 rounded-full border ${badgeBgClass}`}>
                                        <Text className={`text-[10px] font-LexendBlack uppercase tracking-widest ${textClass}`}>
                                            {record.status}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}
