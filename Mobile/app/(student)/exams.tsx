import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/button';
import { clearTokens } from '../../lib/auth/secure-store';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearTokens();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center p-6">
      <Text className="font-lexend-bold text-2xl text-slate-900 dark:text-white mb-8">Profile</Text>
      
      <Button variant="outline" onPress={handleLogout} className="w-full">
        Log Out
      </Button>
    </SafeAreaView>
  );
}
