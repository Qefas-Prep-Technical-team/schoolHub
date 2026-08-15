import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  InteractionManager,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { useMySchoolStats, useMyPerformanceAnalysis } from '@/lib/api/hooks/useSchool';
import { AdminHero } from '../../components/admin-dashboard/AdminHero';
import { AdminInsights } from '../../components/admin-dashboard/AdminInsights';
import { QuickActions } from '../../components/admin-dashboard/QuickActions';
import { SchoolPerformance } from '../../components/admin-dashboard/SchoolPerformance';
import { TodayAttendanceChart } from '../../components/admin-dashboard/TodayAttendanceChart';
import { AcademicPerformanceChart } from '../../components/admin-dashboard/AcademicPerformanceChart';
import { ExamStatus } from '../../components/admin-dashboard/ExamStatus';
import { StaffInsights } from '../../components/admin-dashboard/StaffInsights';
import { UsageLimitsCard } from '../../components/admin-dashboard/UsageLimitsCard';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNetwork } from '@/hooks/use-network';
import { useAuthUser } from '@/lib/api/hooks/useAuth';

export default function AdminHomeScreen() {
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useMySchoolStats();
  const { data: analysisData, isLoading: isAnalysisLoading, refetch: refetchAnalysis } = useMyPerformanceAnalysis();
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isConnected } = useNetwork();

  const isLoading = isStatsLoading && !stats;
  const analysis = analysisData?.data || analysisData;

  // Shared hook with staleTime: Infinity — auth user never goes stale mid-session.
  // Replaces the previous inline useQuery which had staleTime: 0 and re-fetched on every focus.
  const { data: user } = useAuthUser();
  const adminFirstName = user?.name?.split(' ')[0] || 'Admin';

  const onRefresh = useCallback(async () => {
    if (!isConnected) return;
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchAnalysis()]);
    setRefreshing(false);
  }, [refetchStats, refetchAnalysis, isConnected]);

  // Defer refetches until after navigation animations settle
  useFocusEffect(
    useCallback(() => {
      if (!isConnected) return;
      const task = InteractionManager.runAfterInteractions(() => {
        refetchStats();
        refetchAnalysis();
      });
      return () => task.cancel();
    }, [refetchStats, refetchAnalysis, isConnected])
  );

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#020817' : '#f0f4f8' }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              enabled={isConnected !== false}
              tintColor={isDark ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
          <View style={styles.topBar}>
            {/* Left: Avatar + Greeting */}
            <TouchableOpacity
              onPress={() => router.push('/admin-profile')}
              style={styles.profileRow}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.avatarRing,
                  { borderColor: isDark ? '#1e3a5f' : '#bfdbfe' },
                ]}
              >
                <Image
                  source={{
                    uri:
                      user?.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/png?seed=${adminFirstName}`,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.greetName,
                    { color: isDark ? '#f1f5f9' : '#0f172a' },
                  ]}
                >
                  {adminFirstName}
                </Text>
                <View style={styles.onlineRow}>
                  {isConnected !== false ? (
                    <Wifi size={10} color="#10b981" strokeWidth={2.5} />
                  ) : (
                    <WifiOff size={10} color="#ef4444" strokeWidth={2.5} />
                  )}
                  <Text
                    style={[
                      styles.onlineText,
                      { color: isConnected !== false ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {isConnected !== false ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Right: Search + Bell */}
            <View style={styles.rightActions}>
              <Pressable
                onPress={() => router.push('/admin-search' as any)}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Search size={18} color={isDark ? '#94a3b8' : '#475569'} />
              </Pressable>

              <Pressable
                onPress={() => router.push('/notifications')}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Bell size={18} color={isDark ? '#94a3b8' : '#475569'} />
                {/* Unread dot */}
                <View style={styles.notifDot} />
              </Pressable>
            </View>
          </View>

          {/* ─── Offline Banner ────────────────────────────────────────────── */}
          {isConnected === false && (
            <View style={styles.offlineBanner}>
              <WifiOff size={14} color="#ef4444" />
              <Text style={styles.offlineText}>
                You're offline — showing cached data
              </Text>
            </View>
          )}

          {/* ─── Hero Card ─────────────────────────────────────────────────── */}
          <AdminHero schoolName="Admin Console" />

          {/* ─── Metrics Ribbon ────────────────────────────────────────────── */}
          <AdminInsights stats={stats} isLoading={isLoading} />

          {/* ─── Quick Actions Grid ─────────────────────────────────────────── */}
          <QuickActions />

          {/* ─── Section divider ────────────────────────────────────────────── */}
          <SectionDivider label="Performance" isDark={isDark} />

          {/* ─── School Performance ─────────────────────────────────────────── */}
          <SchoolPerformance
            analysis={analysis}
            isLoading={isAnalysisLoading}
            hasPerformanceAccess={true}
          />

          {/* ─── Section divider ────────────────────────────────────────────── */}
          <SectionDivider label="Attendance & Exams" isDark={isDark} />

          <TodayAttendanceChart
            onNavigate={() => router.push('/(admin-tabs)/classes')}
          />
          <ExamStatus />

          {/* ─── Section divider ────────────────────────────────────────────── */}
          <SectionDivider label="Analytics" isDark={isDark} />

          <AcademicPerformanceChart stats={stats} />

          {/* ─── Section divider ────────────────────────────────────────────── */}
          <SectionDivider label="Staff" isDark={isDark} />

          <StaffInsights />
          <UsageLimitsCard />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Helper sub-component ──────────────────────────────────────────────────────
function SectionDivider({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <View style={sectionStyles.row}>
      <View
        style={[
          sectionStyles.line,
          { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
        ]}
      />
      <Text
        style={[
          sectionStyles.label,
          { color: isDark ? '#475569' : '#94a3b8' },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          sectionStyles.line,
          { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 2,
  },
  greetName: {
    fontFamily: 'LexendBlack',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  onlineText: {
    fontFamily: 'LexendBold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  // Offline
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  offlineText: {
    fontFamily: 'LexendBold',
    fontSize: 12,
    color: '#ef4444',
  },
});

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    fontFamily: 'LexendBlack',
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});
