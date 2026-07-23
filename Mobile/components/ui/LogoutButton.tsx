import React, { useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { clearTokens, clearUserRole } from '@/lib/auth/secure-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await clearTokens();
      // Use replace to prevent going back to the protected screens
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={isLoading}
      className="flex-row items-center justify-center space-x-2 py-4 px-6 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 rounded-2xl active:opacity-70"
    >
      {isLoading ? (
        <ActivityIndicator color="#ef4444" />
      ) : (
        <>
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-LexendBold text-base">
            Log Out
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
