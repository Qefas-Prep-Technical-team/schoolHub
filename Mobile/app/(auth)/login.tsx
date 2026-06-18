import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserRole, setTokens } from '../../lib/auth/secure-store';
import { apiClient } from '../../lib/api/client';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { LoadingOverlay } from '../../components/ui/loading-overlay';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const illustrationConfig: Record<string, any> = {
  student: require('../../assets/login/student.png'),
  teacher: require('../../assets/login/teacher.png'),
  parent: require('../../assets/login/parent.png'),
  admin: require('../../assets/login/admin.png'),
};

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadRole() {
      const storedRole = await getUserRole();
      if (storedRole) {
        setRole(storedRole);
      }
    }
    loadRole();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
        userType: role.toUpperCase(),
      });

      const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;

      if (accessToken) {
        await setTokens(accessToken, refreshToken || '');
        // Navigate to the main app layout
        router.replace('/');
      } else {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Invalid credentials or no token received.' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sign in. Please check your credentials.';
      
      if (
        error.response?.status === 403 &&
        (errorMessage.toLowerCase().includes('verified') || errorMessage.toLowerCase().includes('verification'))
      ) {
        // Unverified users get redirected to verification
        router.replace({
          pathname: '/(auth)/verification',
          params: {
            email: data.email,
            userType: role.toUpperCase(),
            requestCode: 'true'
          }
        });
        return;
      }

      Toast.show({ type: 'error', text1: 'Login Failed', text2: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch(role) {
      case 'student': return 'Student Portal';
      case 'teacher': return 'Teacher Portal';
      case 'parent': return 'Parent Portal';
      case 'admin': return 'Admin Portal';
      default: return 'Login';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <LoadingOverlay visible={isLoading} message="Authenticating..." />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-6 pt-4 pb-8">
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 items-center justify-center"
              >
                <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="font-lexend-bold text-4xl text-slate-900 dark:text-white mb-2 tracking-tight">
                {getRoleTitle()}
              </Text>
              <Text className="font-lexend text-base text-slate-500 dark:text-slate-400">
                Welcome back. Log in to access your dashboard.
              </Text>
            </View>

            <View className="items-center mb-8 mt-2">
              <Image 
                source={illustrationConfig[role] || illustrationConfig.student} 
                className="w-64 h-64"
                resizeMode="contain"
              />
            </View>



            <View className="gap-6">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="name@school.edu"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    icon={Mail}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="••••••••••••"
                    secureTextEntry={!showPassword}
                    icon={Lock}
                    rightIcon={showPassword ? EyeOff : Eye}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <View className="flex-row justify-end mt-[-10px]">
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text className="font-lexend-bold text-xs text-primary dark:text-primary-container uppercase tracking-widest">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Button 
                size="lg" 
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
                className="mt-4 shadow-lg shadow-primary/30"
              >
                Sign In
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
