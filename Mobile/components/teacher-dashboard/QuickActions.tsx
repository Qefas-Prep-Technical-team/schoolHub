import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, Share2, FileText, CheckCircle2, ChevronRight, BarChart3, Users, MessageSquare } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function QuickActions() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const assignments = [
    { id: 1, title: 'Mid-Term Exam', class: 'JSS 3A', status: 'Pending Grading' },
    { id: 2, title: 'Algebra Quiz', class: 'SSS 1', status: 'Published' },
  ];

  const announcements = [
    { id: 1, title: 'Staff Meeting at 3 PM', sender: 'Principal', unread: true },
    { id: 2, title: 'Submission Deadline', sender: 'Admin', unread: false },
  ];

  return (
    <View className="mb-20">
      
      {/* Quick Tools */}
      <View className="flex-row gap-4 mb-8 mt-4">
        <TouchableOpacity className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="h-12 w-12 bg-emerald-500 rounded-full items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
            <Plus size={24} color="#ffffff" />
          </View>
          <Text className="text-xs font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight">Grade</Text>
          <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest mt-0.5">New Entry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="h-12 w-12 bg-blue-500 rounded-full items-center justify-center mb-2 shadow-lg shadow-blue-500/30">
            <Share2 size={24} color="#ffffff" />
          </View>
          <Text className="text-xs font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight">Reports</Text>
          <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest mt-0.5">Export Data</Text>
        </TouchableOpacity>
      </View>

      {/* Assessments & Grading */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4 ml-2">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Assessments</Text>
          <TouchableOpacity>
            <Text className="text-[10px] font-LexendBold text-pink-600 dark:text-pink-400 uppercase tracking-widest">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          {assignments.map((item) => (
            <View key={item.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className={`h-12 w-12 rounded-2xl items-center justify-center ${item.status === 'Pending Grading' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                  <FileText size={20} color={item.status === 'Pending Grading' ? '#f59e0b' : '#10b981'} />
                </View>
                <View>
                  <Text className="font-LexendBold text-slate-900 dark:text-white mb-0.5">{item.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest">{item.class}</Text>
                    <View className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <Text className={`text-[10px] font-LexendBold uppercase tracking-widest ${item.status === 'Pending Grading' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
          ))}
        </View>
      </View>

      {/* Analytics & Top Performers */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4 ml-2">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Analytics</Text>
        </View>
        <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <BarChart3 size={18} color="#4f46e5" />
            </View>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white">Grade Distribution</Text>
          </View>
          
          <View className="space-y-4 mb-6">
            {[
              { grade: 'A', pct: 45, color: 'bg-emerald-500' },
              { grade: 'B', pct: 35, color: 'bg-blue-500' },
              { grade: 'C', pct: 15, color: 'bg-amber-500' },
            ].map((stat) => (
              <View key={stat.grade} className="flex-row items-center gap-4">
                <Text className="font-LexendBlack w-4 text-slate-700 dark:text-slate-300">{stat.grade}</Text>
                <View className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.pct}%` }} />
                </View>
                <Text className="font-Lexend text-xs text-slate-500 w-8">{stat.pct}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Announcements */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4 ml-2">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Inbox</Text>
        </View>
        <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          {announcements.map((msg, idx) => (
            <TouchableOpacity key={msg.id} className={`p-4 flex-row items-center ${idx !== announcements.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
              <View className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 items-center justify-center border border-sky-100 dark:border-sky-800/30 mr-4">
                <MessageSquare size={20} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className={`font-LexendBold text-base ${msg.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{msg.title}</Text>
                <Text className="text-xs font-Lexend text-slate-500 mt-0.5">{msg.sender}</Text>
              </View>
              {msg.unread && (
                <View className="h-3 w-3 bg-sky-500 rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </View>
  );
}
