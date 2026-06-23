import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { getAccessToken, getUserRole } from '../lib/auth/secure-store';

export default function AppEntry() {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    hasToken: boolean;
    role: string | null;
  
  }>({
    isLoading: true,
    hasToken: false,
    role: null,
   
  });

  useEffect(() => {
    async function checkAuth() {
      const token = await getAccessToken();
      const role = await getUserRole();
      
      setAuthState({
        isLoading: false,
        hasToken: !!token,
        role: role,
    
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

  if (authState.hasToken && authState.role) {
    // Authenticated user, redirect to their specific dashboard
    switch (authState.role.toUpperCase()) {
      case 'STUDENT': return <Redirect href="/(student-tabs)" />;
      case 'TEACHER': return <Redirect href="/(teacher-tabs)" />;
      case 'PARENT': return <Redirect href="/(parent-tabs)" />;
      case 'ADMIN': return <Redirect href="/(admin-tabs)" />;
      default: return <Redirect href="/(student-tabs)" />;
    }
  } else if (authState.role) {
    // Has chosen a role but not logged in, go to welcome screen
    return <Redirect href="/(auth)/welcome" />;
  } else {
    // Fresh install, send to role picker
    return <Redirect href="/role-picker" />;
  }
}
