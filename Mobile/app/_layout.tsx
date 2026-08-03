import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme, useThemeControls } from '@/hooks/use-color-scheme';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_900Black } from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import Toast from 'react-native-toast-message';
import { apiClient } from '../lib/api/client';
import { registerForPushNotificationsAsync } from '../lib/utils/notifications';

SplashScreen.preventAutoHideAsync();

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useThemeControls(); // Run theme restoration on app boot
  const [splashFinished, setSplashFinished] = useState(false);
  const [isBackendAwake, setIsBackendAwake] = useState(false);

  const [loaded] = useFonts({
    Lexend: Lexend_400Regular,
    LexendBold: Lexend_700Bold,
    LexendBlack: Lexend_900Black,
  });

  useEffect(() => {
    // Request notification permissions
    registerForPushNotificationsAsync();

    // Ping backend to wake it up (similar to frontend PingWrapper)
    let isMounted = true;
    const wakeBackend = async () => {
      try {
        await apiClient.get('/health', { timeout: 3000 });
        if (isMounted) setIsBackendAwake(true);
      } catch (error) {
        console.log("Backend wake ping failed, skipping wait...", error);
        if (isMounted) {
          setIsBackendAwake(true);
        }
      }
    };
    wakeBackend();
    return () => { isMounted = false; };
  }, []);

  const isReady = loaded && isBackendAwake;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' } }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="role-picker" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(student-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(teacher-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(parent-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="linking-hub" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="assignments" options={{ headerShown: false }} />
          <Stack.Screen name="exams" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="admin-quick-actions" options={{ headerShown: false }} />
          <Stack.Screen name="admin-profile" options={{ headerShown: false }} />
          <Stack.Screen name="admin-add-student" options={{ headerShown: false }} />
          <Stack.Screen name="admin-add-class" options={{ headerShown: false }} />
          <Stack.Screen name="admin-subscription" options={{ headerShown: false }} />
          <Stack.Screen name="admin-calendar" options={{ headerShown: false }} />
          <Stack.Screen name="admin-messages" options={{ headerShown: false }} />
          <Stack.Screen name="parent-profile" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />

        {/* Render Splash Screen on top until fonts load and backend wakes up */}
        {!splashFinished && (
          <AnimatedSplashScreen isAppReady={isReady} onFinish={() => setSplashFinished(true)} />
        )}
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
