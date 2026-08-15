import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Calendar, Users, Building2, Briefcase, Hash, GraduationCap, Mail, BookOpen } from 'lucide-react-native';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useColorScheme } from '@/hooks/use-color-scheme';

const InfoRow = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) => (
    <View className="flex-row items-center gap-4 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
        <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon size={16} color={color} />
        </View>
        <View className="flex-1">
            <Text className="text-[9px] font-LexendBlack uppercase tracking-widest text-slate-400 mb-1">{label}</Text>
            <Text className="text-sm font-LexendBold text-slate-700 dark:text-slate-300" numberOfLines={2}>{value || '—'}</Text>
        </View>
    </View>
);

export default function ChildInfoScreen() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const { data: student, isLoading } = useChildDetails(childId);
    
    const isDark = useColorScheme() === 'dark';
    const primaryColor = '#3b82f6'; // Blue for profile info

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
                <ActivityIndicator size="large" color={primaryColor} />
            </SafeAreaView>
        );
    }

    const email = student?.email || 'No email registered';
    const studentCode = student?.studentCode || 'UNASSIGNED';
    const gender = student?.gender || 'Not specified';
    const dob = student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';
    const studentClass = student?.classes?.[0]?.class;
    const classNameLabel = studentClass ? `${studentClass.name} ${studentClass.section || ''}` : 'Unassigned Class';
    const department = student?.department?.name || 'General';

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />
            
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full items-center justify-center mr-4 border border-blue-200 dark:border-blue-800">
                        <User size={20} color="#3b82f6" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Profile Details</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {student?.name || 'Student Profile'}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Personal Information */}
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight mb-4">Personal Information</Text>
                    <View className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm mb-8">
                        <InfoRow icon={Hash} label="Student Code" value={studentCode} color="#ea580c" />
                        <InfoRow icon={Mail} label="Email Address" value={email} color="#3b82f6" />
                        <InfoRow icon={Calendar} label="Date of Birth" value={dob} color="#6366f1" />
                        <InfoRow icon={Users} label="Gender" value={gender} color="#10b981" />
                    </View>

                    {/* Academic Context */}
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight mb-4">Academic Context</Text>
                    <View className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm mb-8">
                        <InfoRow icon={Building2} label="Current School" value={student?.school?.name || 'Not linked'} color="#f59e0b" />
                        <InfoRow icon={BookOpen} label="Assigned Class" value={classNameLabel} color="#8b5cf6" />
                        <InfoRow icon={Briefcase} label="Department" value={department} color="#ec4899" />
                        <InfoRow icon={GraduationCap} label="Grade Level" value={student?.gradeLevel || 'Level 1'} color="#14b8a6" />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
