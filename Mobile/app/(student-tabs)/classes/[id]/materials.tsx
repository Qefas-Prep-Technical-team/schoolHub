import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Book } from 'lucide-react-native';

export default function ClassMaterialsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4"
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-slate-900 dark:text-white">
            Class Materials
          </Text>
        </View>

        {/* Coming Soon Content */}
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mb-6">
            <Book size={48} className="text-indigo-500" />
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-3">
            Coming Soon
          </Text>
          <Text className="text-base text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            We are currently working on bringing class materials and study resources to your dashboard. Check back later!
          </Text>
          
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-8 px-8 py-3 bg-indigo-600 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
