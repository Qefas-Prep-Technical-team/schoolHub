import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CreditCard, LineChart, MessageSquareText, Settings } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const QuickActions = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const actions = [
    { label: 'Pay Fees', icon: CreditCard, color: '#10b981' },
    { label: 'Reports', icon: LineChart, color: '#3b82f6' },
    { label: 'Messages', icon: MessageSquareText, color: '#f59e0b' },
    { label: 'Settings', icon: Settings, color: '#64748b' },
  ];

  return (
    <View className="mb-8">
      <Text className="text-lg font-LexendBold text-slate-900 dark:text-white mb-4 px-2">
        Quick Actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 8 }}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="items-center mr-6"
            onPress={() => {
              console.log('Navigate to action');
            }}
          >
            <View className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm items-center justify-center mb-2">
              <action.icon size={24} color={action.color} />
            </View>
            <Text className="text-xs font-Lexend text-slate-600 dark:text-slate-400">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View className="w-4" />
      </ScrollView>
    </View>
  );
};
