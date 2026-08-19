import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import '../global.css';

// Enable NativeWind for third-party components
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
import { useColorScheme, useThemeControls } from '@/hooks/use-color-scheme';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_900Black } from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../components/toast/CustomToast';
import { apiClient } from '../lib/api/client';
import { registerForPushNotificationsAsync } from '../lib/utils/notifications';
import { authEvents } from '../lib/auth/authEvents';
import { clearTokens, clearUserRole } from '../lib/auth/secure-store';
import { OfflineBanner } from '../components/ui/OfflineBanner';

// Disable Reanimated strict mode to hide spammy warnings from navigation libraries
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersister, DEFAULT_STALE_TIME, DEFAULT_GC_TIME } from '../lib/utils/queryPersister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Data is fresh for 5 minutes — won't refetch if within this window
      staleTime: DEFAULT_STALE_TIME,
      // Keep data in cache (and persisted to disk) for 24 hours
      gcTime: DEFAULT_GC_TIME,
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

  // Listen for forced logout events from the API client
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(async () => {
      try {
        await clearTokens();
        await clearUserRole();
        queryClient.clear();
      } catch (e) {
        console.warn('Error during forced logout cleanup:', e);
      } finally {
        // Defer navigation to ensure the Root Layout navigator is fully mounted
        // before we attempt to redirect. Without this, a fast/cached auth event
        // can trigger before expo-router's navigator is ready, causing a crash.
        setTimeout(() => {
          try {
            router.replace('/');
          } catch (navError) {
            console.warn('Navigation error during forced logout:', navError);
          }
        }, 0);
      }
    });
    return unsubscribe;
  }, []);

  const isReady = loaded && isBackendAwake;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        // Keep the cache valid for 24 hours — matches gcTime above
        maxAge: DEFAULT_GC_TIME,
        // Don't clear cache on a new session; let data show while refetching
        buster: '',
      }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Root container — OfflineBanner overlays everything via absolute positioning */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' } }}>
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

          {/* Global offline banner — always visible above all screens */}
          <OfflineBanner />

          <Toast config={toastConfig} />
        </View>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
