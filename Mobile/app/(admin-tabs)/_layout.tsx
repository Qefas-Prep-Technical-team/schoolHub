import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { Home, Users, BookOpen, GraduationCap, Settings, FileText } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
          elevation: isDark ? 0 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: isDark ? '#818cf8' : '#4f46e5',
        tabBarInactiveTintColor: isDark ? '#475569' : '#94a3b8',
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Home size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#818cf8' : '#4f46e5',
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Users size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#818cf8' : '#4f46e5',
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
                transform: [{ translateY: -14 }],
              }}>
                <BookOpen size={24} color="#ffffff" strokeWidth={2.5} />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="teachers"
        options={{
          title: 'Teachers',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#818cf8' : '#4f46e5',
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#818cf8' : '#4f46e5',
                  marginTop: 4,
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
