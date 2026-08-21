import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GraduationCap, TrendingUp, CalendarDays, CheckCircle2, MapPin, Clock } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTeacherDashboardStats } from '@/lib/api/hooks/useTeacherDashboard';
import { format } from 'date-fns';
import { BorderBeam } from '@/components/ui/BorderBeam';
export function TeacherInsights() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { data: dashboardData, isLoading } = useTeacherDashboardStats();
  
  const stats = dashboardData?.stats;
  const performanceMetrics = dashboardData?.performanceMetrics;
  const todaySchedule = dashboardData?.todaySchedule || [];
  
  const avgScore = stats?.averagePerformance || 0;
  const attendance = stats?.attendanceRate || 0;
  const topPerformers = performanceMetrics?.topStudents?.length || 0;
  
  // Helper to format time (e.g. "09:00" -> "09:00 AM")
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
    const [h, m] = timeStr.split(':');
    if (!h || !m) return timeStr;
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  // Reactive local time for class logic
  const [now, setNow] = useState(new Date());
  
  // Pagination for Today's Schedule
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    let hour = 0;
    let min = 0;
    const cleanStr = timeStr.trim().toLowerCase();
    const match = cleanStr.match(/(\d+):(\d+)\s*(am|pm)?/);
    if (match) {
      hour = parseInt(match[1], 10);
      min = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
    }
    return hour * 60 + min;
  };

  const getEndTimeMinutes = (c: any) => {
    if (c.time && c.time.includes('-')) {
      const parts = c.time.split('-');
      return parseTime(parts[1]);
    }
    return parseTime(c.startTime) + 60; // fallback
  };

  const classesToday = todaySchedule.filter((s: any) => s.type === 'class' || s.type === 'Class' || !s.type);
  
  let currentOngoingClass: any = undefined;
  let nextClass: any = undefined;
  let previousClass: any = undefined;

  classesToday.forEach((c: any) => {
    const startMins = parseTime(c.startTime);
    const endMins = getEndTimeMinutes(c);

    if (currentMinutes >= startMins && currentMinutes <= endMins) {
      currentOngoingClass = c;
    } else if (startMins > currentMinutes) {
      if (!nextClass) nextClass = c;
    } else if (endMins < currentMinutes) {
      previousClass = c;
    }
  });

  let targetClass = undefined;
  let insightLabel = 'Next Class';

  if (currentOngoingClass) {
    targetClass = currentOngoingClass;
    insightLabel = 'Current Class';
  } else if (nextClass) {
    targetClass = nextClass;
    insightLabel = 'Next Class';
  } else if (previousClass) {
    targetClass = previousClass;
    insightLabel = 'Last Class';
  }

  let targetClassTime = '';
  if (targetClass?.time) {
    const parts = targetClass.time.split('-');
    if (parts.length === 2) {
      targetClassTime = `${formatTime(parts[0].trim())} - ${formatTime(parts[1].trim())}`;
    } else {
      targetClassTime = formatTime(targetClass.time);
    }
  } else if (targetClass?.startTime) {
    targetClassTime = formatTime(targetClass.startTime);
  }

  // --- Pagination Logic ---
  const totalPages = Math.ceil(todaySchedule.length / itemsPerPage);
  const paginatedSchedule = todaySchedule.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <View className="mb-6">
      <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight mb-4 ml-2">Insights</Text>
      
      {/* 2x2 Stats Grid - Premium Bento Design */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        <View className="w-[48%] bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl items-center justify-center mb-4">
            <GraduationCap size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Avg. Score</Text>
          <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter">{isLoading ? '-' : `${avgScore}%`}</Text>
        </View>
        
        <View className="w-[48%] bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="h-10 w-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl items-center justify-center mb-4">
            <CheckCircle2 size={20} color={isDark ? "#34d399" : "#10b981"} />
          </View>
          <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Attendance</Text>
          <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter">{isLoading ? '-' : `${attendance}%`}</Text>
        </View>

        <View className="w-[48%] bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="h-10 w-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl items-center justify-center mb-4">
            <TrendingUp size={20} color={isDark ? "#fbbf24" : "#f59e0b"} />
          </View>
          <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Top Performers</Text>
          <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white tracking-tighter">{isLoading ? '-' : topPerformers}</Text>
        </View>

        {insightLabel === 'Current Class' ? (
          <BorderBeam className="w-[48%] shadow-sm" borderRadius={32} borderWidth={2}>
            <View className="p-5">
              <View className="h-10 w-10 bg-sky-50 dark:bg-sky-500/10 rounded-2xl items-center justify-center mb-4">
                <CalendarDays size={20} color={isDark ? "#38bdf8" : "#0ea5e9"} />
              </View>
              <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{insightLabel}</Text>
              <Text className="text-[15px] font-LexendBlack text-slate-900 dark:text-white tracking-tighter" adjustsFontSizeToFit numberOfLines={1}>{isLoading ? '--:--' : targetClassTime}</Text>
            </View>
          </BorderBeam>
        ) : (
          <View className="w-[48%] bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <View className="h-10 w-10 bg-sky-50 dark:bg-sky-500/10 rounded-2xl items-center justify-center mb-4">
              <CalendarDays size={20} color={isDark ? "#38bdf8" : "#0ea5e9"} />
            </View>
            <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{insightLabel}</Text>
            <Text className="text-[15px] font-LexendBlack text-slate-900 dark:text-white tracking-tighter" adjustsFontSizeToFit numberOfLines={1}>{isLoading ? '--:--' : targetClassTime}</Text>
          </View>
        )}
      </View>

      {/* Daily Schedule Timeline */}
      <View className="flex-row items-center justify-between mb-4 ml-2">
        <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Today's Schedule</Text>
        <TouchableOpacity>
          <Text className="text-[10px] font-LexendBold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Full Week</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        {isLoading ? (
          <Text className="text-slate-500 font-Lexend ml-2">Loading schedule...</Text>
        ) : todaySchedule.length === 0 ? (
          <View className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl items-center justify-center border border-slate-100 dark:border-slate-800">
            <CalendarDays size={32} color={isDark ? '#475569' : '#94a3b8'} className="mb-3" />
            <Text className="text-slate-500 dark:text-slate-400 font-Lexend">No classes scheduled for today.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {paginatedSchedule.map((item: any, index: number) => {
              if (!item) return null;
              
              const startTimeStr = item?.startTime ? String(item.startTime) : '';
              const timeParts = startTimeStr ? startTimeStr.split(' ') : ['00:00', 'AM'];
              const hour = timeParts[0] || '00:00';
              const ampm = timeParts[1] || 'AM';
        
              return (
                <View 
                  key={item?.id ? String(item.id) : `class-${index}`} 
                  className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex-row gap-5 items-center overflow-hidden"
                >
                  {/* Left Side: Time */}
                  <View className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.25rem] items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm">
                    <Text className="font-LexendBlack text-indigo-600 dark:text-indigo-400 text-xl tracking-tighter leading-none">{hour}</Text>
                    <Text className="font-LexendBold text-[9px] text-indigo-500/70 dark:text-indigo-400/70 uppercase tracking-widest mt-1">{ampm}</Text>
                  </View>
                  
                  {/* Right Side: Details */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="flex-1 font-LexendBlack text-slate-900 dark:text-white text-lg tracking-tight pr-2">
                        {item?.title ? String(item.title) : item?.subject ? String(item.subject) : 'Class'}
                      </Text>
                      <View className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                        <Text className="text-[9px] font-LexendBold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          {item?.type ? String(item.type) : 'Class'}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                        <Clock size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className="text-[11px] font-Lexend text-slate-600 dark:text-slate-400">
                          {item?.time ? String(item.time) : `${item?.startTime ? String(item.startTime) : ''} - ${item?.endTime ? String(item.endTime) : ''}`}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                        <MapPin size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className="text-[11px] font-Lexend text-slate-600 dark:text-slate-400" numberOfLines={1}>
                          {item?.room ? String(item.room) : item?.location ? String(item.location) : 'TBA'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
            
            {totalPages > 1 && (
              <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <TouchableOpacity
                  onPress={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-5 py-2.5 rounded-2xl ${currentPage === 1 ? 'opacity-40' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm'}`}
                >
                  <Text className="font-LexendBold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest">Prev</Text>
                </TouchableOpacity>
                
                <View className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl">
                  <Text className="font-LexendBold text-xs text-slate-500 dark:text-slate-400">
                    {`${currentPage} / ${totalPages}`}
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-5 py-2.5 rounded-2xl ${currentPage === totalPages ? 'opacity-40' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm'}`}
                >
                  <Text className="font-LexendBold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest">Next</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
