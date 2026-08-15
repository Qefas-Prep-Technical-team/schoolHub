import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, BookOpen, Clock } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChildAssignments } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';

export default function ChildAssignmentsScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const isDark = useColorScheme() === 'dark';

    const { data: assignmentsData, isLoading, error } = useChildAssignments(childId);
    const { data: dashboardData } = useParentDashboard(childId);
    
    const assignments = assignmentsData?.assignments || [];
    
    // Calculate highest score
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

    const renderHeader = () => (
        <View className="flex-row justify-between mb-6 gap-3">
            <View className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm items-center">
                <Text className="text-2xl font-black text-amber-500">{assignmentsData?.total || 0}</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 text-center">Total</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm items-center">
                <Text className="text-2xl font-black text-blue-500">{dashboardData?.stats?.averageGrade || 0}%</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 text-center">Avg Score</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm items-center">
                <Text className="text-2xl font-black text-emerald-500">{highestScore}%</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 text-center">Best</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="h-10 w-10 bg-amber-100 dark:bg-amber-900/50 rounded-full items-center justify-center mr-4 border border-amber-200 dark:border-amber-800">
                        <FileText size={20} color="#f59e0b" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Assignments</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Coursework & Homework
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 pt-6">
                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#f59e0b" />
                        </View>
                    ) : error ? (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-rose-500 font-bold mb-2">Failed to load assignments.</Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text className="text-slate-500">Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    ) : assignments.length === 0 ? (
                        <View className="flex-1 justify-center items-center opacity-70">
                            <FileText size={48} color={isDark ? '#475569' : '#94a3b8'} className="mb-4" />
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Assignments</Text>
                            <Text className="text-slate-500 text-center max-w-[250px]">
                                There are no active assignments for your child right now.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={assignments}
                            ListHeaderComponent={renderHeader}
                            keyExtractor={(item: any) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item, index }: { item: any, index: number }) => {
                                const statusRaw = (item.status || 'pending').toLowerCase();
                                
                                let statusBg = "bg-slate-100 dark:bg-slate-800";
                                let statusText = "Pending";
                                let statusColor = "text-slate-700 dark:text-slate-300";

                                if (statusRaw === 'graded' || statusRaw === 'scored') {
                                    statusBg = "bg-green-100 dark:bg-green-900/30";
                                    statusColor = "text-green-700 dark:text-green-400";
                                    statusText = item.grade ? `Graded (${item.grade})` : "Graded";
                                } else if (statusRaw === 'submitted') {
                                    statusBg = "bg-blue-100 dark:bg-blue-900/30";
                                    statusColor = "text-blue-700 dark:text-blue-400";
                                    statusText = "Submitted";
                                } else if (statusRaw === 'late' || statusRaw === 'overdue') {
                                    statusBg = "bg-rose-100 dark:bg-rose-900/30";
                                    statusColor = "text-rose-700 dark:text-rose-400";
                                    statusText = "Late";
                                }

                                const formattedDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date';

                                return (
                                    <TouchableOpacity 
                                        activeOpacity={0.7}
                                        onPress={() => router.push({ pathname: '/child-assignment-details', params: { childId, assignmentId: item.id } })}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm"
                                    >
                                        <View className="flex-row justify-between items-start mb-4">
                                            <View className="flex-1 mr-4">
                                                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1" numberOfLines={2}>{index + 1}. {item.title}</Text>
                                                <View className="flex-row items-center">
                                                    <BookOpen size={14} color={isDark ? '#94a3b8' : '#64748b'} className="mr-2" />
                                                    <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        {item.subject || item.department?.name || 'Subject'}
                                                    </Text>
                                                </View>
                                            </View>
                                            
                                            <View className={`px-3 py-1 rounded-full ${statusBg}`}>
                                                <Text className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                                    {statusText}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                                            <View className="flex-row items-center gap-2">
                                                <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                                                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Due: {formattedDate}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center gap-2">
                                                <FileText size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                                                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {item.questionCount || item._count?.questions || 0} Qs
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
