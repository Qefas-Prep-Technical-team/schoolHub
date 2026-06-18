import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_900Black } from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import Toast from 'react-native-toast-message';

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

  const [loaded] = useFonts({
    Lexend: Lexend_400Regular,
    LexendBold: Lexend_700Bold,
    LexendBlack: Lexend_900Black,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="role-picker" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        
        {/* Render Splash Screen on top until it finishes */}
        {!splashFinished && (
          <AnimatedSplashScreen isAppReady={loaded} onFinish={() => setSplashFinished(true)} />
        )}
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
