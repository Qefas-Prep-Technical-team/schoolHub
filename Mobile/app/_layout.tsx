import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_900Black } from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import Toast from 'react-native-toast-message';
import { apiClient } from '../lib/api/client';

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
  const [splashFinished, setSplashFinished] = useState(false);
  const [isBackendAwake, setIsBackendAwake] = useState(false);

  const [loaded] = useFonts({
    Lexend: Lexend_400Regular,
    LexendBold: Lexend_700Bold,
    LexendBlack: Lexend_900Black,
  });

  useEffect(() => {
    // Ping backend to wake it up (similar to frontend PingWrapper)
    let isMounted = true;
    const wakeBackend = async () => {
      try {
        await apiClient.get('/health', { timeout: 60000 });
        if (isMounted) setIsBackendAwake(true);
      } catch (error) {
        console.log("Backend wake ping failed, retrying...", error);
        if (isMounted) {
          // If it fails, we still let them in after 5 seconds so they aren't trapped forever
          setTimeout(() => {
            if (isMounted) setIsBackendAwake(true);
          }, 5000);
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
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="role-picker" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(student)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
