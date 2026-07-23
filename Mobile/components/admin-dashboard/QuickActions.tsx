import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserPlus, PlusCircle, FileText, Settings, CreditCard, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

export const QuickActions = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const actions = [
    { 
      label: 'Add Student', 
      subtitle: 'Register new enrollment', 
      stat: '+12 This Week',
      icon: UserPlus, 
      color: '#f59e0b', 
      bg: isDark ? '#78350f' : '#fef3c7', 
      route: '/(admin-tabs)/students/add' 
    },
    { 
      label: 'New Class', 
      subtitle: 'Create classroom section',
      stat: '24 Total',
      icon: PlusCircle, 
      color: '#8b5cf6', 
      bg: isDark ? '#4c1d95' : '#ede9fe', 
      route: '/(admin-tabs)/classes/new' 
    },
    { 
      label: 'Billing', 
      subtitle: 'Manage fee collections',
      stat: '$14,200',
      icon: CreditCard, 
      color: '#10b981', 
      bg: isDark ? '#064e3b' : '#d1fae5', 
      route: '/(admin-tabs)/billing' 
    },
    { 
      label: 'Settings', 
      subtitle: 'System configuration',
      stat: 'Manage',
      icon: Settings, 
      color: '#64748b', 
      bg: isDark ? '#1e293b' : '#f1f5f9', 
      route: '/(admin-tabs)/settings' 
    },
  ];

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
          Quick Actions
        </Text>
        <TouchableOpacity onPress={() => router.push('/admin-quick-actions')}>
          <Text className="text-sm font-Lexend text-blue-600 dark:text-blue-400">
            See All
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="px-2">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center justify-between mb-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            onPress={() => {
              // router.push(action.route as any);
              console.log('Navigate to:', action.route);
            }}
          >
            <View className="flex-row items-center flex-1">
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: action.bg }}
              >
                <action.icon size={22} color={action.color} />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-LexendBold text-slate-900 dark:text-white mb-0.5">
                  {action.label}
                </Text>
                <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">
                  {action.subtitle}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-2">
              <Text className="text-xs font-LexendBold text-slate-700 dark:text-slate-300 mr-2">
                {action.stat}
              </Text>
              <ChevronRight size={16} color={isDark ? '#64748b' : '#94a3b8'} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
