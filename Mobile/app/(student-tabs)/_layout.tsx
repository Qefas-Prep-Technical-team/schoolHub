import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { Home, Calendar, BookOpen, GraduationCap } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { Image } from 'expo-image';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: studentProfile } = useStudentProfile();
  
  const profileImage = studentProfile?.data?.profileImage || studentProfile?.profileImage;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopWidth: 0,
          elevation: isDark ? 0 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          borderTopColor: isDark ? '#1e293b' : 'transparent',
          borderTopWidth: isDark ? 1 : 0,
        },
        tabBarActiveTintColor: isDark ? '#818cf8' : '#4f46e5',
        tabBarInactiveTintColor: isDark ? '#475569' : '#94a3b8',
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
            <View className="items-center justify-center mt-1">
              <View className={`h-[28px] w-[28px] rounded-full overflow-hidden border-[2px] items-center justify-center bg-slate-100 dark:bg-slate-800 ${focused ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}>
                {profileImage ? (
                   <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                   <Text className="text-[12px] font-black text-pink-600">S</Text>
                )}
              </View>
              {focused && <View className="w-1 h-1 bg-primary mt-1 rounded-full absolute -bottom-3 opacity-0" />}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
