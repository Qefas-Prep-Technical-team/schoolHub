import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  ShieldCheck,
  BookOpen,
  Zap,
  Plus,
  Search,
  X,
  ChevronRight,
  Mail,
  Phone,
  Download,
  Filter,
  Check,
  UserX,
  TrendingUp,
  Activity,
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchBar } from '../../components/ui/SearchBar';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAdminTeachers } from '@/lib/api/hooks/useAdmin';
import { useMySchoolStats } from '@/lib/api/hooks/useSchool';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeacherFilters {
  status: '' | 'active' | 'pending';
  claimed: '' | 'true' | 'false';
}

interface NormalizedTeacher {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  teacherCode: string;
  subjects: string[];
  classes: string[];
  status: 'active' | 'pending';
  isClaimed: boolean;
}

// ─── Utility: normalize raw API teacher ──────────────────────────────────────

function normalizeTeacher(t: any): NormalizedTeacher {
  return {
    id: t.id,
    name: t.name || 'Unknown Teacher',
    email: t.email || 'No email',
    profileImage:
      t.profileImage ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name || 'T')}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40&fontWeight=900`,
    teacherCode: t.teacherCode || 'UNASSIGNED',
    subjects: t.teacherSubjects?.map((ts: any) => ts.subject?.name).filter(Boolean) || [],
    classes: t.classTeachers?.map((ct: any) => ct.class?.name).filter(Boolean) || [],
    status: t.verified ? 'active' : 'pending',
    isClaimed: !!t.isClaimed,
  };
}

// ─── Sub-component: Stats Ribbon ─────────────────────────────────────────────

function TeacherStatsRibbon({
  teachers,
  isLoading,
  isDark,
}: {
  teachers: NormalizedTeacher[];
  isLoading: boolean;
  isDark: boolean;
}) {
  const totalSubjects = useMemo(
    () => new Set(teachers.flatMap((t) => t.subjects)).size,
    [teachers]
  );
  const verifiedCount = teachers.filter((t) => t.status === 'active').length;
  const pendingCount = teachers.filter((t) => t.status === 'pending').length;
  const unclaimedCount = teachers.filter((t) => !t.isClaimed).length;

  const items = [
    {
      label: 'Total',
      value: teachers.length,
      icon: Users,
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.12)',
      border: 'rgba(37,99,235,0.25)',
      trend: 'All Staff',
    },
    {
      label: 'Verified',
      value: verifiedCount,
      icon: ShieldCheck,
      color: '#059669',
      bg: 'rgba(5,150,105,0.12)',
      border: 'rgba(5,150,105,0.25)',
      trend: '↑ Active',
    },
    {
      label: 'Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.12)',
      border: 'rgba(124,58,237,0.25)',
      trend: 'Covered',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Zap,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.12)',
      border: 'rgba(217,119,6,0.25)',
      trend: 'Review',
    },
    {
      label: 'Unclaimed',
      value: unclaimedCount,
      icon: UserX,
      color: '#e11d48',
      bg: 'rgba(225,29,72,0.12)',
      border: 'rgba(225,29,72,0.25)',
      trend: 'Action Req.',
    },
  ];

  if (isLoading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 28,
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 24 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 16, gap: 12 }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(15,23,42,0.85)'
                    : 'rgba(255,255,255,0.95)',
                  borderColor: isDark ? 'rgba(30,41,59,0.7)' : item.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View style={[styles.statGlow, { backgroundColor: item.color }]} />
              <View
                style={[
                  styles.statIconWrap,
                  { backgroundColor: item.bg, borderColor: item.border },
                ]}
              >
                <Icon size={18} color={item.color} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
                {item.value}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                {item.label}
              </Text>
              <View
                style={[
                  styles.trendChip,
                  { backgroundColor: 'rgba(16,185,129,0.12)' },
                ]}
              >
                <Text style={[styles.trendText, { color: '#10b981' }]}>{item.trend}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Sub-component: Teacher Card ─────────────────────────────────────────────

function TeacherCard({
  teacher,
  isDark,
  onResend,
}: {
  teacher: NormalizedTeacher;
  isDark: boolean;
  onResend: (id: string) => void;
}) {
  const router = useRouter();
  const isActive = teacher.status === 'active';

  return (
    <Pressable
      onPress={() => router.push(`/admin-teacher-detail?id=${teacher.id}` as any)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark
            ? 'rgba(15,23,42,0.9)'
            : 'rgba(255,255,255,0.98)',
          borderColor: isDark ? 'rgba(30,41,59,0.7)' : '#f1f5f9',
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      {/* Corner glow */}
      <View
        style={[
          styles.cardGlow,
          { backgroundColor: isActive ? '#059669' : '#d97706' },
        ]}
      />

      {/* Top row: avatar + status badge */}
      <View style={styles.cardTopRow}>
        {/* Avatar */}
        <View
          style={[
            styles.avatarWrap,
            {
              borderColor: isActive ? 'rgba(5,150,105,0.3)' : 'rgba(217,119,6,0.3)',
              shadowColor: isActive ? '#059669' : '#d97706',
            },
          ]}
        >
          <Image
            source={{ uri: teacher.profileImage }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          {/* Online dot */}
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isActive ? '#10b981' : '#f59e0b',
                borderColor: isDark ? '#0f172a' : '#fff',
              },
            ]}
          />
        </View>

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isActive
                ? 'rgba(5,150,105,0.1)'
                : 'rgba(217,119,6,0.1)',
              borderColor: isActive
                ? 'rgba(5,150,105,0.25)'
                : 'rgba(217,119,6,0.25)',
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: isActive ? '#059669' : '#d97706' },
            ]}
          >
            {isActive ? 'VERIFIED' : 'PENDING'}
          </Text>
        </View>
      </View>

      {/* Name & email */}
      <Text
        style={[styles.cardName, { color: isDark ? '#f1f5f9' : '#0f172a' }]}
        numberOfLines={1}
      >
        {teacher.name}
      </Text>
      <Text style={styles.cardEmail} numberOfLines={1}>
        {teacher.email}
      </Text>

      {/* Teacher code */}
      <View
        style={[
          styles.codeChip,
          {
            backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : '#f8fafc',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          },
        ]}
      >
        <Text
          style={[
            styles.codeText,
            { color: isDark ? '#94a3b8' : '#475569' },
          ]}
        >
          ID: {teacher.teacherCode}
        </Text>
      </View>

      {/* Subjects */}
      {teacher.subjects.length > 0 && (
        <View style={styles.subjectsRow}>
          {teacher.subjects.slice(0, 2).map((s, i) => (
            <View
              key={i}
              style={[
                styles.subjectPill,
                {
                  backgroundColor: 'rgba(37,99,235,0.08)',
                  borderColor: 'rgba(37,99,235,0.2)',
                },
              ]}
            >
              <Text style={styles.subjectText} numberOfLines={1}>
                {s}
              </Text>
            </View>
          ))}
          {teacher.subjects.length > 2 && (
            <View
              style={[
                styles.subjectPill,
                { backgroundColor: 'rgba(100,116,139,0.08)', borderColor: '#e2e8f0' },
              ]}
            >
              <Text style={[styles.subjectText, { color: '#64748b' }]}>
                +{teacher.subjects.length - 2}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Classes count */}
      {teacher.classes.length > 0 && (
        <View style={styles.classRow}>
          <BookOpen size={11} color={isDark ? '#475569' : '#94a3b8'} />
          <Text style={[styles.classText, { color: isDark ? '#475569' : '#94a3b8' }]}>
            {teacher.classes.length} class{teacher.classes.length !== 1 ? 'es' : ''}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View
        style={[
          styles.cardFooter,
          { borderTopColor: isDark ? 'rgba(30,41,59,0.5)' : '#f1f5f9' },
        ]}
      >
        {/* Resend invite for unclaimed pending */}
        {teacher.status === 'pending' && !teacher.isClaimed ? (
          <TouchableOpacity
            onPress={() => onResend(teacher.id)}
            style={styles.resendBtn}
            activeOpacity={0.8}
          >
            <Mail size={13} color="#d97706" />
            <Text style={styles.resendText}>Resend Invite</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resendPlaceholder} />
        )}

        <View style={styles.arrowWrap}>
          <ChevronRight size={16} color={isDark ? '#334155' : '#cbd5e1'} />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Sub-component: Filters Sheet ────────────────────────────────────────────

function FiltersSheet({
  visible,
  onClose,
  isDark,
  filters,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  filters: TeacherFilters;
  onApply: (f: TeacherFilters) => void;
}) {
  const [local, setLocal] = useState(filters);

  const renderGroup = (
    title: string,
    options: { label: string; value: string }[],
    key: keyof TeacherFilters
  ) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={[
          styles.filterGroupTitle,
          { color: isDark ? '#f1f5f9' : '#0f172a' },
        ]}
      >
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const active = local[key] === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setLocal({ ...local, [key]: opt.value })}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active
                    ? '#2563eb'
                    : isDark
                    ? 'rgba(30,41,59,0.8)'
                    : '#fff',
                  borderColor: active ? '#2563eb' : isDark ? '#1e293b' : '#e2e8f0',
                },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: active ? '#fff' : isDark ? '#94a3b8' : '#475569' },
                ]}
              >
                {opt.label}
              </Text>
              {active && <Check size={13} color="#fff" style={{ marginLeft: 5 }} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.filterSheet,
                { backgroundColor: isDark ? '#0f172a' : '#fff' },
              ]}
            >
              <View style={styles.filterSheetHeader}>
                <View style={styles.filterSheetHandle} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Filter size={20} color={isDark ? '#f1f5f9' : '#0f172a'} />
                  <Text
                    style={[
                      styles.filterSheetTitle,
                      { color: isDark ? '#f1f5f9' : '#0f172a' },
                    ]}
                  >
                    Filter Teachers
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.filterCloseBtn,
                    { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                  ]}
                >
                  <X size={18} color={isDark ? '#94a3b8' : '#475569'} />
                </TouchableOpacity>
              </View>

              {renderGroup('Status', [
                { label: 'All', value: '' },
                { label: 'Verified', value: 'active' },
                { label: 'Pending', value: 'pending' },
              ], 'status')}

              {renderGroup('Account Claimed', [
                { label: 'All', value: '' },
                { label: 'Claimed', value: 'true' },
                { label: 'Unclaimed', value: 'false' },
              ], 'claimed')}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    const reset: TeacherFilters = { status: '', claimed: '' };
                    setLocal(reset);
                    onApply(reset);
                    onClose();
                  }}
                  style={[
                    styles.filterActionBtn,
                    {
                      flex: 1,
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterActionBtnText,
                      { color: isDark ? '#94a3b8' : '#475569' },
                    ]}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { onApply(local); onClose(); }}
                  style={[styles.filterActionBtn, { flex: 2, backgroundColor: '#2563eb' }]}
                >
                  <Text style={[styles.filterActionBtnText, { color: '#fff' }]}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AdminTeachersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<TeacherFilters>({ status: '', claimed: '' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(h);
  }, [searchTerm]);

  // Auth user for schoolId
  const { data: user } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data.data;
    },
  });
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;

  const { data: rawTeachers, isLoading, isError, refetch } = useAdminTeachers(schoolId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Normalize & filter
  const allTeachers = useMemo<NormalizedTeacher[]>(
    () => (rawTeachers ?? []).map(normalizeTeacher),
    [rawTeachers]
  );

  const filtered = useMemo(() => {
    return allTeachers.filter((t) => {
      const matchesSearch =
        !debouncedSearch ||
        t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.teacherCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.subjects.some((s) => s.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesStatus = !activeFilters.status || t.status === activeFilters.status;
      const matchesClaimed =
        !activeFilters.claimed ||
        (activeFilters.claimed === 'true' ? t.isClaimed : !t.isClaimed);
      return matchesSearch && matchesStatus && matchesClaimed;
    });
  }, [allTeachers, debouncedSearch, activeFilters]);

  const hasActiveFilters = !!(activeFilters.status || activeFilters.claimed);

  const handleResend = async (teacherId: string) => {
    try {
      await apiClient.post(`/admin/teachers/${teacherId}/resend-claim-email`);
      Alert.alert('Success', 'Invite email has been resent.');
    } catch {
      Alert.alert('Error', 'Failed to resend invite email.');
    }
  };

  const handleExportCSV = async () => {
    if (filtered.length === 0) {
      Alert.alert('No data', 'No teachers to export.');
      return;
    }
    try {
      const headers = ['Name', 'Email', 'Teacher ID', 'Subjects', 'Classes', 'Status'];
      const rows = filtered.map((t) =>
        [
          `"${t.name}"`,
          `"${t.email}"`,
          `"${t.teacherCode}"`,
          `"${t.subjects.join('; ')}"`,
          `"${t.classes.join('; ')}"`,
          `"${t.status}"`,
        ].join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      // @ts-ignore
      const fileUri = `${FileSystem.documentDirectory}teachers_${new Date().toISOString().split('T')[0]}.csv`;
      // @ts-ignore
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sharing unavailable', 'Cannot share file on this device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to generate CSV.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#020817' : '#f0f4f8' }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <View style={styles.overlineRow}>
              <View style={[styles.overlineDot, { backgroundColor: '#2563eb' }]} />
              <Text style={[styles.overlineText, { color: isDark ? '#475569' : '#94a3b8' }]}>
                Faculty Management
              </Text>
            </View>
            <Text style={[styles.titleText, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              Teachers<Text style={{ color: '#2563eb' }}>.</Text>
            </Text>
          </View>

          {/* Add teacher CTA */}
          <TouchableOpacity
            onPress={() => router.push('/admin-add-teacher' as any)}
            style={styles.addBtn}
            activeOpacity={0.85}
          >
            <Plus size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110, paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          {/* ─── Stats ribbon ──────────────────────────────────────────────── */}
          <TeacherStatsRibbon
            teachers={allTeachers}
            isLoading={isLoading}
            isDark={isDark}
          />

          {/* ─── Search + filter bar ───────────────────────────────────────── */}
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                placeholder="Search by name, email or code..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {/* Filter btn */}
            <TouchableOpacity
              onPress={() => setFiltersVisible(true)}
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: hasActiveFilters
                    ? 'rgba(37,99,235,0.08)'
                    : isDark
                    ? 'rgba(15,23,42,0.8)'
                    : '#fff',
                  borderColor: hasActiveFilters
                    ? 'rgba(37,99,235,0.3)'
                    : isDark
                    ? '#1e293b'
                    : '#e2e8f0',
                },
              ]}
            >
              <Filter
                size={18}
                color={hasActiveFilters ? '#2563eb' : isDark ? '#64748b' : '#94a3b8'}
              />
              {hasActiveFilters && <View style={styles.filterActiveDot} />}
            </TouchableOpacity>

            {/* Export btn */}
            <TouchableOpacity
              onPress={handleExportCSV}
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: isDark ? 'rgba(15,23,42,0.8)' : '#fff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                },
              ]}
            >
              <Download size={18} color={isDark ? '#64748b' : '#94a3b8'} />
            </TouchableOpacity>
          </View>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersRow}>
              {activeFilters.status ? (
                <TouchableOpacity
                  onPress={() => setActiveFilters({ ...activeFilters, status: '' })}
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterChipText}>
                    {activeFilters.status === 'active' ? 'Verified' : 'Pending'}
                  </Text>
                  <X size={11} color="#2563eb" />
                </TouchableOpacity>
              ) : null}
              {activeFilters.claimed ? (
                <TouchableOpacity
                  onPress={() => setActiveFilters({ ...activeFilters, claimed: '' })}
                  style={styles.activeFilterChip}
                >
                  <Text style={styles.activeFilterChipText}>
                    {activeFilters.claimed === 'true' ? 'Claimed' : 'Unclaimed'}
                  </Text>
                  <X size={11} color="#2563eb" />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => setActiveFilters({ status: '', claimed: '' })}
                style={[styles.activeFilterChip, { backgroundColor: 'rgba(225,29,72,0.08)', borderColor: 'rgba(225,29,72,0.2)' }]}
              >
                <Text style={[styles.activeFilterChipText, { color: '#e11d48' }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results count */}
          {!isLoading && (
            <View style={styles.resultsRow}>
              <Text style={[styles.resultsText, { color: isDark ? '#475569' : '#94a3b8' }]}>
                {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}
                {debouncedSearch ? ` for "${debouncedSearch}"` : ''}
              </Text>
            </View>
          )}

          {/* ─── Teacher cards ──────────────────────────────────────────────── */}
          {isLoading ? (
            // Skeleton
            <View style={styles.cardsGrid}>
              {[1, 2, 3, 4].map((k) => (
                <View
                  key={k}
                  style={[
                    styles.skeletonCard,
                    { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
                  ]}
                />
              ))}
            </View>
          ) : isError ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.emptyIcon, { backgroundColor: 'rgba(225,29,72,0.08)' }]}>
                <TrendingUp size={28} color="#e11d48" />
              </View>
              <Text style={[styles.emptyTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
                Failed to load
              </Text>
              <Text style={[styles.emptyDesc, { color: isDark ? '#475569' : '#94a3b8' }]}>
                Check your connection and pull to refresh.
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.emptyIcon, { backgroundColor: 'rgba(37,99,235,0.08)' }]}>
                <Users size={28} color="#2563eb" />
              </View>
              <Text style={[styles.emptyTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
                {debouncedSearch || hasActiveFilters ? 'No results found' : 'No teachers yet'}
              </Text>
              <Text style={[styles.emptyDesc, { color: isDark ? '#475569' : '#94a3b8' }]}>
                {debouncedSearch || hasActiveFilters
                  ? 'Try different search terms or clear filters.'
                  : 'Add your first teacher to get started.'}
              </Text>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filtered.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  isDark={isDark}
                  onResend={handleResend}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ─── Filters Sheet ───────────────────────────────────────────────────── */}
      <FiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        isDark={isDark}
        filters={activeFilters}
        onApply={setActiveFilters}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  overlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  overlineDot: { width: 6, height: 6, borderRadius: 3 },
  overlineText: {
    fontFamily: 'LexendBlack',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleText: {
    fontFamily: 'LexendBlack',
    fontSize: 42,
    letterSpacing: -1.5,
    textTransform: 'uppercase',
    lineHeight: 44,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  // Stat cards
  statCard: {
    width: 120,
    borderRadius: 28,
    padding: 14,
    borderWidth: 1,
    gap: 5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statGlow: {
    position: 'absolute',
    right: -18,
    top: -18,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.08,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'LexendBlack',
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statLabel: {
    fontFamily: 'LexendBold',
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trendChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: 4,
  },
  trendText: {
    fontFamily: 'LexendBold',
    fontSize: 8,
    letterSpacing: 0.3,
  },
  // Search row
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  // Active filter chips
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderColor: 'rgba(37,99,235,0.2)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  activeFilterChipText: {
    fontFamily: 'LexendBold',
    fontSize: 11,
    color: '#2563eb',
  },
  resultsRow: { marginBottom: 16 },
  resultsText: {
    fontFamily: 'LexendBold',
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // Cards grid - 2 column
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonCard: {
    width: '47%',
    height: 240,
    borderRadius: 28,
  },
  // Teacher card
  card: {
    width: '47%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 6,
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.07,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: 'LexendBlack',
    fontSize: 7,
    letterSpacing: 1,
  },
  cardName: {
    fontFamily: 'LexendBold',
    fontSize: 13,
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  cardEmail: {
    fontFamily: 'Lexend',
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 0.1,
  },
  codeChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  codeText: {
    fontFamily: 'LexendBold',
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  subjectPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 80,
  },
  subjectText: {
    fontFamily: 'LexendBold',
    fontSize: 8,
    color: '#2563eb',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  classText: {
    fontFamily: 'LexendBold',
    fontSize: 9,
    letterSpacing: 0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 10,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217,119,6,0.1)',
    borderColor: 'rgba(217,119,6,0.2)',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 100,
  },
  resendText: {
    fontFamily: 'LexendBold',
    fontSize: 9,
    color: '#d97706',
    letterSpacing: 0.3,
  },
  resendPlaceholder: { width: 1 },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100,116,139,0.07)',
  },
  // Empty state
  emptyState: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: 'LexendBlack',
    fontSize: 16,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Lexend',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 220,
  },
  // Filters sheet
  filterSheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 40,
  },
  filterSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  filterSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  filterSheetTitle: {
    fontFamily: 'LexendBold',
    fontSize: 18,
  },
  filterCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterGroupTitle: {
    fontFamily: 'LexendBold',
    fontSize: 13,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterPillText: {
    fontFamily: 'LexendBold',
    fontSize: 12,
  },
  filterActionBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActionBtnText: {
    fontFamily: 'LexendBold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
