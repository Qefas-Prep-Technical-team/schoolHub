import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen, Clock, Sparkles } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChildReportCardScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const isDark = useColorScheme() === 'dark';

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-full items-center justify-center mr-4 border border-purple-200 dark:border-purple-800">
                        <BookOpen size={20} color="#8b5cf6" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Report Card</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Academic Assessment
                        </Text>
                    </View>
                </View>

                {/* Coming Soon Content */}
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 justify-center items-center">
                    <View className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 items-center shadow-lg shadow-purple-500/5 max-w-sm w-full">
                        <View className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-[2rem] items-center justify-center mb-6">
                            <Sparkles size={48} color="#8b5cf6" />
                        </View>
                        
                        <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white text-center mb-3">
                            Coming Soon
                        </Text>
                        
                        <Text className="text-center text-slate-500 dark:text-slate-400 font-Lexend leading-relaxed mb-8">
                            Digital report cards and detailed term assessments are currently under development. They will be available here at the end of the term.
                        </Text>

                        <View className="flex-row items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 py-3 px-6 rounded-full w-full">
                            <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className="text-xs font-LexendBold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                In Development
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
