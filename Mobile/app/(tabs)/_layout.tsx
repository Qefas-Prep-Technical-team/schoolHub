import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Home, Calendar, BookOpen, GraduationCap, User } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Instagram style: no labels
        tabBarStyle: {
          backgroundColor: isDark ? '#020617' : '#ffffff', // slate-950 or white
          borderTopWidth: isDark ? 0.5 : 0.5,
          borderTopColor: isDark ? '#1e293b' : '#f1f5f9', // slate-800 or slate-100
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0, // Remove Android shadow
          shadowOpacity: 0, // Remove iOS shadow
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

      <Tabs.Screen
        name="timetable"
        options={{
          title: 'Timetable',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Calendar size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1 h-1 bg-primary mt-1 rounded-full absolute -bottom-3" />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <BookOpen size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1 h-1 bg-primary mt-1 rounded-full absolute -bottom-3" />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="grades"
        options={{
          title: 'Grades',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <GraduationCap size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1 h-1 bg-primary mt-1 rounded-full absolute -bottom-3" />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <User size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="w-1 h-1 bg-primary mt-1 rounded-full absolute -bottom-3" />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
