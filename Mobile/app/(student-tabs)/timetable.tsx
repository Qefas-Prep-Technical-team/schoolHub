import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClassTimetable, useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { Clock, MapPin, User, Coffee, Calendar } from 'lucide-react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getCurrentDayName = () => {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return DAYS.includes(day) ? day : 'Monday';
};

export default function TimetableScreen() {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayName());

  const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
  
  const activeClassId = studentProfile?.classes?.[0]?.class?.id;
  const activeClassName = studentProfile?.classes?.[0]?.class?.name;

  const { data: classData, isLoading: isClassLoading } = useSingleClass(activeClassId || '');
  const { data: rawPeriods = [], isLoading: isTimetableLoading } = useClassTimetable(activeClassId || '');

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

  const isDataLoading = isProfileLoading || (!!activeClassId && (isClassLoading || isTimetableLoading));

  if (isDataLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-50">
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <View className="ml-4 flex-1">
            <View className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-1" />
            <View className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </View>
        </View>
        
        {/* Timetable List Skeleton */}
        <ScrollView className="flex-1 p-4 opacity-50" showsVerticalScrollIndicator={false}>
          <View className="flex-row mb-6 mt-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl mr-2" />
            ))}
          </View>
          
          {[1, 2, 3, 4].map((item) => (
            <View key={item} className="h-24 w-full bg-white dark:bg-slate-900 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800" />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* HEADER */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <View className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full items-center justify-center mr-4 border border-indigo-200 dark:border-indigo-800">
          <Calendar size={20} color="#4f46e5" />
        </View>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">My Timetable</Text>
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {classData?.name || activeClassName || 'No Active Class'}
          </Text>
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
        {!activeClassId ? (
          <View className="items-center justify-center py-20">
            <View className="mb-4">
              <Calendar size={48} color="#cbd5e1" />
            </View>
            <Text className="text-lg font-bold text-slate-400 dark:text-slate-500">No active class</Text>
            <Text className="text-sm text-slate-400 dark:text-slate-600 mt-2">You haven't been assigned to a class yet.</Text>
          </View>
        ) : dailyPeriods.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="mb-4">
              <Calendar size={48} color="#cbd5e1" />
            </View>
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
                            <Coffee size={20} color="#d97706" />
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
                                <View className="mr-2">
                                  <User size={14} color="#94a3b8" />
                                </View>
                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {period.teacher.name}
                                </Text>
                              </View>
                            )}
                            {period.room && (
                              <View className="flex-row items-center">
                                <View className="mr-2">
                                  <MapPin size={14} color="#94a3b8" />
                                </View>
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
