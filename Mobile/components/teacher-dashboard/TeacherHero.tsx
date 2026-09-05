import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Calendar, BookOpen, Users, Book } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTeacherDashboardStats } from '@/lib/api/hooks/useTeacherDashboard';

type SlideItem = 
  | { type: 'summary' } 
  | { type: 'class'; name: string } 
  | { type: 'subjects'; subjects: string[] };

export function TeacherHero() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: dashboardData, isLoading } = useTeacherDashboardStats();
  
  const stats = dashboardData?.stats;
  const sessionName = stats?.session || "Session Not Set";
  const totalClasses = stats?.totalClasses || 0;
  const totalStudents = stats?.totalStudents || 0;
  const classNames = stats?.classNames || [];
  const subjectNames = (stats as any)?.subjectNames || [];

  // Assuming parent has paddingHorizontal: 16 (32 total padding)
  const scrollViewWidth = width - 32;
  const cardWidth = scrollViewWidth;

  const slides: SlideItem[] = [
    { type: 'summary' },
    ...classNames.map((name: string) => ({ type: 'class' as const, name })),
    ...(subjectNames.length > 0 ? [{ type: 'subjects' as const, subjects: subjectNames }] : [])
  ];

  const scrollViewRef = useRef<ScrollView>(null);
  const isAutoScrolling = useRef(true);

  useEffect(() => {
    if (!isAutoScrolling.current || slides.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * cardWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000); // auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex, slides.length, cardWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isAutoScrolling.current = false; // Stop auto-scrolling if user manually interacts
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View className="mb-6">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="center"
        style={{ width: scrollViewWidth, overflow: 'visible' }}
      >
        {slides.map((slide, index) => (
          <View key={index} style={{ width: cardWidth }} className="justify-center">
            <View className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-5 shadow-xl relative overflow-hidden border border-slate-800 mx-1">
              <View className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-600 rounded-full blur-3xl opacity-30" />
              <View className="absolute -left-10 -bottom-10 h-40 w-40 bg-teal-600 rounded-full blur-3xl opacity-20" />
              
              {slide.type === 'summary' ? (
                <View className="relative z-10">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                      <Calendar size={16} color="#10b981" />
                      <Text className="text-emerald-400 font-LexendBold text-[10px] uppercase tracking-widest">Active Session</Text>
                    </View>
                    <View className="px-2 py-1 bg-white/10 rounded-lg">
                      <Text className="text-white font-LexendBold text-[10px] uppercase tracking-widest">{isLoading ? '...' : 'Current'}</Text>
                    </View>
                  </View>
                  
                  <Text className="text-2xl font-LexendBlack text-white italic tracking-tighter mb-1" numberOfLines={1} adjustsFontSizeToFit>
                    {isLoading ? 'Loading...' : sessionName}
                  </Text>
                  <Text className="text-slate-400 font-Lexend text-xs mb-5">Academic Year</Text>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-white/10 p-3 rounded-xl flex-row items-center justify-between">
                      <View>
                        <Text className="text-lg font-LexendBlack text-white mb-0.5">{isLoading ? '-' : totalClasses}</Text>
                        <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest">Classes</Text>
                      </View>
                      <BookOpen size={16} color="#94a3b8" />
                    </View>
                    <View className="flex-1 bg-white/10 p-3 rounded-xl flex-row items-center justify-between">
                      <View>
                        <Text className="text-lg font-LexendBlack text-white mb-0.5">{isLoading ? '-' : totalStudents}</Text>
                        <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest">Students</Text>
                      </View>
                      <Users size={16} color="#94a3b8" />
                    </View>
                  </View>
                </View>
              ) : slide.type === 'class' ? (
                <View className="relative z-10 flex-1 justify-center py-2">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                      <BookOpen size={16} color="#10b981" />
                      <Text className="text-emerald-400 font-LexendBold text-[10px] uppercase tracking-widest">Assigned Class</Text>
                    </View>
                  </View>
                  <Text className="text-3xl font-LexendBlack text-white tracking-tighter mb-1" numberOfLines={1} adjustsFontSizeToFit>
                    {slide.name}
                  </Text>
                  <Text className="text-slate-400 font-Lexend text-xs mb-4">You are teaching this class</Text>
                  
                  <View className="bg-white/10 p-3 rounded-xl flex-row items-center justify-between mt-auto">
                    <Text className="text-[10px] font-LexendBold text-white uppercase tracking-widest">Manage Class</Text>
                    <Users size={16} color="#ffffff" />
                  </View>
                </View>
              ) : (
                <View className="relative z-10 flex-1 justify-center py-2">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                      <Book size={16} color="#10b981" />
                      <Text className="text-emerald-400 font-LexendBold text-[10px] uppercase tracking-widest">Assigned Subjects</Text>
                    </View>
                  </View>
                  <Text className="text-3xl font-LexendBlack text-white tracking-tighter mb-1" numberOfLines={1} adjustsFontSizeToFit>
                    {slide.subjects.length} {slide.subjects.length === 1 ? 'Subject' : 'Subjects'}
                  </Text>
                  <Text className="text-slate-400 font-Lexend text-xs mb-4" numberOfLines={2}>
                    {slide.subjects.join(', ')}
                  </Text>
                  
                  <View className="bg-white/10 p-3 rounded-xl flex-row items-center justify-between mt-auto">
                    <Text className="text-[10px] font-LexendBold text-white uppercase tracking-widest">View Curriculum</Text>
                    <Book size={16} color="#ffffff" />
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {slides.length > 1 && (
        <View className="flex-row justify-center items-center mt-4 gap-1.5">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${
                activeIndex === index 
                  ? 'w-6 bg-emerald-500' 
                  : 'w-1.5 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
