import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen, User, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ActiveSubjectsWidgetProps {
  subjectsCount: number;
  subjects?: any[];
  classId?: string;
}

export const ActiveSubjectsWidget = ({ subjectsCount, subjects = [], classId }: ActiveSubjectsWidgetProps) => {
  const router = useRouter();

  const handleViewAll = () => {
    if (classId) {
      router.push(`/(student-tabs)/classes/${classId}/subjects` as any);
    }
  };

  return (
    <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Subjects</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Your enrolled courses</Text>
        </View>
        <View className="px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 border border-pink-500/20">
          <Text className="text-[10px] font-black uppercase text-pink-600">{subjectsCount} Subjects</Text>
        </View>
      </View>
      
      {subjects.length === 0 ? (
        <View className="flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <View className="h-14 w-14 rounded-full bg-pink-500/10 flex items-center justify-center mb-3">
            <BookOpen size={24} color="#ec4899" />
          </View>
          <Text className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Subjects Found</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Check back later.</Text>
        </View>
      ) : (
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="-mx-6 px-6 mb-4"
          >
            {subjects.slice(0, 5).map((cs: any, index: number) => {
              const subject = cs.subject;
              if (!subject) return null;
              
              const teacherName = subject.teacher?.name || 'Not assigned';

              return (
                <TouchableOpacity 
                  key={subject.id || index}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (classId) {
                      router.push({
                        pathname: `/(student-tabs)/classes/[id]/subjects`,
                        params: { id: classId, openSubjectId: subject.id }
                      } as any);
                    }
                  }}
                  className="bg-slate-50 dark:bg-slate-800/40 w-64 rounded-3xl p-4 mr-4 border border-slate-100 dark:border-slate-700/50"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 items-center justify-center">
                      <BookOpen size={18} color="#ec4899" />
                    </View>
                    <View className="bg-white dark:bg-slate-700 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                      <Text className="text-[8px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                        {subject.code}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-base font-black text-slate-900 dark:text-white mb-2" numberOfLines={1}>
                    {subject.name}
                  </Text>
                  
                  <View className="flex-row items-center mt-auto">
                    <User size={12} color="#94a3b8" />
                    <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1" numberOfLines={1}>
                      {teacherName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity 
            onPress={handleViewAll}
            activeOpacity={0.7}
            className="flex-row items-center justify-center py-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl"
          >
            <Text className="text-xs font-black uppercase tracking-widest text-pink-600 mr-2">
              View All Subjects
            </Text>
            <ChevronRight size={14} color="#ec4899" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
