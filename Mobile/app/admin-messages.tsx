import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, MessageSquare, Search, Edit3, Send, Users, Mic, MoreVertical } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminMessagesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const chats = [
    { id: 1, name: "Staff General Group", message: "Meeting is moved to 3PM.", time: "10:45 AM", unread: 2, isGroup: true },
    { id: 2, name: "Mr. Adeola (Math)", message: "The test scripts are ready.", time: "Yesterday", unread: 0, isGroup: false },
    { id: 3, name: "Parent Advisory Board", message: "Thank you for the update.", time: "Mon", unread: 0, isGroup: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800"
        >
          <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="flex-1 px-4 text-center text-lg font-LexendBold text-slate-900 dark:text-white tracking-tight">
          Communications
        </Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
          <Edit3 size={18} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Broadcast Card */}
        <View className="px-6 pt-6 mb-8">
          <View className="bg-sky-600 rounded-[2.5rem] p-6 shadow-lg relative overflow-hidden">
            <View className="absolute -right-6 -top-6 h-32 w-32 bg-sky-400 rounded-full blur-2xl opacity-40" />
            
            <View className="flex-row items-center gap-3 mb-4 relative z-10">
              <View className="h-10 w-10 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-md">
                <Send size={18} color="#ffffff" className="-ml-1" />
              </View>
              <View>
                <Text className="text-white font-LexendBlack text-lg italic uppercase tracking-tight">Broadcast</Text>
                <Text className="text-sky-100 font-Lexend text-xs">Send urgent notices</Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-white/20 h-12 rounded-xl flex-row items-center px-4 backdrop-blur-md">
              <Text className="text-sky-100 font-Lexend flex-1">Type announcement...</Text>
              <Mic size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View className="px-6 mb-6">
          <View className="h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex-row items-center px-4">
            <Search size={18} color={isDark ? '#64748b' : '#94a3b8'} />
            <TextInput 
              placeholder="Search conversations..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              className="flex-1 ml-3 font-Lexend text-slate-900 dark:text-white"
            />
          </View>
        </View>

        {/* Chat List */}
        <View className="px-6 pb-20">
          <Text className="text-xs font-LexendBold text-slate-500 uppercase tracking-widest mb-4 ml-2">Recent</Text>
          
          <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {chats.map((chat, index) => (
              <TouchableOpacity 
                key={chat.id} 
                className={`flex-row items-center p-4 ${index !== chats.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
              >
                <View className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
                  {chat.isGroup ? <Users size={24} color={isDark ? '#cbd5e1' : '#64748b'} /> : <MessageSquare size={24} color={isDark ? '#cbd5e1' : '#64748b'} />}
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-LexendBold text-base text-slate-900 dark:text-white">{chat.name}</Text>
                    <Text className={`text-xs font-Lexend ${chat.unread > 0 ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500'}`}>{chat.time}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-sm flex-1 mr-4 ${chat.unread > 0 ? 'font-LexendBold text-slate-800 dark:text-slate-200' : 'font-Lexend text-slate-500'}`} numberOfLines={1}>
                      {chat.message}
                    </Text>
                    {chat.unread > 0 && (
                      <View className="h-5 min-w-[20px] px-1 bg-sky-600 rounded-full items-center justify-center">
                        <Text className="text-[10px] font-LexendBold text-white">{chat.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
