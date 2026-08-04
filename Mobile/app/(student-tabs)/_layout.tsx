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
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          marginHorizontal: 40,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 0,
          borderRadius: 40,
          elevation: isDark ? 0 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0 : 0.15,
          shadowRadius: 20,
          height: 64,
          paddingBottom: 0,
          paddingTop: 0,
          borderTopColor: 'transparent',
          overflow: 'hidden',
        },
        tabBarItemStyle: {
          flex: 1,
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
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
              <View className={`h-[28px] w-[28px] rounded-full overflow-hidden border-[2px] items-center justify-center bg-slate-100 dark:bg-slate-800 ${focused ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <Text className="text-[12px] font-black text-pink-600">S</Text>
                )}
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          tabBarItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
