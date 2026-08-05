import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { clearUserRole, getUserRole } from '../../lib/auth/secure-store';
import { GraduationCap, BookOpen, Users, ShieldCheck, ArrowRight, ArrowLeftRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Role config ──────────────────────────────────────────────────────────────

const roleConfig: Record<string, {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  image: any;
  // Button gradient (left → right)
  btnColors: readonly [string, string];
  // Outline button border/text colour
  outlineColor: string;
  // Icon ring glow colour (semi-transparent)
  ringColor: string;
  // Solid icon colour
  iconColor: string;
}> = {
  student: {
    title: 'Student Portal',
    subtitle: 'Access your dashboard, track assignments, and stay on top of your academics.',
    icon: GraduationCap,
    image: require('../../assets/images/student-bg.jpg'),
    btnColors: ['#ec4899', '#9d174d'],
    outlineColor: '#ec4899',
    ringColor: 'rgba(236,72,153,0.25)',
    iconColor: '#f9a8d4',
  },
  teacher: {
    title: 'Teacher Portal',
    subtitle: 'Manage your classes, assignments, and monitor student progress.',
    icon: BookOpen,
    image: require('../../assets/images/teacher-bg.jpg'),
    btnColors: ['#10b981', '#065f46'],
    outlineColor: '#10b981',
    ringColor: 'rgba(16,185,129,0.25)',
    iconColor: '#6ee7b7',
  },
  parent: {
    title: 'Parent Portal',
    subtitle: "Stay connected with your child's school life and track their progress.",
    icon: Users,
    image: require('../../assets/images/parent-bg.jpg'),
    btnColors: ['#f97316', '#9a3412'],
    outlineColor: '#f97316',
    ringColor: 'rgba(249,115,22,0.25)',
    iconColor: '#fdba74',
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'Manage your school, configure settings, and oversee all operations.',
    icon: ShieldCheck,
    image: require('../../assets/images/admin-bg.jpg'),
    btnColors: ['#3b82f6', '#1e3a8a'],
    outlineColor: '#3b82f6',
    ringColor: 'rgba(59,130,246,0.25)',
    iconColor: '#93c5fd',
  },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WelcomeGatewayScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      const storedRole = await getUserRole();
      if (storedRole) setRole(storedRole);
    }
    fetchRole();
  }, []);

  const handleSwitchUser = async () => {
    await clearUserRole();
    router.replace('/role-picker');
  };

  if (!role) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#818cf8" />
      </View>
    );
  }

  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  return (
    <ImageBackground
      source={config.image}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.35 }}
    >
      {/* Dark scrim overlay so text pops */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,6,23,0.55)' }} />

      <SafeAreaView style={{ flex: 1 }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 12 }}>
          <TouchableOpacity
            onPress={handleSwitchUser}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(15,23,42,0.85)',
              paddingHorizontal: 14, paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)',
            }}
          >
            <ArrowLeftRight size={13} color="#cbd5e1" style={{ marginRight: 6 }} />
            <Text style={{ fontFamily: 'LexendBold', fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Switch Role
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero ── */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

          {/* Glowing icon ring */}
          <View style={{
            width: 160, height: 160, borderRadius: 80,
            backgroundColor: config.ringColor,
            borderWidth: 2, borderColor: config.outlineColor + '55',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 36,
            // Outer soft glow via shadow
            shadowColor: config.outlineColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 32,
            elevation: 16,
          }}>
            <Icon size={72} color={config.iconColor} />
          </View>

          <Text style={{
            fontFamily: 'LexendBold',
            fontSize: 34,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: -0.5,
            marginBottom: 12,
          }}>
            {config.title}
          </Text>

          <Text style={{
            fontFamily: 'Lexend',
            fontSize: 15,
            color: 'rgba(203,213,225,0.9)',
            textAlign: 'center',
            lineHeight: 24,
          }}>
            {config.subtitle}
          </Text>
        </View>

        {/* ── Bottom Buttons ── */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 48, gap: 12 }}>

          {/* Primary — gradient "Log In" button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
            style={{ borderRadius: 18, overflow: 'hidden', shadowColor: config.outlineColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 }}
          >
            <LinearGradient
              colors={config.btnColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 18 }}
            >
              <Text style={{ fontFamily: 'LexendBold', fontSize: 15, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2, marginRight: 8 }}>
                Log In
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary — outline "Create Account" button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: config.outlineColor + 'aa',
              backgroundColor: 'rgba(15,23,42,0.7)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: 'LexendBold', fontSize: 15, color: config.outlineColor, textTransform: 'uppercase', letterSpacing: 2 }}>
              Create Account
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// StyleSheet shim for absoluteFillObject
const StyleSheet = {
  absoluteFillObject: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
  },
};
