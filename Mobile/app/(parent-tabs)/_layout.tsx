import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Home, Users, CreditCard, Settings } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ParentTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 0,
          borderRadius: 40,
          height: 64,
          paddingBottom: 0,
          elevation: 10,
          shadowColor: isDark ? '#000' : '#475569',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
        },
        tabBarActiveTintColor: isDark ? '#ffffff' : '#0f172a',
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1.5 h-1.5 bg-primary mt-1.5 rounded-full absolute -bottom-4" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: 'Children',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Users size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1.5 h-1.5 bg-primary mt-1.5 rounded-full absolute -bottom-4" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <CreditCard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1.5 h-1.5 bg-primary mt-1.5 rounded-full absolute -bottom-4" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Settings size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1.5 h-1.5 bg-primary mt-1.5 rounded-full absolute -bottom-4" />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
