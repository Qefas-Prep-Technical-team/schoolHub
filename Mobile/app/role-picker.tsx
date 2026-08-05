import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { setUserRole } from '../lib/auth/secure-store';
import { GraduationCap, BookOpen, Users, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── Role definitions — mirrors the colour system across login / signup / welcome ───

const roles: Array<{
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  // Gradient for the button and selected ring
  gradient: readonly [string, string];
  // Icon badge background (light)
  iconBgLight: string;
  // Icon badge background (dark)
  iconBgDark: string;
  // Icon colour
  iconColor: string;
  // Card selected border colour
  borderSelected: string;
  // Card selected tint background (light)
  cardBgSelectedLight: string;
  // Card selected tint background (dark)
  cardBgSelectedDark: string;
}> = [
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Manage assignments, exams & grades',
    icon: GraduationCap,
    gradient: ['#ec4899', '#9d174d'],
    iconBgLight: '#fce7f3',
    iconBgDark: '#500724',
    iconColor: '#db2777',
    borderSelected: '#ec4899',
    cardBgSelectedLight: '#fdf2f8',
    cardBgSelectedDark: '#2d0a1e',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    subtitle: 'Manage classes, content & students',
    icon: BookOpen,
    gradient: ['#10b981', '#065f46'],
    iconBgLight: '#d1fae5',
    iconBgDark: '#064e3b',
    iconColor: '#059669',
    borderSelected: '#10b981',
    cardBgSelectedLight: '#f0fdf4',
    cardBgSelectedDark: '#052e16',
  },
  {
    id: 'parent',
    title: 'Parent',
    subtitle: "Track your child's progress & activities",
    icon: Users,
    gradient: ['#f97316', '#9a3412'],
    iconBgLight: '#ffedd5',
    iconBgDark: '#7c2d12',
    iconColor: '#ea580c',
    borderSelected: '#f97316',
    cardBgSelectedLight: '#fff7ed',
    cardBgSelectedDark: '#431407',
  },
  {
    id: 'admin',
    title: 'School Admin',
    subtitle: 'Oversee school operations & settings',
    icon: ShieldCheck,
    gradient: ['#3b82f6', '#1e3a8a'],
    iconBgLight: '#dbeafe',
    iconBgDark: '#1e3a8a',
    iconColor: '#2563eb',
    borderSelected: '#3b82f6',
    cardBgSelectedLight: '#eff6ff',
    cardBgSelectedDark: '#172554',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RolePicker() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animated scale for card press feedback
  const scaleAnims = useRef(roles.map(() => new Animated.Value(1))).current;

  const handlePress = (id: string, index: number) => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setSelectedRole(id);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    await setUserRole(selectedRole);
    router.replace('/(auth)/welcome');
  };

  const activeRole = roles.find(r => r.id === selectedRole);
  const btnGradient: readonly [string, string] = activeRole?.gradient ?? ['#64748b', '#334155'];

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}>

          {/* ── Header ── */}
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <Image
              source={require('../assets/images/icon.png')}
              style={{ width: 72, height: 72, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{
              fontFamily: 'LexendBold',
              fontSize: 30,
              color: isDark ? '#ffffff' : '#0f172a',
              textAlign: 'center',
              letterSpacing: -0.5,
              marginBottom: 8,
            }}>
              Welcome to QefasHub
            </Text>
            <Text style={{
              fontFamily: 'Lexend',
              fontSize: 15,
              color: isDark ? '#94a3b8' : '#64748b',
              textAlign: 'center',
              lineHeight: 22,
              paddingHorizontal: 16,
            }}>
              Select your role to get started
            </Text>
          </View>

          {/* ── Role Cards ── */}
          <View style={{ gap: 12, marginBottom: 32 }}>
            {roles.map((role, index) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              const cardBg = isSelected
                ? (isDark ? role.cardBgSelectedDark : role.cardBgSelectedLight)
                : (isDark ? '#0f172a' : '#ffffff');

              const borderColor = isSelected
                ? role.borderSelected
                : (isDark ? '#1e293b' : '#e2e8f0');

              const iconBg = isDark ? role.iconBgDark : role.iconBgLight;

              return (
                <Animated.View key={role.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => handlePress(role.id, index)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 18,
                      borderRadius: 24,
                      borderWidth: isSelected ? 2 : 1.5,
                      borderColor,
                      backgroundColor: cardBg,
                      // Glow shadow when selected
                      shadowColor: isSelected ? role.borderSelected : '#000',
                      shadowOffset: { width: 0, height: isSelected ? 8 : 2 },
                      shadowOpacity: isSelected ? 0.25 : 0.06,
                      shadowRadius: isSelected ? 20 : 6,
                      elevation: isSelected ? 8 : 2,
                    }}
                  >
                    {/* Icon badge */}
                    <View style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      backgroundColor: iconBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                      flexShrink: 0,
                    }}>
                      <Icon size={26} color={role.iconColor} />
                    </View>

                    {/* Text */}
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontFamily: 'LexendBold',
                        fontSize: 16,
                        color: isSelected ? role.borderSelected : (isDark ? '#ffffff' : '#0f172a'),
                        marginBottom: 3,
                      }}>
                        {role.title}
                      </Text>
                      <Text style={{
                        fontFamily: 'Lexend',
                        fontSize: 12,
                        color: isDark ? '#64748b' : '#94a3b8',
                        lineHeight: 17,
                      }}>
                        {role.subtitle}
                      </Text>
                    </View>

                    {/* Radio indicator */}
                    <View style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? role.borderSelected : (isDark ? '#334155' : '#cbd5e1'),
                      backgroundColor: isSelected ? role.borderSelected : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 12,
                      flexShrink: 0,
                    }}>
                      {isSelected && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                        }} />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* ── Continue Button ── */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedRole}
            activeOpacity={0.85}
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              opacity: selectedRole ? 1 : 0.4,
              shadowColor: activeRole?.borderSelected ?? '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: selectedRole ? 0.4 : 0,
              shadowRadius: 16,
              elevation: selectedRole ? 8 : 0,
            }}
          >
            <LinearGradient
              colors={btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 58,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
              }}
            >
              <Text style={{
                fontFamily: 'LexendBold',
                fontSize: 15,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginRight: 8,
              }}>
                Continue
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
