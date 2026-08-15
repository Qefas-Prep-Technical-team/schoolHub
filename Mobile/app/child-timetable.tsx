import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, Coffee, User } from 'lucide-react-native';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const getCurrentDayName = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
};

export default function ChildTimetableScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const { data: student, isLoading: isStudentLoading } = useChildDetails(childId);
    
    const activeClassId = student?.classes?.[0]?.class?.id;
    const { data: rawPeriods = [], isLoading: isTimetableLoading } = useClassTimetable(activeClassId || '');
    
    const [selectedDay, setSelectedDay] = useState(getCurrentDayName());
    const isDark = useColorScheme() === 'dark';
    const primaryColor = '#ea580c';

    const dailyPeriods = useMemo(() => {
        if (!rawPeriods || rawPeriods.length === 0) return [];
        const dayPeriods = rawPeriods.filter((p: any) => p.day === selectedDay);
        return dayPeriods.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    }, [rawPeriods, selectedDay]);

    const getCurrentTimeSlotIndex = () => {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (currentDay.toLowerCase() !== selectedDay.toLowerCase()) return -1;

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return dailyPeriods.findIndex((p: any) => {
            if (!p.startTime || !p.endTime) return false;
            try {
                const startParts = p.startTime.split(':').map(Number);
                const endParts = p.endTime.split(':').map(Number);
                const startTotal = startParts[0] * 60 + startParts[1];
                const endTotal = endParts[0] * 60 + endParts[1];
                return currentMinutes >= startTotal && currentMinutes < endTotal;
            } catch (e) {
                return false;
            }
        });
    };

    const activeIndex = getCurrentTimeSlotIndex();

    if (isStudentLoading) {
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
                    <View className="h-10 w-10 bg-orange-100 dark:bg-orange-900/50 rounded-full items-center justify-center mr-4 border border-orange-200 dark:border-orange-800">
                        <Calendar size={20} color="#ea580c" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Class Timetable</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {student?.classes?.[0]?.class?.name || 'No Active Class'}
                        </Text>
                    </View>
                </View>

                {/* Days Selector */}
                <View className="bg-white dark:bg-slate-900 pt-2 border-b border-slate-200 dark:border-slate-800">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {DAYS.map((day) => {
                            const isSelected = selectedDay === day;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setSelectedDay(day)}
                                    className={`py-4 px-5 mr-2 ${isSelected ? 'border-b-2 border-orange-600 dark:border-orange-400' : 'border-b-2 border-transparent'}`}
                                >
                                    <Text className={`font-bold text-[15px] ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Timeline */}
                <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {isTimetableLoading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="small" color={primaryColor} />
                            <Text className="text-xs font-LexendBold text-slate-400 uppercase tracking-widest mt-4">Loading Schedule...</Text>
                        </View>
                    ) : !activeClassId ? (
                        <View className="items-center justify-center py-20">
                            <Calendar size={48} color="#cbd5e1" className="mb-4" />
                            <Text className="text-lg font-bold text-slate-400 dark:text-slate-500">No active class</Text>
                        </View>
                    ) : dailyPeriods.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Calendar size={48} color="#cbd5e1" className="mb-4" />
                            <Text className="text-lg font-bold text-slate-400 dark:text-slate-500">No classes scheduled</Text>
                        </View>
                    ) : (
                        <View className="pl-4">
                            <View className="absolute left-8 top-4 bottom-8 w-[2px] bg-slate-200 dark:bg-slate-800" />
                            
                            {dailyPeriods.map((period: any, index: number) => {
                                const isActive = index === activeIndex;
                                const isBreak = period.isBreak;
                                
                                return (
                                    <View key={period.id} className="flex-row mb-6 relative">
                                        <View className={`absolute left-[-16px] top-6 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-950 ${
                                            isActive ? 'bg-orange-600' : isBreak ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'
                                        }`} style={{ zIndex: 10 }} />
                                        
                                        <View className="w-20 pt-4 items-end pr-4">
                                            <Text className={`text-sm font-bold ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {period.startTime}
                                            </Text>
                                            <Text className="text-[10px] font-semibold text-slate-400 mt-1">{period.endTime}</Text>
                                        </View>
                                        
                                        <View className="flex-1">
                                            <View className={`p-4 rounded-3xl border shadow-sm ${
                                                isActive 
                                                    ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/50' 
                                                    : isBreak
                                                    ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30'
                                                    : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                                            }`}>
                                                {isBreak ? (
                                                    <View className="flex-row items-center">
                                                        <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 items-center justify-center mr-3">
                                                            <Coffee size={20} color="#d97706" />
                                                        </View>
                                                        <Text className="text-base font-bold text-amber-700 dark:text-amber-400">
                                                            {period.breakLabel || 'Recess / Break'}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <>
                                                        <Text className={`text-lg font-bold mb-3 ${isActive ? 'text-orange-900 dark:text-orange-100' : 'text-slate-800 dark:text-slate-100'}`}>
                                                            {period.subject?.name || 'Unknown Subject'}
                                                        </Text>
                                                        
                                                        {period.teacher?.name && (
                                                            <View className="flex-row items-center">
                                                                <View className="mr-2">
                                                                    <User size={14} color="#94a3b8" />
                                                                </View>
                                                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                                    {period.teacher.name}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
