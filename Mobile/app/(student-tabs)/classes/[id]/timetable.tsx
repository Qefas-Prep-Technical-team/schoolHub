import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useClassTimetable, useSingleClass } from '@/lib/api/hooks/useClasses';
import { ArrowLeft, Clock, MapPin, User, Coffee, Calendar } from 'lucide-react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ClassTimetableScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const classId = Array.isArray(id) ? id[0] : id;

  const [selectedDay, setSelectedDay] = useState('Monday');

  const { data: classData } = useSingleClass(classId || '');
  const { data: rawPeriods = [], isLoading } = useClassTimetable(classId || '');

  // Group periods by selected day
  const dailyPeriods = useMemo(() => {
    if (!rawPeriods || rawPeriods.length === 0) return [];
    
    // Filter for selected day
    const dayPeriods = rawPeriods.filter((p: any) => p.day === selectedDay);
    
    // Sort by start time
    return dayPeriods.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  }, [rawPeriods, selectedDay]);

  const getCurrentTimeSlotIndex = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    // If you are looking at a different day than today, don't show an active class
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* HEADER */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mr-4">
          <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Timetable</Text>
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">{classData?.name || 'Class Schedule'}</Text>
        </View>
      </View>

      {/* DAYS SELECTOR */}
      <View className="bg-white dark:bg-slate-900 pt-2 border-b border-slate-200 dark:border-slate-800">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`py-4 px-5 mr-2 ${isSelected ? 'border-b-2 border-indigo-600 dark:border-indigo-400' : 'border-b-2 border-transparent'}`}
              >
                <Text className={`font-bold text-[15px] ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* TIMELINE */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {dailyPeriods.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
            <Text className="text-lg font-bold text-slate-400 dark:text-slate-500">No classes scheduled</Text>
            <Text className="text-sm text-slate-400 dark:text-slate-600 mt-2">Enjoy your free day!</Text>
          </View>
        ) : (
          <View className="pl-4">
            {/* Vertical timeline line */}
            <View className="absolute left-8 top-4 bottom-8 w-[2px] bg-slate-200 dark:bg-slate-800" />
            
            {dailyPeriods.map((period: any, index: number) => {
              const isActive = index === activeIndex;
              const isBreak = period.isBreak;
              
              return (
                <View key={period.id} className="flex-row mb-6 relative">
                  {/* Timeline Dot */}
                  <View className={`absolute left-[-16px] top-6 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-950 ${
                    isActive ? 'bg-indigo-600' : isBreak ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'
                  }`} style={{ zIndex: 10 }} />
                  
                  {/* Time Column */}
                  <View className="w-20 pt-4 items-end pr-4">
                    <Text className={`text-sm font-bold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {period.startTime}
                    </Text>
                    <Text className="text-[10px] font-semibold text-slate-400 mt-1">{period.endTime}</Text>
                  </View>
                  
                  {/* Content Card */}
                  <View className="flex-1">
                    <View className={`p-4 rounded-3xl border shadow-sm ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50' 
                        : isBreak
                          ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30'
                          : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                    }`}>
                      {isBreak ? (
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 items-center justify-center mr-3">
                            <Coffee size={20} className="text-amber-600 dark:text-amber-400" />
                          </View>
                          <Text className="text-base font-bold text-amber-700 dark:text-amber-400">
                            {period.breakLabel || 'Recess / Break'}
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Text className={`text-lg font-bold mb-3 ${isActive ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-100'}`}>
                            {period.subject?.name || 'Unknown Subject'}
                          </Text>
                          
                          <View className="flex-col gap-2">
                            {period.teacher?.name && (
                              <View className="flex-row items-center">
                                <User size={14} className="text-slate-400 mr-2" />
                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {period.teacher.name}
                                </Text>
                              </View>
                            )}
                            {period.room && (
                              <View className="flex-row items-center">
                                <MapPin size={14} className="text-slate-400 mr-2" />
                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {period.room}
                                </Text>
                              </View>
                            )}
                          </View>
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
  );
}
