import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

const THEME_KEY = 'APP_THEME';

export function useColorScheme() {
  const { colorScheme } = useNativeWindColorScheme();
  return colorScheme ?? 'light';
}

export function useThemeControls() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  const toggleColorScheme = async () => {
    const nextScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(nextScheme);
    try {
      await SecureStore.setItemAsync(THEME_KEY, nextScheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function restoreTheme() {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
        if (isMounted && (savedTheme === 'light' || savedTheme === 'dark')) {
          // Defer state update to avoid 'update on unmounted component' warning
          // during React Navigation's complex initial hydration phase.
          setTimeout(() => {
            if (isMounted && savedTheme !== colorScheme) {
              setColorScheme(savedTheme);
            }
          }, 50);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    }
    restoreTheme();
    return () => { isMounted = false; };
  }, []);

  return { colorScheme: colorScheme ?? 'light', toggleColorScheme, setColorScheme };
}
