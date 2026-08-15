import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  UserPlus,
  PlusCircle,
  CreditCard,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export const QuickActions = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const actions = [
    {
      label: 'Add Student',
      subtitle: 'Register enrollment',
      stat: '+12 Week',
      icon: UserPlus,
      gradientColors: ['#92400e', '#b45309'] as const,
      accent: '#f59e0b',
      route: '/(admin-tabs)/students/add',
    },
    {
      label: 'New Class',
      subtitle: 'Create classroom',
      stat: '24 Total',
      icon: PlusCircle,
      gradientColors: ['#4c1d95', '#6d28d9'] as const,
      accent: '#a78bfa',
      route: '/(admin-tabs)/classes/new',
    },
    {
      label: 'Billing',
      subtitle: 'Fee collections',
      stat: 'Active',
      icon: CreditCard,
      gradientColors: ['#064e3b', '#065f46'] as const,
      accent: '#34d399',
      route: '/(admin-tabs)/billing',
    },
    {
      label: 'Grades',
      subtitle: 'Student results',
      stat: 'View All',
      icon: FileText,
      gradientColors: ['#0c4a6e', '#075985'] as const,
      accent: '#38bdf8',
      route: '/(admin-tabs)/grades',
    },
    {
      label: 'Settings',
      subtitle: 'System config',
      stat: 'Manage',
      icon: Settings,
      gradientColors: isDark ? (['#0f172a', '#1e293b'] as const) : (['#e2e8f0', '#cbd5e1'] as const),
      accent: '#64748b',
      route: '/(admin-tabs)/settings',
    },
    {
      label: 'More',
      subtitle: 'All actions',
      stat: 'Browse',
      icon: ChevronRight,
      gradientColors: isDark ? (['#0f172a', '#1e293b'] as const) : (['#eff6ff', '#dbeafe'] as const),
      accent: '#2563eb',
      route: '/admin-quick-actions',
    },
  ];

  return (
    <View style={{ marginBottom: 28 }}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: '#2563eb' }]} />
        <Text
          style={[
            styles.sectionLabel,
            { color: isDark ? '#94a3b8' : '#64748b' },
          ]}
        >
          Quick Actions
        </Text>
      </View>

      {/* 2×3 grid */}
      <View style={styles.grid}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.cell,
                {
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              onPress={() => {
                if (action.route) router.push(action.route as any);
              }}
            >
              <LinearGradient
                colors={action.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cellGradient}
              >
                {/* Corner glow */}
                <View
                  style={[styles.cornerGlow, { backgroundColor: action.accent }]}
                />

                {/* Icon ring */}
                <View
                  style={[
                    styles.iconRing,
                    {
                      borderColor: `${action.accent}40`,
                      backgroundColor: `${action.accent}20`,
                    },
                  ]}
                >
                  <Icon size={22} color={action.accent} strokeWidth={2} />
                </View>

                {/* Text */}
                <Text style={styles.cellLabel} numberOfLines={1}>
                  {action.label}
                </Text>
                <Text
                  style={[styles.cellSubtitle, { color: 'rgba(255,255,255,0.5)' }]}
                  numberOfLines={1}
                >
                  {action.subtitle}
                </Text>

                {/* Stat pill */}
                <View
                  style={[
                    styles.statPill,
                    { backgroundColor: `${action.accent}25`, borderColor: `${action.accent}30` },
                  ]}
                >
                  <Text style={[styles.statText, { color: action.accent }]}>
                    {action.stat}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    width: '47%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  cellGradient: {
    padding: 18,
    minHeight: 148,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  cornerGlow: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.25,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cellLabel: {
    fontFamily: 'LexendBold',
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  cellSubtitle: {
    fontFamily: 'Lexend',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  statPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  statText: {
    fontFamily: 'LexendBold',
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
