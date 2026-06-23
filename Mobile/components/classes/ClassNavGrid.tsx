import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Book, Calendar, List, CheckCircle, MessageSquare, PenTool, Edit3, Award } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const TABS = [
  { key: 'assignment', label: 'Assignment', icon: PenTool },
  { key: 'test', label: 'Test', icon: Edit3 },
  { key: 'exam', label: 'Exam', icon: FileText },
  { key: 'ca', label: 'CA', icon: Award },
  { key: 'materials', label: 'Materials', icon: Book },
  { key: 'timetable', label: 'Timetable', icon: Calendar },
  { key: 'subjects', label: 'Subjects', icon: List },
  { key: 'attendance', label: 'Attendance', icon: CheckCircle },
  { key: 'discussions', label: 'Discussions', icon: MessageSquare },
];

export function ClassNavGrid() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const handlePress = (key: string) => {
    router.push(`/classes/${id}/${key}` as any);
  };

  return (
    <View 
      className="bg-white dark:bg-slate-900 rounded-3xl p-2 mb-6 flex-row flex-wrap"
      style={{ elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}
    >
      {TABS.map((tab, index) => {
        const Icon = tab.icon;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.6}
            onPress={() => handlePress(tab.key)}
            className="w-1/3 items-center justify-center py-6"
          >
            <View className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center mb-3">
              <Icon size={24} className="text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            </View>
            <Text 
              className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center px-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
