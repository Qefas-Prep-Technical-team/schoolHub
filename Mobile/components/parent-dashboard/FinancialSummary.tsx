import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, Wallet, ArrowRight, Download } from 'lucide-react-native';

export const FinancialSummary = () => {
  return (
    <View className="mb-6 px-4">
      <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center space-x-2">
            <View className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <Wallet size={16} color="#10b981" />
            </View>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider">
              Financial Status
            </Text>
          </View>
        </View>

        <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-800">
          <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
            Total Outstanding Balance
          </Text>
          <Text className="text-3xl font-LexendBold text-slate-900 dark:text-white tracking-tight">
            $1,250.00
          </Text>
          <View className="flex-row items-center mt-2 space-x-1">
            <Text className="text-[10px] font-Lexend text-slate-500 dark:text-slate-400">Due Date:</Text>
            <Text className="text-[10px] font-LexendBold text-orange-500">Oct 30, 2026</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          <TouchableOpacity className="flex-1 bg-primary dark:bg-primary-container rounded-xl py-3 flex-row justify-center items-center space-x-2 shadow-sm">
            <CreditCard size={14} color="#ffffff" />
            <Text className="text-white text-xs font-LexendBold uppercase tracking-wider">Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center border border-slate-200 dark:border-slate-700">
            <Download size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
