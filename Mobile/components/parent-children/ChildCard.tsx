import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, ShieldCheck, User, GraduationCap } from 'lucide-react-native';

interface ChildCardProps {
  child: {
    id: string
    name: string
    age: number
    grade: string
    class: string
    studentId: string
    imageUrl: string
    attendance: number
    gradeValue: string | number
    gradePercentage?: string
    status: 'active' | 'inactive'
  };
  onPress: () => void;
}

export const ChildCard = ({ child, onPress }: ChildCardProps) => {
  const [imgError, setImgError] = useState(false);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 85) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=ea580c&color=fff`;
  const displayImage = (!imgError && child.imageUrl && child.imageUrl !== "null" && child.imageUrl !== "") 
    ? { uri: child.imageUrl } 
    : { uri: placeholderUrl };

  return (
    <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-6">
      <View className="p-8 pb-4">
        <View className="flex-row items-start justify-between mb-6">
          <View className="relative">
            <View className="h-24 w-24 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-100 shadow-sm">
              <Image 
                source={displayImage}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            </View>
            
            {child.status === 'active' && (
              <View className="absolute -bottom-2 -right-2 h-8 w-8 bg-orange-600 rounded-xl border-[3px] border-white dark:border-slate-900 items-center justify-center shadow-sm">
                <ShieldCheck size={14} color="#ffffff" />
              </View>
            )}
          </View>
        </View>

        <Text className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">
          STU-CODE: {child.studentId}
        </Text>
        <Text className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
          {child.name}
        </Text>
        
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <GraduationCap size={12} color="#64748b" />
            <Text className="text-xs font-bold text-slate-500">{child.class}</Text>
          </View>
          <View className="w-1 h-1 bg-slate-300 rounded-full" />
          <View className="flex-row items-center gap-1.5">
            <User size={12} color="#64748b" />
            <Text className="text-xs font-bold text-slate-500">Age {child.age || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View className="p-8 pt-6">
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Academic Level</Text>
            </View>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{child.gradeValue}</Text>
              <Text className="text-[10px] font-black text-orange-600">{child.gradePercentage}</Text>
            </View>
          </View>

          <View className="flex-1 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Presence Rate</Text>
            </View>
            <View className="flex-col gap-2">
              <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{child.attendance}%</Text>
              <View className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <View className={`h-full ${getAttendanceColor(child.attendance)}`} style={{ width: `${child.attendance}%` }} />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={onPress}
          activeOpacity={0.8}
          className="w-full h-14 bg-slate-900 dark:bg-white rounded-2xl flex-row items-center justify-center shadow-lg"
        >
          <Text className="text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest mr-2">
            Access Terminal
          </Text>
          <ChevronRight size={16} color="#ffffff" className="dark:text-slate-900" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
