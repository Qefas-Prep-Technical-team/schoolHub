import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ArrowLeft, User, Mail, Phone, MapPin, Settings } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ParentProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <ArrowLeft size={20} color={isDark ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
          My Profile
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/settings')}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <Settings size={20} color={isDark ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 items-center justify-center bg-slate-100 dark:bg-slate-800 shadow-sm">
            <Text className="text-4xl font-LexendBlack text-pink-600 dark:text-pink-500">
              P
            </Text>
          </View>
          <Text className="text-xl font-LexendBold text-slate-900 dark:text-white mt-4">
            Mr. Johnson
          </Text>
          <Text className="text-sm font-LexendMedium text-slate-500 dark:text-slate-400 mt-1">
            Family Account
          </Text>
        </View>

        {/* Info Cards */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Contact Information
          </Text>

          <View className="flex-row items-center gap-4 mb-6">
            <View className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Mail size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">Email Address</Text>
              <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white mt-0.5">johnson@family.com</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 mb-6">
            <View className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl">
              <Phone size={20} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">Phone Number</Text>
              <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white mt-0.5">+1 (555) 123-4567</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <MapPin size={20} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">Home Address</Text>
              <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white mt-0.5">123 Schoolhouse Rd, City</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="bg-blue-600 rounded-2xl p-4 items-center justify-center shadow-sm shadow-blue-600/20">
          <Text className="text-white font-LexendBold text-sm">
            Edit Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
