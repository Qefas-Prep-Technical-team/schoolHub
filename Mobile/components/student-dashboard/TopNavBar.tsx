import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, QrCode } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useUnreadCount } from '@/lib/api/hooks/useNotifications';

export function TopNavBar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-transparent mt-2">
      {/* Left: QR Code */}
      <TouchableOpacity 
        onPress={() => router.push('/linking-hub')}
        className="h-10 w-10 items-center justify-center"
      >
        <QrCode size={24} color={isDark ? '#ffffff' : '#0f172a'} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Middle: Brand Name */}
      <View className="items-center">
        <Text className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">
          Qefas <Text className="text-pink-600">Hub</Text>
        </Text>
      </View>

      {/* Right: Notifications */}
      <View className="flex-row items-center gap-4">
        <TouchableOpacity 
          onPress={() => router.push('/notifications')}
          className="h-10 w-10 items-center justify-center relative"
        >
          <Bell size={24} color={isDark ? '#ffffff' : '#0f172a'} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <View className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-red-500 rounded-full items-center justify-center border-2 border-slate-50 dark:border-black">
              <Text className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
