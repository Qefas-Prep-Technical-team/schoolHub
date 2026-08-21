import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, QrCode } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useUnreadCount } from '@/lib/api/hooks/useNotifications';

export function TopNavBar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { data: user } = useAuthUser();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;
  
  const fallbackUrl = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nerd%20Face.png';

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-transparent mt-2">
      {/* Left: QR Code & Avatar */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.push('/(student-tabs)/settings')}
          className="h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm"
        >
          <Image 
            source={{ uri: user?.profileImage || fallbackUrl }} 
            placeholder={{ uri: fallbackUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={500}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/linking-hub')}
          className="h-10 w-10 items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm"
        >
          <QrCode size={18} color={isDark ? '#ffffff' : '#0f172a'} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

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
