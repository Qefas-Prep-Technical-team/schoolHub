import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Mail, BookOpen, Briefcase, User as UserIcon } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { Image } from 'expo-image';

export default function ChildTeachersScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const isDark = useColorScheme() === 'dark';

    const { data: student, isLoading, error } = useChildDetails(childId);

    const teachers = student?.classes?.[0]?.class?.teachers || [];

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full items-center justify-center mr-4 border border-indigo-200 dark:border-indigo-800">
                        <Users size={20} color="#6366f1" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Teachers</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Class & Subject Teachers
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 pt-6">
                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : error ? (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-rose-500 font-bold mb-2">Failed to load teachers.</Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text className="text-slate-500">Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    ) : teachers.length === 0 ? (
                        <View className="flex-1 justify-center items-center opacity-70">
                            <Users size={48} color={isDark ? '#475569' : '#94a3b8'} className="mb-4" />
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Teachers Found</Text>
                            <Text className="text-slate-500 text-center max-w-[250px]">
                                There are no teachers currently assigned to your child's class.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={teachers}
                            keyExtractor={(item) => item.teacher.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => {
                                const teacher = item.teacher;
                                return (
                                    <View className="bg-white dark:bg-slate-900 p-6 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <View className="flex-row items-center mb-4">
                                            {teacher.bannerImage ? (
                                                <Image 
                                                    source={{ uri: teacher.bannerImage }} 
                                                    className="w-16 h-16 rounded-full mr-4 border-2 border-slate-100 dark:border-slate-800" 
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View className="w-16 h-16 rounded-full mr-4 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-50 dark:border-indigo-900/50">
                                                    <UserIcon size={28} color="#6366f1" />
                                                </View>
                                            )}
                                            
                                            <View className="flex-1">
                                                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{teacher.name}</Text>
                                                <Text className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                                    {item.isLead ? 'Class Teacher' : 'Subject Teacher'}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 space-y-3 mb-4">
                                            {teacher.subject && (
                                                <View className="flex-row items-center gap-3">
                                                    <BookOpen size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                                                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{teacher.subject}</Text>
                                                </View>
                                            )}
                                            {teacher.department && (
                                                <View className="flex-row items-center gap-3">
                                                    <Briefcase size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                                                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{teacher.department}</Text>
                                                </View>
                                            )}
                                        </View>
                                        
                                        {teacher.email && (
                                            <TouchableOpacity 
                                                className="w-full flex-row items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 py-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30"
                                            >
                                                <Mail size={16} color="#6366f1" />
                                                <Text className="text-indigo-600 dark:text-indigo-400 font-bold">Email Teacher</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
