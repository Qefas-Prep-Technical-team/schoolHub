import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, GraduationCap, MapPin, Mail, User } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ChildSummary } from '@/lib/api/services/parentService';

interface ParentDashboardCarouselProps {
  childrenData: ChildSummary[];
  isLoading?: boolean;
  onChildChange?: (childId?: string) => void;
}

export const ParentDashboardCarousel = ({ childrenData, isLoading, onChildChange }: ParentDashboardCarouselProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const cardWidth = width - 48;

  const childrenArray = useMemo(() => childrenData || [], [childrenData]);

  const totalSlides = 1 + childrenArray.length;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notify parent component of active child change
  useEffect(() => {
    if (!isLoading && childrenArray.length > 0) {
      const activeChild = activeIndex === 0 ? childrenArray[0] : childrenArray[activeIndex - 1];
      onChildChange?.(activeChild?.id);
    }
  }, [activeIndex, isLoading, childrenArray, onChildChange]);

  const startAutoPlay = useCallback(() => {
    if (totalSlides <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % totalSlides;
        scrollViewRef.current?.scrollTo({ x: next * cardWidth, animated: true });
        return next;
      });
    }, 7000);
  }, [totalSlides, cardWidth]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  const getBadgeColor = (status: string | undefined) => {
    if (!status) return isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600';
    const s = status.toLowerCase();
    if (s.includes('improve') || s === 'f') return isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600';
    if (s.includes('excellent') || s === 'a') return isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600';
    return isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600';
  };

  return (
    <View className="mb-6">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        scrollEventThrottle={16}
        className="w-full"
      >
        {/* Slide 1: Ready to Learn (Default Hero) */}
        <View style={{ width: cardWidth }}>
          <LinearGradient
            colors={isDark ? (['#ea580c', '#9a3412'] as const) : (['#ffedd5', '#fed7aa'] as const)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-[24px] p-5 overflow-hidden relative shadow-sm"
          >
            <View className="w-2/3 z-10">
              {childrenArray.length > 0 && (
                <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center bg-white/40 dark:bg-black/20 px-2.5 py-1 rounded-full border border-white/50 dark:border-white/10">
                    <View 
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        childrenArray[0]?.stats?.todayAttendance?.toLowerCase() === 'present' ? 'bg-emerald-500' :
                        childrenArray[0]?.stats?.todayAttendance?.toLowerCase() === 'absent' ? 'bg-rose-500' :
                        childrenArray[0]?.stats?.todayAttendance?.toLowerCase() === 'late' ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`}
                    />
                    <Text className={`text-[9px] font-LexendBold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {childrenArray[0]?.stats?.todayAttendance?.toLowerCase() === 'present' ? 'In School Today' : 
                       childrenArray[0]?.stats?.todayAttendance?.toLowerCase() === 'absent' ? 'Absent Today' :
                       childrenArray[0]?.stats?.todayAttendance?.toLowerCase() === 'late' ? 'Late Today' :
                       'No Record'}
                    </Text>
                  </View>
                </View>
              )}
              <View className="flex-row items-center mb-1">
                <Text className={`text-lg font-LexendBold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ready to Learn? <Text>⭐</Text>
                </Text>
              </View>
              <Text className={`text-[11px] font-Lexend mb-3 leading-snug ${isDark ? 'text-orange-100' : 'text-slate-700'}`}>
                Assignments, and upcoming events with your personalized dashboard.
              </Text>
              <TouchableOpacity className="bg-orange-500 dark:bg-white rounded-xl py-2 px-4 self-start shadow-sm">
                <Text className={`text-[11px] font-LexendBold ${isDark ? 'text-orange-600' : 'text-white'}`}>View Schedule</Text>
              </TouchableOpacity>
            </View>

            <View className="absolute right-0 bottom-0 h-full w-1/3 justify-center items-end pr-4 z-0 opacity-80">
              <View className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl transform -rotate-6 shadow-sm">
                <BookOpen size={32} color={isDark ? "#fdba74" : "#f97316"} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Slide 2+: Child Profiles */}
        {!isLoading && childrenArray.map((child, idx) => (
          <View key={child.id || idx} style={{ width: cardWidth, paddingLeft: 16 }}>
            <View className={`rounded-[24px] p-4 shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>

              <View>
                {/* Header */}
                <View className="flex-row justify-between items-start mb-1">
                  <View className="flex-1">
                    <Text className={`text-lg font-LexendBold ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                      {child.name}
                    </Text>
                    <Text className={`text-[11px] font-Lexend ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {child.currentClass?.name || 'Utme 2025/2026'} • {child.studentCode}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full ml-2 ${getBadgeColor('Needs Improvement')}`}>
                    <Text className={`text-[9px] font-LexendBold ${getBadgeColor('Needs Improvement').split(' ')[1]}`}>Needs Improvement</Text>
                  </View>
                </View>

                {/* Minimal Stats */}
                <View className="flex-row items-center justify-between mb-3 mt-2">
                  <View className="flex-row items-center">
                    <MapPin size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text className={`text-[11px] font-Lexend ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {child.school?.name || 'Qefas Prep'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className={`text-[11px] font-LexendBold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Avg: {child.stats?.averageGrade !== undefined ? child.stats.averageGrade : 'F'}
                    </Text>
                    <Text className={`text-[11px] font-LexendBold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Att: {child.stats?.attendanceRate !== undefined ? `${child.stats.attendanceRate}%` : '100%'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/child-details', params: { childId: child.id } })}
                className="flex-row items-center justify-center py-2.5 rounded-2xl bg-orange-500 shadow-sm"
              >
                <Text className="text-[12px] font-LexendBold text-white">View Profile</Text>
              </TouchableOpacity>

            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {totalSlides > 1 && (
        <View className="flex-row justify-center items-center mt-3 gap-1.5">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full transition-all ${activeIndex === index
                ? 'w-4 bg-orange-500'
                : `w-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`
                }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};
