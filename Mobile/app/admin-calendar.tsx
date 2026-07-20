import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Clock, MapPin, Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminCalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const events = [
    { id: 1, title: 'Mid-Term Examinations', date: 'Oct 15 - Oct 20', time: '08:00 AM', location: 'Main Campus', type: 'Academic' },
    { id: 2, title: 'PTA Meeting', date: 'Oct 25, 2023', time: '10:00 AM', location: 'School Hall', type: 'Event' },
    { id: 3, title: 'End of Term Break', date: 'Dec 15 - Jan 5', time: 'All Day', location: 'Remote', type: 'Holiday' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="flex-1 px-4 text-center text-lg font-LexendBold text-slate-900 dark:text-white tracking-tight">
          Session Calendar
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* Current Session Banner */}
        <View className="bg-emerald-600 rounded-[2.5rem] p-8 shadow-lg overflow-hidden relative mb-8">
          <View className="absolute -right-6 -top-6 h-32 w-32 bg-emerald-500 rounded-full blur-2xl opacity-50" />
          <View className="absolute -bottom-10 -left-10 h-40 w-40 bg-teal-500 rounded-full blur-3xl opacity-40" />
          
          <View className="flex-row items-center gap-3 mb-6 relative z-10">
            <View className="h-10 w-10 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-md">
              <Calendar size={20} color="#ffffff" />
            </View>
            <Text className="text-white/80 font-LexendBold uppercase tracking-widest text-xs">Active Session</Text>
          </View>
          
          <View className="relative z-10">
            <Text className="text-4xl font-LexendBlack text-white italic tracking-tighter mb-1">First Term</Text>
            <Text className="text-emerald-100 font-Lexend text-sm">2023/2024 Academic Year</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Upcoming Events</Text>
          <TouchableOpacity>
            <Text className="text-xs font-LexendBold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View className="space-y-4 mb-24">
          {events.map((event) => (
            <View key={event.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex-row gap-4">
              
              {/* Date Box */}
              <View className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl items-center justify-center border border-slate-100 dark:border-slate-800">
                <Text className="font-LexendBlack text-slate-900 dark:text-white text-xl tracking-tighter leading-none">
                  {event.date.split(' ')[1]?.replace(',', '') || event.date.split(' ')[0]}
                </Text>
                <Text className="font-Lexend text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  {event.date.split(' ')[0]}
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-LexendBlack text-slate-900 dark:text-white text-base tracking-tight">{event.title}</Text>
                </View>
                
                <View className="flex-row items-center gap-4 mt-2">
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                    <Text className="text-xs font-Lexend text-slate-500">{event.time}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <MapPin size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                    <Text className="text-xs font-Lexend text-slate-500">{event.location}</Text>
                  </View>
                </View>

                <View className="self-start px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md mt-3">
                  <Text className="text-[10px] font-LexendBold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{event.type}</Text>
                </View>
              </View>

            </View>
          ))}
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-10 right-6 h-14 w-14 bg-emerald-600 rounded-full items-center justify-center shadow-xl shadow-emerald-600/40"
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
