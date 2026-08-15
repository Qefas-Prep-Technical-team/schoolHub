import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const FinancialSummary = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-8">
      <View className="mb-4">
        <Text className="text-lg font-LexendBold text-slate-800 dark:text-white uppercase tracking-tight">Financial Status</Text>
        <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mt-1">Fee management & receipts</Text>
      </View>
      
      <View className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-red-100 dark:bg-red-900/30 h-12 w-12 rounded-2xl items-center justify-center mr-4">
            <Wallet size={24} color={isDark ? "#fca5a5" : "#ef4444"} />
          </View>
          <View>
            <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mb-0.5">Term 2 Outstanding</Text>
            <Text className="text-xl font-black text-slate-800 dark:text-white">$450.00</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-orange-500 dark:bg-orange-600 rounded-full py-2.5 px-5 shadow-sm">
          <Text className="text-white text-xs font-LexendBold">Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
