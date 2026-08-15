import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Wallet, CheckCircle2, AlertCircle, TrendingUp, Rocket, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface FeeSummaryProps {
  activeChildId?: string;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export const FeeSummary = ({ activeChildId }: FeeSummaryProps) => {
  const { data, isLoading } = useParentDashboard(activeChildId);
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const payments = data?.payments;
  const totalPaid = payments?.totalPaid ?? 0;
  const totalOutstanding = payments?.totalOutstanding ?? 0;
  const totalFees = payments?.totalFees ?? 0;
  const paidPercent = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

  return (
    <View className="mb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-LexendBold text-slate-800 dark:text-white uppercase tracking-tight">
            Fee Summary
          </Text>
          <Text className="text-[11px] font-LexendBold text-orange-500 uppercase tracking-widest mt-0.5">
            Payment status
          </Text>
        </View>
        {/* Coming Soon badge in header */}
        <View className="flex-row items-center gap-1.5 bg-orange-500/10 border border-orange-400/30 px-3 py-1.5 rounded-full">
          <Rocket size={11} color="#f97316" />
          <Text className="text-[10px] font-LexendBold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
            Coming Soon
          </Text>
        </View>
      </View>

      {/* Card with overlay */}
      <View className="rounded-[32px] overflow-hidden">
        {/* Blurred/dimmed card underneath */}
        <View
          className="bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700"
          style={{ opacity: 0.35 }}
          pointerEvents="none"
        >
          {/* Progress bar */}
          <View className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-5">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(paidPercent, 100)}%`,
                backgroundColor: '#f59e0b',
              }}
            />
          </View>

          {/* Stats row */}
          <View className="flex-row justify-between mb-5">
            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <CheckCircle2 size={13} color="#059669" />
                <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-wide">Paid</Text>
              </View>
              <Text className="text-base font-LexendBold text-emerald-600 dark:text-emerald-400">
                {isLoading ? '—' : formatNaira(totalPaid)}
              </Text>
            </View>

            <View className="w-px bg-slate-200 dark:bg-slate-700" />

            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <AlertCircle size={13} color="#ef4444" />
                <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-wide">Owed</Text>
              </View>
              <Text className="text-base font-LexendBold text-red-500">
                {isLoading ? '—' : formatNaira(totalOutstanding)}
              </Text>
            </View>

            <View className="w-px bg-slate-200 dark:bg-slate-700" />

            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <Wallet size={13} color="#64748b" />
                <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-wide">Total</Text>
              </View>
              <Text className="text-base font-LexendBold text-slate-700 dark:text-slate-200">
                {isLoading ? '—' : formatNaira(totalFees)}
              </Text>
            </View>
          </View>

          {/* Fake pay button */}
          <View className="bg-orange-500 rounded-2xl py-3 items-center">
            <Text className="text-white text-sm font-LexendBold">Pay Outstanding</Text>
          </View>
        </View>

        {/* Coming Soon Overlay */}
        <View
          className="absolute inset-0 rounded-[32px] items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(15,23,42,0.78)' : 'rgba(255,255,255,0.78)',
          }}
        >
          {/* Glow ring */}
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: isDark ? '#7c2d1230' : '#ffedd5' }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: isDark ? '#9a341240' : '#fed7aa' }}
            >
              <Lock size={22} color="#f97316" />
            </View>
          </View>

          <Text className="text-base font-LexendBold text-slate-800 dark:text-white mb-1">
            Fee Management
          </Text>
          <Text className="text-[11px] font-Lexend text-slate-500 dark:text-slate-400 text-center px-6 mb-3">
            Online payment & fee tracking is coming soon. You'll be able to pay and track fees directly in the app.
          </Text>

          {/* Pill badge */}
          <View
            className="flex-row items-center gap-1.5 px-4 py-2 rounded-full border"
            style={{
              backgroundColor: isDark ? '#7c2d1220' : '#fff7ed',
              borderColor: isDark ? '#ea580c50' : '#fdba74',
            }}
          >
            <Rocket size={12} color="#f97316" />
            <Text className="text-[11px] font-LexendBold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Coming Soon
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
