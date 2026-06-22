import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Info, Check, X, Bell, Mail, Megaphone, Activity, AlertCircle } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { useColorScheme } from '@/hooks/use-color-scheme';

const fetchNotifications = async () => {
  const res = await apiClient.get('/notifications?limit=50');
  // Backend returns { data: [...] } if it's the standard format.
  // The frontend mapper in notificationService.ts uses: responseData = response.data.data
  const raw = res.data.data || res.data || [];
  return Array.isArray(raw) ? raw : [];
};

const markAsRead = async (id: string) => {
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data;
};

const respondToLinkRequest = async ({ id, action }: { id: string; action: 'ACCEPT' | 'REJECT' }) => {
  const res = await apiClient.post(`/links/respond/${id}`, { action });
  return res.data;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'LINK_REQUEST': return <Info size={16} color="#3b82f6" />;
    case 'SYSTEM': return <AlertCircle size={16} color="#f97316" />;
    case 'LINK_ACCEPTED': return <Check size={16} color="#22c55e" />;
    case 'LINK_REJECTED': return <X size={16} color="#ef4444" />;
    case 'MESSAGE': return <Mail size={16} color="#ec4899" />;
    case 'ANNOUNCEMENT': return <Megaphone size={16} color="#a855f7" />;
    case 'ACADEMIC': return <Activity size={16} color="#22c55e" />;
    default: return <Bell size={16} color="#64748b" />;
  }
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
};

const isThisWeek = (date: Date) => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= 7 && !isToday(date) && !isYesterday(date);
};

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();

  const { data: rawNotifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const respondMutation = useMutation({
    mutationFn: respondToLinkRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handleRead = (n: any) => {
    if (n.status !== 'READ') {
      readMutation.mutate(n.id);
    }
  };

  const handleLinkRespond = (n: any, action: 'ACCEPT' | 'REJECT') => {
    if (n.linkRequestId) {
      respondMutation.mutate({ id: n.linkRequestId, action });
      if (n.status !== 'READ') {
        readMutation.mutate(n.id);
      }
    }
  };

  // Grouping logic:
  // 1. Unhandled LINK_REQUESTs at the very top (Max 2). The rest are mixed into the regular flow.
  const { topRequests, grouped } = useMemo(() => {
    const unhandledRequests = rawNotifications.filter((n: any) => n.type === 'LINK_REQUEST' && n.status !== 'READ' && n.linkRequestId && !n.data?.isHandled);
    const topRequests = unhandledRequests.slice(0, 2);
    
    // Notifications that are NOT in topRequests go to the standard flow
    const standardFlow = rawNotifications.filter((n: any) => !topRequests.find((tr: any) => tr.id === n.id));

    const today: any[] = [];
    const yesterday: any[] = [];
    const thisWeek: any[] = [];
    const older: any[] = [];

    standardFlow.forEach((n: any) => {
      const d = new Date(n.createdAt);
      if (isToday(d)) today.push(n);
      else if (isYesterday(d)) yesterday.push(n);
      else if (isThisWeek(d)) thisWeek.push(n);
      else older.push(n);
    });

    return {
      topRequests,
      grouped: [
        { title: 'Today', data: today },
        { title: 'Yesterday', data: yesterday },
        { title: 'This Week', data: thisWeek },
        { title: 'Older', data: older }
      ].filter(g => g.data.length > 0)
    };
  }, [rawNotifications]);

  const renderNotification = (n: any) => {
    const isUnread = n.status !== 'READ';
    const isLinkRequest = n.type === 'LINK_REQUEST' && isUnread && n.linkRequestId;

    return (
      <TouchableOpacity 
        key={n.id}
        onPress={() => handleRead(n)}
        className={`flex-row gap-3 p-4 border-b border-slate-100 dark:border-slate-800 ${isUnread ? 'bg-pink-50/50 dark:bg-pink-500/10' : 'bg-white dark:bg-[#020617]'}`}
      >
        <View className="mt-0.5 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center border border-slate-200 dark:border-slate-700">
          {getTypeIcon(n.type)}
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`font-lexend-bold text-[13px] flex-1 mr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</Text>
            {isUnread && <View className="w-2 h-2 rounded-full bg-pink-500 mt-1.5" />}
          </View>
          <Text className="font-lexend text-[12px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">{n.message}</Text>
          
          {isLinkRequest && (
            <View className="flex-row gap-2 mt-1">
              <TouchableOpacity 
                onPress={() => handleLinkRespond(n, 'ACCEPT')}
                className="bg-pink-500 px-4 py-1.5 rounded-full"
              >
                <Text className="font-lexend-bold text-[11px] text-white">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleLinkRespond(n, 'REJECT')}
                className="bg-slate-200 dark:bg-slate-800 px-4 py-1.5 rounded-full"
              >
                <Text className="font-lexend-bold text-[11px] text-slate-700 dark:text-slate-300">Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-[#020617]">
      <Stack.Screen options={{ headerTitle: 'Notifications', headerShadowVisible: false }} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#ec4899" />
        }
      >
        {isLoading ? (
          <View className="p-8 items-center">
            <ActivityIndicator color="#ec4899" />
          </View>
        ) : (
          <View className="pb-8">
            {topRequests.length > 0 && (
              <View className="mb-2">
                <View className="px-5 py-3 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800">
                  <Text className="font-lexend-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Requests</Text>
                </View>
                {topRequests.map(renderNotification)}
              </View>
            )}

            {grouped.map((group, idx) => (
              <View key={idx}>
                <View className="px-5 py-3 bg-slate-50 dark:bg-[#0f172a] border-b border-t border-slate-100 dark:border-slate-800">
                  <Text className="font-lexend-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{group.title}</Text>
                </View>
                {group.data.map(renderNotification)}
              </View>
            ))}

            {topRequests.length === 0 && grouped.length === 0 && (
              <View className="p-8 items-center justify-center h-[300px]">
                <Bell size={48} color={isDark ? '#334155' : '#cbd5e1'} className="mb-4" />
                <Text className="font-lexend-bold text-slate-400 dark:text-slate-500">No notifications yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
