import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Home } from 'lucide-react-native';
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
          backgroundColor: isDark ? '#020617' : '#ffffff',
          borderTopWidth: isDark ? 0.5 : 0.5,
          borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
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
              <Home size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1 h-1 bg-primary mt-1 rounded-full absolute -bottom-3" />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
