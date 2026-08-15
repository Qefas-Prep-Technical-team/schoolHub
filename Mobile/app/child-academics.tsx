import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen, Star, Target } from 'lucide-react-native';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SubjectPerformanceBar = ({ subject, score, maxMarks }: { subject: string; score: number; maxMarks: number }) => {
    const percentage = Math.round((score / maxMarks) * 100);
    const color = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';
    
    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-end mb-3">
                <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{subject}</Text>
                <Text className="text-lg font-black text-slate-900 dark:text-white">{percentage}%</Text>
            </View>
            <View className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <View className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
            </View>
        </View>
    );
};

export default function ChildAcademicsScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const { data: student, isLoading } = useChildDetails(childId);
    
    const isDark = useColorScheme() === 'dark';
    const primaryColor = '#ea580c';

    const performanceStats = useMemo(() => {
        if (!student?.grades?.length) return { avg: 0, subjects: [] };
        
        const subjectMap = new Map<string, { totalScore: number, totalMax: number, count: number }>();
        
        let sum = 0;
        student.grades.forEach(g => {
            const pct = (g.score / g.maxMarks) * 100;
            sum += pct;
            
            const subjName = g.subjectPaper?.subject?.name || g.subject || 'General';
            const curr = subjectMap.get(subjName) || { totalScore: 0, totalMax: 0, count: 0 };
            subjectMap.set(subjName, {
                totalScore: curr.totalScore + g.score,
                totalMax: curr.totalMax + g.maxMarks,
                count: curr.count + 1
            });
        });
        
        const subjects = Array.from(subjectMap.entries()).map(([name, data]) => ({
            name,
            score: data.totalScore,
            maxMarks: data.totalMax
        }));
        
        return { 
            avg: Math.round(sum / student.grades.length),
            subjects
        };
    }, [student?.grades]);

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
                    <View className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full items-center justify-center mr-4 border border-indigo-200 dark:border-indigo-800">
                        <Star size={20} color="#6366f1" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Academic Progress</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {student?.name || 'Student'} • {student?.classes?.[0]?.class?.name || 'No Class'}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Overview Card */}
                    <View className="bg-indigo-600 rounded-[2rem] p-8 shadow-lg shadow-indigo-500/30 mb-8 relative overflow-hidden">
                        <View className="absolute -right-8 -top-8 opacity-20">
                            <Target size={120} color="#fff" />
                        </View>
                        <Text className="text-indigo-100 font-LexendBold uppercase tracking-widest text-xs mb-2">Overall GPA</Text>
                        <View className="flex-row items-baseline gap-2">
                            <Text className="text-6xl font-LexendBlack text-white">{performanceStats.avg}</Text>
                            <Text className="text-xl font-LexendBold text-indigo-200">%</Text>
                        </View>
                        <Text className="text-indigo-100 font-Lexend mt-4">
                            Based on {student?.grades?.length || 0} total assessments across {performanceStats.subjects.length} subjects.
                        </Text>
                    </View>

                    {/* Subject Breakdown */}
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight mb-6">Subject Breakdown</Text>
                    <View className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        {performanceStats.subjects.length > 0 ? (
                            performanceStats.subjects.map((subj, idx) => (
                                <SubjectPerformanceBar key={idx} subject={subj.name} score={subj.score} maxMarks={subj.maxMarks} />
                            ))
                        ) : (
                            <View className="py-8 items-center">
                                <BookOpen size={48} color="#cbd5e1" className="mb-4" />
                                <Text className="text-lg font-bold text-slate-400 dark:text-slate-500">No Grades Recorded</Text>
                                <Text className="text-sm text-slate-400 dark:text-slate-600 mt-2 text-center">Your child hasn't received any grades yet.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
