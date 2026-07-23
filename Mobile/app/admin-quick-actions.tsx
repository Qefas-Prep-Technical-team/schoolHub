import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  UserPlus, PlusCircle, FileText, Settings, CreditCard, ChevronRight, 
  Users, BookOpen, Calendar, Mail, Bell, Shield, X, ChevronLeft 
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminQuickActionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const actions = [
    { 
      label: 'Add Student', 
      subtitle: 'Register new enrollment', 
      icon: UserPlus, 
      color: '#f59e0b', 
      bg: isDark ? '#78350f' : '#fef3c7', 
      route: '/admin-add-student' 
    },
    { 
      label: 'New Class', 
      subtitle: 'Create classroom section',
      icon: PlusCircle, 
      color: '#8b5cf6', 
      bg: isDark ? '#4c1d95' : '#ede9fe', 
      route: '/admin-add-class' 
    },
    { 
      label: 'Manage Teachers', 
      subtitle: 'View and assign teachers',
      icon: Users, 
      color: '#3b82f6', 
      bg: isDark ? '#1e3a8a' : '#dbeafe', 
      route: '/(admin-tabs)/teachers' 
    },
    { 
      label: 'Subscriptions', 
      subtitle: 'Manage active plans',
      icon: CreditCard, 
      color: '#10b981', 
      bg: isDark ? '#064e3b' : '#d1fae5', 
      route: '/admin-subscription' 
    },
    { 
      label: 'Academic Calendar', 
      subtitle: 'Schedule events & terms',
      icon: Calendar, 
      color: '#ec4899', 
      bg: isDark ? '#831843' : '#fce7f3', 
      route: '/admin-calendar' 
    },
    { 
      label: 'Exams & Results', 
      subtitle: 'Manage grading system',
      icon: FileText, 
      color: '#f43f5e', 
      bg: isDark ? '#881337' : '#ffe4e6', 
      route: '/(admin-tabs)/exams' 
    },
    { 
      label: 'Messages', 
      subtitle: 'Broadcast announcements',
      icon: Mail, 
      color: '#0ea5e9', 
      bg: isDark ? '#0c4a6e' : '#e0f2fe', 
      route: '/admin-messages' 
    },
    { 
      label: 'System Settings', 
      subtitle: 'System configuration',
      icon: Settings, 
      color: '#64748b', 
      bg: isDark ? '#1e293b' : '#f1f5f9', 
      route: '/(admin-tabs)/settings' 
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800"
        >
          <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text 
          className="flex-1 px-4 text-center text-lg font-LexendBold text-slate-900 dark:text-white tracking-tight" 
        >
          All Quick Actions
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center justify-between mb-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            onPress={() => {
              if (action.route) {
                // @ts-ignore
                router.push(action.route);
              }
            }}
          >
            <View className="flex-row items-center flex-1">
              <View 
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: action.bg }}
              >
                <action.icon size={26} color={action.color} />
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-LexendBold text-slate-900 dark:text-white mb-1">
                  {action.label}
                </Text>
                <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400">
                  {action.subtitle}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <ChevronRight size={20} color={isDark ? '#64748b' : '#94a3b8'} />
            </View>
          </TouchableOpacity>
        ))}
        
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
