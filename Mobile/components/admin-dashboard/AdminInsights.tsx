import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileText,
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatsProps {
  students?: number;
  teachers?: number;
  classes?: number;
  exams?: number;
  subjects?: number;
}

interface AdminInsightsProps {
  stats?: StatsProps | null;
  isLoading: boolean;
  primaryColor?: string;
}

export const AdminInsights = ({
  stats,
  isLoading,
  primaryColor = '#2563eb',
}: AdminInsightsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const metrics = [
    {
      label: 'Students',
      value: stats?.students?.toLocaleString() ?? '0',
      icon: Users,
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.12)',
      border: 'rgba(37, 99, 235, 0.25)',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Teachers',
      value: stats?.teachers?.toLocaleString() ?? '0',
      icon: GraduationCap,
      color: primaryColor,
      bg: `${primaryColor}18`,
      border: `${primaryColor}30`,
      trend: 'Stable',
      trendUp: true,
    },
    {
      label: 'Classes',
      value: stats?.classes?.toLocaleString() ?? '0',
      icon: Building2,
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.25)',
      trend: 'Active',
      trendUp: true,
    },
    {
      label: 'Subjects',
      value: stats?.subjects?.toLocaleString() ?? '0',
      icon: BookOpen,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.12)',
      border: 'rgba(5, 150, 105, 0.25)',
      trend: 'Live',
      trendUp: true,
    },
    {
      label: 'Attendance',
      value: '98%',
      icon: CalendarCheck,
      color: '#e11d48',
      bg: 'rgba(225, 29, 72, 0.12)',
      border: 'rgba(225, 29, 72, 0.25)',
      trend: '↑ Good',
      trendUp: true,
    },
    {
      label: 'Exams',
      value: stats?.exams?.toLocaleString() ?? '0',
      icon: FileText,
      color: '#9333ea',
      bg: 'rgba(147, 51, 234, 0.12)',
      border: 'rgba(147, 51, 234, 0.25)',
      trend: 'Scheduled',
      trendUp: false,
    },
  ];

  if (isLoading) {
    return (
      <View style={{ marginBottom: 28 }}>
        {/* Section header skeleton */}
        <View
          style={{
            width: 120,
            height: 14,
            borderRadius: 8,
            backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
            marginBottom: 16,
            marginHorizontal: 4,
          }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={{
                  width: 130,
                  height: 128,
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
    <View style={{ marginBottom: 28 }}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: primaryColor }]} />
        <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          School Metrics
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 16, gap: 12 }}
      >
        {metrics.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
                  borderColor: isDark ? 'rgba(30,41,59,0.7)' : stat.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              {/* Glow */}
              <View style={[styles.cardGlow, { backgroundColor: stat.color }]} />

              {/* Icon pill */}
              <View
                style={[
                  styles.iconPill,
                  {
                    backgroundColor: stat.bg,
                    borderColor: stat.border,
                  },
                ]}
              >
                <Icon size={20} color={stat.color} strokeWidth={2} />
              </View>

              {/* Value */}
              <Text
                style={[
                  styles.cardValue,
                  { color: isDark ? '#f1f5f9' : '#0f172a' },
                ]}
              >
                {stat.value}
              </Text>

              {/* Label */}
              <Text
                style={[
                  styles.cardLabel,
                  { color: isDark ? '#64748b' : '#94a3b8' },
                ]}
              >
                {stat.label}
              </Text>

              {/* Trend chip */}
              <View
                style={[
                  styles.trendChip,
                  {
                    backgroundColor: stat.trendUp
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(99, 102, 241, 0.12)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.trendText,
                    { color: stat.trendUp ? '#10b981' : '#6366f1' },
                  ]}
                >
                  {stat.trend}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionLabel: {
    fontFamily: 'LexendBlack',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    width: 130,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    gap: 6,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardGlow: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.07,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: 'LexendBlack',
    fontSize: 24,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  cardLabel: {
    fontFamily: 'LexendBold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trendChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: 4,
  },
  trendText: {
    fontFamily: 'LexendBold',
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
