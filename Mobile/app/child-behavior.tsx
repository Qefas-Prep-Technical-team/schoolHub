import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, GraduationCap, ShieldAlert, Sparkles, TrendingUp, UserCheck, AlertTriangle, AlertOctagon } from 'lucide-react-native';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useStudentBehaviourProfile } from '@/lib/api/hooks/useStudent';
import { useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Svg, { Circle, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { format } from 'date-fns';

export default function ChildBehaviorScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    
    const { data: student, isLoading: isStudentLoading } = useChildDetails(childId);
    const classId = student?.classes?.[0]?.class?.id;

    const { data: behaviourProfile, isLoading: isProfileLoading } = useStudentBehaviourProfile(childId);
    const { data: behaviourAlerts, isLoading: isAlertsLoading } = useClassBehaviourAlerts(classId as string, childId);

    const isDark = useColorScheme() === 'dark';
    
    if (isStudentLoading || isProfileLoading || isAlertsLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
                <ActivityIndicator size="large" color="#ec4899" />
            </SafeAreaView>
        );
    }

    const conductScore = behaviourProfile?.conductScore ?? 100;
    const strengths = behaviourProfile?.strengths ?? [];
    
    let conductStatusLabel = "Excellent";
    let conductStatusDesc = "Student has demonstrated exemplary conduct.";
    let startColor = "#10b981"; // emerald-500
    let endColor = "#059669"; // emerald-600
    let statusBg = "bg-emerald-100 dark:bg-emerald-900/30";
    let statusText = "text-emerald-700 dark:text-emerald-400";

    if (conductScore < 50) {
        conductStatusLabel = "Critical";
        conductStatusDesc = "Immediate intervention and parent meeting required.";
        startColor = "#ef4444"; // red-500
        endColor = "#dc2626"; // red-600
        statusBg = "bg-red-100 dark:bg-red-900/30";
        statusText = "text-red-700 dark:text-red-400";
    } else if (conductScore < 75) {
        conductStatusLabel = "Warning";
        conductStatusDesc = "Student requires monitoring and behavioral support.";
        startColor = "#f59e0b"; // amber-500
        endColor = "#d97706"; // amber-600
        statusBg = "bg-amber-100 dark:bg-amber-900/30";
        statusText = "text-amber-700 dark:text-amber-400";
    } else if (conductScore < 90) {
        conductStatusLabel = "Good";
        conductStatusDesc = "General behavior is acceptable with minor infractions.";
        startColor = "#3b82f6"; // blue-500
        endColor = "#2563eb"; // blue-600
        statusBg = "bg-blue-100 dark:bg-blue-900/30";
        statusText = "text-blue-700 dark:text-blue-400";
    }

    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (conductScore / 100) * circumference;

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="h-10 w-10 bg-pink-100 dark:bg-pink-900/50 rounded-full items-center justify-center mr-4 border border-pink-200 dark:border-pink-800">
                        <GraduationCap size={20} color="#ec4899" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Behaviour Log</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {student?.name || 'Student'} • {student?.classes?.[0]?.class?.name || 'No Class'}
                        </Text>
                    </View>
                </View>

                <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
                    
                    {/* Conduct Standing Card */}
                    <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6">Conduct Standing</Text>
                        
                        <View className="items-center justify-center py-4">
                            <View style={{ width: 144, height: 144, position: 'relative' }}>
                                <Svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: [{ rotate: '-90deg' }] }}>
                                    <Defs>
                                        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <Stop offset="0%" stopColor={startColor} />
                                            <Stop offset="100%" stopColor={endColor} />
                                        </LinearGradient>
                                    </Defs>
                                    
                                    {/* Track */}
                                    <Circle
                                        cx="72"
                                        cy="72"
                                        r={radius}
                                        stroke={isDark ? '#831843' : '#fce7f3'}
                                        strokeWidth="7"
                                        fill="transparent"
                                    />
                                    
                                    {/* Filled progress */}
                                    <Circle
                                        cx="72"
                                        cy="72"
                                        r={radius}
                                        stroke="url(#grad)"
                                        strokeWidth="7"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </Svg>
                                <View className="absolute inset-0 items-center justify-center">
                                    <View className="flex-row items-baseline mt-2">
                                        <Text className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{conductScore}</Text>
                                        <Text className="text-xs font-bold text-slate-400">/100</Text>
                                    </View>
                                    <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Conduct</Text>
                                </View>
                            </View>

                            <View className="items-center mt-6">
                                <View className={`px-4 py-1.5 rounded-full ${statusBg}`}>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${statusText}`}>{conductStatusLabel}</Text>
                                </View>
                                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3 text-center px-4 leading-relaxed">
                                    {conductStatusDesc}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Core Strengths */}
                    {strengths.length > 0 && (
                        <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6">Core Strengths</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {strengths.map((s: any, idx: number) => (
                                    <View key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 w-[47%] border border-slate-100 dark:border-slate-800">
                                        <View className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 items-center justify-center mb-3">
                                            <TrendingUp size={16} color="#ec4899" />
                                        </View>
                                        <Text className="font-bold text-slate-900 dark:text-white mb-1">{s.name}</Text>
                                        <Text className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.description}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Conduct Timeline */}
                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 mt-2 px-2">Conduct Timeline</Text>
                    
                    {behaviourAlerts && behaviourAlerts.length > 0 ? (
                        <View className="px-2">
                            {behaviourAlerts.map((alert: any, idx: number) => {
                                const isDanger = alert.type === 'DANGER';
                                const Icon = isDanger ? AlertOctagon : AlertTriangle;
                                const color = isDanger ? '#ef4444' : '#f59e0b';
                                const bgClass = isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20';
                                const borderClass = isDanger ? 'border-red-100 dark:border-red-900/30' : 'border-amber-100 dark:border-amber-900/30';
                                
                                return (
                                    <View key={alert.id} className="flex-row mb-6">
                                        {/* Timeline Line */}
                                        <View className="items-center mr-4">
                                            <View className={`h-8 w-8 rounded-full items-center justify-center z-10 ${bgClass}`}>
                                                <Icon size={16} color={color} />
                                            </View>
                                            {idx !== behaviourAlerts.length - 1 && (
                                                <View className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-1" />
                                            )}
                                        </View>
                                        
                                        {/* Content */}
                                        <View className={`flex-1 rounded-2xl p-4 border ${bgClass} ${borderClass}`}>
                                            <View className="flex-row justify-between items-start mb-2">
                                                <View>
                                                    <Text className="font-bold text-slate-900 dark:text-white text-base">{alert.title}</Text>
                                                    <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                                        {format(new Date(alert.createdAt), 'MMM d, yyyy • h:mm a')}
                                                    </Text>
                                                </View>
                                            </View>
                                            {alert.description && (
                                                <Text className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                                    {alert.description}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 items-center shadow-sm">
                            <View className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                                <UserCheck size={28} color="#94a3b8" />
                            </View>
                            <Text className="text-base font-bold text-slate-900 dark:text-white mb-2 text-center">Clean Record</Text>
                            <Text className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                                There are no behaviour alerts logged for this student.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
