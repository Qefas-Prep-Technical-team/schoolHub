import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, Zap, Calendar, CheckCircle2, CreditCard, Landmark, ArrowUpRight, BarChart } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminSubscriptionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const currentPlan = {
    name: "Enterprise",
    amount: "₦150,000",
    cycle: "monthly",
    status: "Active",
    nextBilling: "Nov 15, 2023",
    features: [
      "Unlimited Students",
      "Advanced Analytics",
      "Priority Support",
      "Custom Branding"
    ]
  };

  const usageLimits = [
    { label: "Storage", used: "45GB", limit: "100GB", percentage: 45 },
    { label: "Students", used: "842", limit: "Unlimited", percentage: 10 },
  ];

  const transactions = [
    { id: 1, name: "Enterprise Plan", type: "Subscription", amount: "₦150,000", date: "Oct 15, 2023", status: "success" },
    { id: 2, name: "Enterprise Plan", type: "Subscription", amount: "₦150,000", date: "Sep 15, 2023", status: "success" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="flex-1 px-4 text-center text-lg font-LexendBold text-slate-900 dark:text-white tracking-tight">
          Subscriptions
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Current Plan Card */}
        <View className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border border-slate-800 mb-6">
          <View className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-600 rounded-full blur-3xl opacity-20" />
          
          <View className="flex-row items-center justify-between mb-8 relative z-10">
            <View className="bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30">
              <Text className="text-indigo-400 font-LexendBold text-[10px] uppercase tracking-widest">Current Plan</Text>
            </View>
            <View className="h-12 w-12 bg-white/10 rounded-2xl items-center justify-center backdrop-blur-md border border-white/10">
              <ShieldCheck size={24} color="#ffffff" />
            </View>
          </View>
          
          <View className="relative z-10 mb-6">
            <Text className="text-4xl font-LexendBlack text-white italic tracking-tighter mb-2">{currentPlan.name}</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl font-LexendBlack text-indigo-400 tracking-tighter">{currentPlan.amount}</Text>
              <Text className="text-slate-400 font-Lexend text-xs uppercase tracking-widest">/ {currentPlan.cycle}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-8 relative z-10">
            <TouchableOpacity className="flex-1 h-12 bg-white rounded-xl items-center justify-center">
              <Text className="text-slate-900 font-LexendBold text-xs uppercase tracking-widest">Change Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-12 bg-white/10 rounded-xl items-center justify-center border border-white/20">
              <Text className="text-white font-LexendBold text-xs uppercase tracking-widest">Payment</Text>
            </TouchableOpacity>
          </View>

          {/* Plan Details Split */}
          <View className="bg-white/5 rounded-3xl p-5 border border-white/10 relative z-10">
            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest mb-1">Status</Text>
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-emerald-500" />
                  <Text className="text-white font-LexendBold">{currentPlan.status}</Text>
                </View>
              </View>
              <View>
                <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest mb-1">Renewal</Text>
                <View className="flex-row items-center gap-2">
                  <Calendar size={14} color="#94a3b8" />
                  <Text className="text-white font-LexendBold">{currentPlan.nextBilling}</Text>
                </View>
              </View>
            </View>

            <View className="h-[1px] w-full bg-white/10 mb-4" />
            
            <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest mb-3">Highlights</Text>
            {currentPlan.features.map((feature, idx) => (
              <View key={idx} className="flex-row items-center gap-3 mb-2">
                <CheckCircle2 size={16} color="#10b981" />
                <Text className="text-slate-300 font-Lexend text-sm">{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Usage Limits Card */}
        <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <BarChart size={18} color="#4f46e5" />
            </View>
            <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Usage Limits</Text>
          </View>
          
          <View className="space-y-5">
            {usageLimits.map((limit, idx) => (
              <View key={idx}>
                <View className="flex-row justify-between mb-2">
                  <Text className="font-LexendBold text-slate-700 dark:text-slate-300">{limit.label}</Text>
                  <Text className="font-Lexend text-slate-500 text-xs">{limit.used} / {limit.limit}</Text>
                </View>
                <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${limit.percentage}%` }} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Next Payment Card */}
        <View className="bg-indigo-600 rounded-[2.5rem] p-6 shadow-lg mb-8 relative overflow-hidden">
          <View className="absolute right-0 top-0 p-4 opacity-10">
            <Zap size={80} color="#ffffff" />
          </View>
          <View className="h-12 w-12 bg-white/20 rounded-2xl items-center justify-center mb-6 backdrop-blur-md">
            <Zap size={24} color="#ffffff" />
          </View>
          <Text className="text-[10px] font-LexendBold text-indigo-200 uppercase tracking-widest mb-1">Next Payment</Text>
          <View className="flex-row items-baseline gap-2 mb-2">
            <Text className="text-3xl font-LexendBlack text-white italic tracking-tighter">{currentPlan.amount}</Text>
            <Text className="text-indigo-200 font-LexendBold text-xs uppercase tracking-widest">/ {currentPlan.cycle}</Text>
          </View>
          <Text className="text-indigo-100 font-Lexend text-xs leading-5">Your plan will renew automatically on the next billing date.</Text>
        </View>

        {/* Transaction History */}
        <View className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 bg-slate-100 dark:bg-slate-900 rounded-xl items-center justify-center border border-slate-200 dark:border-slate-800">
                <CreditCard size={18} color={isDark ? '#f8fafc' : '#0f172a'} />
              </View>
              <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">History</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-xs font-LexendBold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.map((tx, index) => (
            <View key={tx.id} className={`flex-row items-center py-4 ${index !== transactions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
              <View className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 items-center justify-center mr-3 border border-slate-100 dark:border-slate-800">
                <ArrowUpRight size={18} color={tx.status === 'success' ? '#10b981' : '#f59e0b'} />
              </View>
              <View className="flex-1">
                <Text className="font-LexendBold text-slate-900 dark:text-white">{tx.name}</Text>
                <Text className="text-xs font-Lexend text-slate-500 mt-1">{tx.type} • {tx.date}</Text>
              </View>
              <Text className="font-LexendBlack text-slate-900 dark:text-white text-base tracking-tighter">{tx.amount}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
