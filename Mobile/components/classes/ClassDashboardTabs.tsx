import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { FileText, Book, Calendar, List, CheckCircle, MessageSquare } from 'lucide-react-native';

export type TabKey = 'assessments' | 'materials' | 'timetable' | 'subjects' | 'attendance' | 'discussions';

interface ClassDashboardTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS = [
  { key: 'assessments' as TabKey, label: 'Assessments', icon: FileText },
  { key: 'materials' as TabKey, label: 'Materials', icon: Book },
  { key: 'timetable' as TabKey, label: 'Timetable', icon: Calendar },
  { key: 'subjects' as TabKey, label: 'Subjects', icon: List },
  { key: 'attendance' as TabKey, label: 'Attendance', icon: CheckCircle },
  { key: 'discussions' as TabKey, label: 'Discussions', icon: MessageSquare },
];

export function ClassDashboardTabs({ activeTab, onTabChange }: ClassDashboardTabsProps) {
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              className={`mr-3 px-4 py-2.5 rounded-xl border flex-row items-center ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon 
                size={16} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`mr-2 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} 
              />
              <Text 
                className={`text-sm font-bold ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
