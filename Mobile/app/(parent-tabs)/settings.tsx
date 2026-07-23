import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoutButton } from '../../components/ui/LogoutButton';

export default function ParentSettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-LexendBold text-slate-900 dark:text-white mb-8">
          Settings
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mb-2 px-2 uppercase tracking-wider">
            Account Actions
          </Text>
          <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <LogoutButton />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
