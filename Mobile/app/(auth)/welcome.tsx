import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { clearUserRole, getUserRole } from '../../lib/auth/secure-store';
import { Button } from '../../components/ui/button';
import { GraduationCap, BookOpen, Users, ShieldCheck, ArrowRight, ArrowLeftRight } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';

const roleConfig: Record<string, any> = {
  student: { title: 'Student', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-white/10', image: require('../../assets/images/student-bg.jpg') },
  teacher: { title: 'Teacher', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-white/10', image: require('../../assets/images/teacher-bg.jpg') },
  parent: { title: 'Parent', icon: Users, color: 'text-orange-500', bg: 'bg-white/10', image: require('../../assets/images/parent-bg.jpg') },
  admin: { title: 'Admin', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-white/10', image: require('../../assets/images/admin-bg.jpg') },
};

export default function WelcomeGatewayScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function fetchRole() {
      const storedRole = await getUserRole();
      if (storedRole) setRole(storedRole);
    }
    fetchRole();
  }, []);

  const handleSwitchUser = async () => {
    await clearUserRole();
    router.replace('/role-picker');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSignup = () => {
    router.push('/(auth)/signup');
  };

  if (!role) return null;

  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  return (
    <ImageBackground 
      source={config.image} 
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.5 }}
      className="bg-slate-950"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-end px-6 pt-4 z-10">
          <TouchableOpacity 
            onPress={handleSwitchUser}
            className="flex-row items-center bg-slate-900/80 px-4 py-2.5 rounded-full border border-slate-800 shadow-sm"
          >
            <ArrowLeftRight size={14} className="text-slate-300 mr-2" />
            <Text className="font-lexend-bold text-xs text-slate-300 uppercase tracking-wider">Switch User Type</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 justify-center items-center px-6 z-10">
          <View className={cn("w-40 h-40 rounded-full items-center justify-center mb-10 shadow-lg shadow-black/40 border border-slate-700/50 backdrop-blur-md", config.bg)}>
            <Icon size={72} className={config.color} />
          </View>
          
          <Text className="font-lexend-bold text-4xl text-white mb-4 text-center tracking-tight">
            {config.title} Portal
          </Text>
          <Text className="font-lexend text-base text-slate-300 text-center px-6 leading-relaxed">
            Access your {config.title.toLowerCase()} dashboard, manage your activities, and stay connected with Qefas Hub.
          </Text>
        </View>

        {/* Bottom Actions */}
        <View className="px-6 pb-12 pt-6 gap-4 z-10">
          <Button 
            size="lg" 
            onPress={handleLogin} 
            className="w-full shadow-lg shadow-black/50"
            rightIcon={<ArrowRight size={20} color="#ffffff" />}
          >
            Log In
          </Button>
          <Button size="lg" variant="outline" onPress={handleSignup} className="w-full border-slate-600 bg-slate-900/80" textClassName="text-white">
            Create an Account
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
