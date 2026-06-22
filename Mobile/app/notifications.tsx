import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Bell, CheckCheck, Link2, AlertTriangle, Info, BookOpen, Trash2 } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications, useMarkAllAsRead, useMarkAsRead, useDeleteNotification } from '@/lib/api/hooks/useNotifications';
import { Notification } from '@/lib/api/services/notificationService';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: notificationsData, isLoading } = useNotifications();
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = (notificationsData as unknown as Notification[]) || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST':
      case 'LINK_RESPONSE':
        return <Link2 size={20} color="#4f46e5" />; // indigo-600
      case 'SYSTEM':
        return <AlertTriangle size={20} color="#f59e0b" />; // amber-500
      case 'ACADEMIC':
        return <BookOpen size={20} color="#ec4899" />; // pink-500
      case 'ANNOUNCEMENT':
        return <Info size={20} color="#3b82f6" />; // blue-500
      default:
        return <Bell size={20} color="#64748b" />; // slate-500
    }
  };

  const getIconBgForType = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST':
      case 'LINK_RESPONSE':
        return isDark ? 'bg-indigo-900/30' : 'bg-indigo-50';
      case 'SYSTEM':
        return isDark ? 'bg-amber-900/30' : 'bg-amber-50';
      case 'ACADEMIC':
        return isDark ? 'bg-pink-900/30' : 'bg-pink-50';
      case 'ANNOUNCEMENT':
        return isDark ? 'bg-blue-900/30' : 'bg-blue-50';
      default:
        return isDark ? 'bg-slate-800' : 'bg-slate-100';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Toggle the expanded state
    setExpandedId(prev => prev === notification.id ? null : notification.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800"
        >
          <X size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notifications</Text>
        
        {unreadCount > 0 ? (
          <TouchableOpacity 
            onPress={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center rounded-full"
          >
            {markAllAsReadMutation.isPending ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <CheckCheck size={20} color="#4f46e5" />
            )}
          </TouchableOpacity>
        ) : (
          <View className="h-10 w-10" />
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4f46e5" className="my-10" />
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <AnimatedTouchableOpacity 
              key={notification.id}
              layout={LinearTransition.springify().damping(16).stiffness(120)}
              onPress={() => handleNotificationPress(notification)}
              className={`p-4 mb-3 rounded-2xl border ${
                notification.isRead 
                  ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' 
                  : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
              } flex-row items-start`}
            >
              <View className={`h-12 w-12 rounded-xl items-center justify-center mr-4 mt-1 ${getIconBgForType(notification.type)}`}>
                {getIconForType(notification.type)}
              </View>
              
              <View className="flex-1 mr-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`text-xs font-black uppercase tracking-widest ${notification.isRead ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {notification.type.replace('_', ' ')}
                  </Text>
                  <Text className="text-[10px] font-bold text-slate-400">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text className={`font-bold mb-1 ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                  {notification.title}
                </Text>
                <Text 
                  numberOfLines={expandedId === notification.id ? undefined : 2}
                  className={`text-sm leading-5 ${notification.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {notification.message}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => deleteMutation.mutate(notification.id)}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800"
              >
                <Trash2 size={14} color="#ef4444" />
              </TouchableOpacity>
              
              {!notification.isRead && (
                <View className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </AnimatedTouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Bell size={48} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: 16 }} />
            <Text className="text-slate-400 font-bold uppercase tracking-widest">No notifications yet</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
