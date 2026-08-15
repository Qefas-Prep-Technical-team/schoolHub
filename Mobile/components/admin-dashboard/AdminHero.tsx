import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileBarChart2, Zap, ArrowUpRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdminHeroProps {
  schoolName: string;
}

export const AdminHero = ({ schoolName }: AdminHeroProps) => {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let termStr = 'Fall Term';
  if (currentMonth >= 0 && currentMonth < 4) termStr = 'Spring Term';
  else if (currentMonth >= 4 && currentMonth < 8) termStr = 'Summer Term';
  const activeSessionStr = `${termStr} ${currentYear}`;

  const now = new Date();
  const hours = now.getHours();
  const greeting =
    hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    // Pulse the live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide in content
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#0a0f1e', '#0d1f3c', '#112244']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative rings */}
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring3]} />

        {/* Glow orb */}
        <View style={styles.glowOrb} />

        {/* Top row: greeting + date */}
        <Animated.View
          style={[
            styles.topRow,
            {
              opacity: slideAnim,
              transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <View style={styles.greetingChip}>
            <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.greetingChipText}>{greeting}</Text>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{dayName}, {dateStr}</Text>
          </View>
        </Animated.View>

        {/* Main title block */}
        <Animated.View
          style={[
            styles.titleBlock,
            {
              opacity: slideAnim,
              transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
          <View style={styles.iconRow}>
            <View style={styles.iconBadge}>
              <FileBarChart2 size={18} color="#60a5fa" strokeWidth={2.5} />
            </View>
            <Text style={styles.overlineText}>Admin Console</Text>
          </View>

          <Text style={styles.titleText}>
            School{'\n'}
            <Text style={styles.titleAccent}>Overview</Text>
          </Text>
        </Animated.View>

        {/* Bottom row: term badge + CTA */}
        <Animated.View
          style={[
            styles.bottomRow,
            {
              opacity: slideAnim,
              transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.termBadge}>
            <Zap size={11} color="#38bdf8" fill="#38bdf8" />
            <Text style={styles.termText}>{activeSessionStr}</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(admin-tabs)/reports' as any)}
            style={styles.ctaButton}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>View Reports</Text>
            <ArrowUpRight size={14} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    minHeight: 220,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  // Decorative rings
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.12)',
  },
  ring1: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  ring2: {
    width: 160,
    height: 160,
    top: -40,
    right: -20,
    borderColor: 'rgba(96, 165, 250, 0.07)',
  },
  ring3: {
    width: 300,
    height: 300,
    bottom: -120,
    left: -80,
    borderColor: 'rgba(59, 130, 246, 0.06)',
  },
  glowOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#2563eb',
    opacity: 0.18,
    top: -60,
    right: -40,
  },
  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  greetingChipText: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'LexendBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dateBadge: {
    backgroundColor: 'rgba(37,99,235,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
  },
  dateBadgeText: {
    color: '#93c5fd',
    fontFamily: 'LexendBold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  // Title
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  overlineText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'LexendBlack',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleText: {
    color: '#ffffff',
    fontFamily: 'LexendBlack',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  titleAccent: {
    color: '#60a5fa',
  },
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  termBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  termText: {
    color: '#38bdf8',
    fontFamily: 'LexendBold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaText: {
    color: '#ffffff',
    fontFamily: 'LexendBold',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
