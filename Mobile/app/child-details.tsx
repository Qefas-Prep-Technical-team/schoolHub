import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Activity, Star, Clock, User, ShieldCheck, BookOpen, GraduationCap, ChevronRight, FileText, Users, MessageSquare } from 'lucide-react-native';
import { useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Svg, { Circle } from 'react-native-svg';
import { useNetwork } from '@/hooks/use-network';



// Circular Progress Component using SVG
const CircularProgress = ({
    value,
    max = 100,
    label,
    color,
    size = 80,
    strokeWidth = 7,
    showPercent
}: {
    value: number;
    max?: number;
    label: string;
    color: string;
    size?: number;
    strokeWidth?: number;
    showPercent?: boolean;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(value / (max || 1), 1);  // Clamp to 1
    const strokeDashoffset = circumference - progress * circumference;
    const displayText = showPercent ? `${value}%` : `${value}`;

    return (
        <View className="items-center">
            {/* Fixed-size container so text can be absolutely centred */}
            <View style={{ width: size, height: size }}>
                {/* SVG ring behind everything */}
                <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Track */}
                    <Circle
                        stroke={`${color}25`}
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress */}
                    <Circle
                        stroke={color}
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>
                {/* Text absolutely centred over the ring */}
                <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color, fontSize: 15, fontWeight: '800', letterSpacing: -0.5 }}>
                        {displayText}
                    </Text>
                </View>
            </View>
            <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-tight text-center">
                {label}
            </Text>
        </View>
    );
};

// Grid Menu Item
const GridItem = ({
    title,
    icon: Icon,
    color,
    onPress,
    index,
    total
}: {
    title: string;
    icon: any;
    color: string;
    onPress: () => void;
    index: number;
    total: number;
}) => {
    const col = index % 3;            // 0, 1, 2
    const row = Math.floor(index / 3);
    const totalRows = Math.ceil(total / 3);
    const isLastCol = col === 2;
    const isLastRow = row === totalRows - 1;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{ width: '33.33%' }}
            className={[
                'items-center justify-center py-8 px-3',
                !isLastCol ? 'border-r border-slate-100 dark:border-slate-800' : '',
                !isLastRow ? 'border-b border-slate-100 dark:border-slate-800' : '',
            ].join(' ')}
        >
            <View
                className="w-[56px] h-[56px] rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon size={26} color={color} strokeWidth={1.8} />
            </View>
            <Text
                className="text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center"
                style={{ lineHeight: 16, paddingHorizontal: 4 }}
                numberOfLines={2}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default function ChildDetailsLaunchpad() {
    const { childId } = useLocalSearchParams<{ childId: string }>();
    const { data: student, isLoading, isError, refetch } = useChildDetails(childId);
    const { data: dashboardData, refetch: refetchDashboard } = useParentDashboard(childId);
    const { width } = useWindowDimensions();

    const [refreshing, setRefreshing] = useState(false);
    const { isConnected } = useNetwork();

    const onRefresh = useCallback(async () => {
        if (!isConnected) return;
        setRefreshing(true);
        await Promise.all([refetch(), refetchDashboard()]);
        setRefreshing(false);
    }, [isConnected, refetch, refetchDashboard]);

    const isDark = useColorScheme() === 'dark';
    const primaryColor = '#ea580c'; // Keep the orange theme as requested previously

    // Use server-computed stats (same source as web frontend) for accurate numbers
    const serverStats = dashboardData?.stats;

    const performanceStats = useMemo(() => {
        // Use server-computed average from full grade history
        const score = serverStats?.averageGrade ?? 0;
        // Count is still from local grades for display
        const count = student?.grades?.length ?? 0;
        return { score, count };
    }, [serverStats?.averageGrade, student?.grades]);

    const attendanceStats = useMemo(() => {
        // Use server-computed monthly attendance rate (matches web frontend)
        const rate = serverStats?.attendanceRate ?? 0;
        return { rate };
    }, [serverStats?.attendanceRate]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={primaryColor} />
            </SafeAreaView>
        );
    }

    if (isError || !student) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center p-6">
                <Stack.Screen options={{ headerShown: false }} />
                <ShieldCheck size={48} color="#94a3b8" />
                <Text className="text-sm font-bold text-red-500 mt-4">Student not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6">
                    <Text className="text-xs font-black text-slate-500">GO BACK</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const name = student.name || 'Student';
    const studentClass = student.classes?.[0]?.class;
    const classNameLabel = studentClass ? `${studentClass.name} ${studentClass.section || ''}` : 'Unassigned Class';
    const avatar = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ea580c&color=fff&size=200`;

    // Format current date for the overlapping card
    const today = new Date();
    const day = today.getDate();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Add ordinal suffix to day
    const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : (day % 100 - day % 10 != 10) ? day % 10 : 0];

    // Find today's attendance status
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = student?.attendances?.find(a => {
        const d = new Date(a.date);
        return d.toISOString().split('T')[0] === todayStr;
    });
    const todayStatus = todayRecord?.status?.toUpperCase() || 'NOT RECORDED';

    let statusColor = '#94a3b8'; // Slate (Not Recorded)
    let blinkerBg = 'bg-slate-500';
    let statusLabel = 'Not Recorded';

    if (todayStatus === 'PRESENT') {
        statusColor = '#10b981'; // Emerald
        blinkerBg = 'bg-emerald-500';
        statusLabel = 'In School';
    } else if (todayStatus === 'LATE') {
        statusColor = '#f59e0b'; // Amber
        blinkerBg = 'bg-amber-500';
        statusLabel = 'Late Today';
    } else if (todayStatus === 'ABSENT') {
        statusColor = '#ef4444'; // Rose
        blinkerBg = 'bg-rose-500';
        statusLabel = 'Absent';
    }

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                bounces={true}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDark ? '#f97316' : '#ea580c'}
                        colors={['#ea580c']}
                    />
                }
            >

                {/* Full-bleed Background Hero */}
                <View className="relative w-full h-[380px]">
                    {/* Clear Background Image */}
                    <Image
                        source={{ uri: avatar }}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                        contentFit="cover"
                    />

                    {/* Dark gradient overlay for text legibility */}
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Content wrapped in SafeArea for proper spacing */}
                    <SafeAreaView className="flex-1 px-4 pt-2 z-10" edges={['top']}>
                        {/* Top Navigation */}
                        <View className="flex-row justify-between items-center mb-2">
                            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                                <ArrowLeft size={24} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

                        {/* Centered Profile Info */}
                        <View className="flex-1 items-center justify-center pb-8">
                            {/* Circular Avatar */}
                            <View className="w-24 h-24 rounded-full border-2 border-white/40 overflow-hidden mb-4 shadow-lg">
                                <Image
                                    source={{ uri: avatar }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                />
                            </View>

                            {/* Name and Subtitle */}
                            <Text className="text-2xl font-bold text-white tracking-tight mb-2 shadow-sm text-center px-6">
                                {name}
                            </Text>
                            <Text className="text-[13px] font-medium text-white/80 text-center px-10 leading-tight">
                                {student?.studentCode || 'No Student Code'} • {classNameLabel}
                            </Text>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Overlapping Content Area */}
                <View className="px-5 -mt-6 pb-12 relative z-20">

                    {/* Date / Status Card */}
                    <View className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-4xl font-LexendBlack text-orange-600 dark:text-orange-400">{day}</Text>
                                <Text className="text-lg font-LexendBold text-orange-600 dark:text-orange-400">{suffix}</Text>
                                <View className="ml-3">
                                    <Text className="text-sm font-LexendBold text-slate-800 dark:text-white">{dayName}</Text>
                                    <Text className="text-xs text-slate-400 font-medium">{monthYear}</Text>
                                </View>
                            </View>
                            <View className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700`} style={{ backgroundColor: `${statusColor}10` }}>
                                {/* Blinker Dot */}
                                <View className={`w-2 h-2 rounded-full ${blinkerBg}`} />
                                <Text className="text-xs font-LexendBold" style={{ color: statusColor }}>
                                    {statusLabel}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Circular Stats Card */}
                    <View className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                        <View className="flex-row justify-between items-center px-2">
                            <CircularProgress
                                value={attendanceStats.rate}
                                label="Attendance"
                                color={attendanceStats.rate >= 70 ? '#10b981' : attendanceStats.rate >= 40 ? '#f59e0b' : '#ef4444'}
                                showPercent={true}
                            />
                            <CircularProgress
                                value={performanceStats.count}
                                max={Math.max(performanceStats.count, 10)}
                                label="Assessments"
                                color={isDark ? '#38bdf8' : '#0ea5e9'}
                                showPercent={false}
                            />
                            <CircularProgress
                                value={performanceStats.score}
                                label="GPA Score"
                                color={isDark ? '#a855f7' : '#d946ef'}
                                showPercent={true}
                            />
                        </View>
                    </View>

                    {/* Unified Grid Menu Card */}
                    <View className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <View className="flex-row flex-wrap">
                            <GridItem
                                index={0} total={9}
                                title="Timetable"
                                icon={Clock}
                                color="#6366f1"
                                onPress={() => router.push({ pathname: '/child-timetable', params: { childId } })}
                            />
                            <GridItem
                                index={1} total={9}
                                title="Academics"
                                icon={Star}
                                color="#ea580c"
                                onPress={() => router.push({ pathname: '/child-academics', params: { childId } })}
                            />
                            <GridItem
                                index={2} total={9}
                                title="Attendance"
                                icon={Activity}
                                color="#10b981"
                                onPress={() => router.push({ pathname: '/child-attendance', params: { childId } })}
                            />
                            <GridItem
                                index={3} total={9}
                                title="Profile Info"
                                icon={User}
                                color="#3b82f6"
                                onPress={() => router.push({ pathname: '/child-info', params: { childId } })}
                            />
                            <GridItem
                                index={4} total={9}
                                title="Report Card"
                                icon={BookOpen}
                                color="#8b5cf6"
                                onPress={() => router.push({ pathname: '/child-report-card', params: { childId } })}
                            />
                            <GridItem
                                index={5} total={9}
                                title="Behaviour"
                                icon={GraduationCap}
                                color="#ec4899"
                                onPress={() => router.push({ pathname: '/child-behavior', params: { childId } })}
                            />
                            <GridItem
                                index={6} total={9}
                                title="Assignments"
                                icon={FileText}
                                color="#f59e0b"
                                onPress={() => router.push({ pathname: '/child-assignments', params: { childId } })}
                            />
                            <GridItem
                                index={7} total={9}
                                title="Teachers"
                                icon={Users}
                                color="#f97316"
                                onPress={() => router.push({ pathname: '/child-teachers', params: { childId } })}
                            />
                            <GridItem
                                index={8} total={9}
                                title="Messages"
                                icon={MessageSquare}
                                color="#0284c7"
                                onPress={() => router.push({ pathname: '/child-messages', params: { childId } })}
                            />
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}
