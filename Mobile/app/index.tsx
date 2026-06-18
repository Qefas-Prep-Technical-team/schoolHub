import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { getAccessToken, getUserRole } from '../lib/auth/secure-store';

export default function AppEntry() {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    hasToken: boolean;
    hasRole: boolean;
  }>({
    isLoading: true,
    hasToken: false,
    hasRole: false,
  });

  useEffect(() => {
    async function checkAuth() {
      const token = await getAccessToken();
      const role = await getUserRole();
      
      setAuthState({
        isLoading: false,
        hasToken: !!token,
        hasRole: !!role,
      });
    }
    checkAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (authState.hasToken) {
    // Authenticated user, go straight to the dashboard!
    return <Redirect href="/(tabs)" />;
  } else if (authState.hasRole) {
    // Has chosen a role but not logged in, go to welcome screen
    return <Redirect href="/(auth)/welcome" />;
  } else {
    // Fresh install, send to role picker
    return <Redirect href="/role-picker" />;
  }
}
