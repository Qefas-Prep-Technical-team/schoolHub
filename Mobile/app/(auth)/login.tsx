import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserRole, setTokens, getAccessToken, setUserRole } from '../../lib/auth/secure-store';
import { apiClient } from '../../lib/api/client';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { showErrorToast } from '@/lib/utils/toast';
import { LoadingOverlay } from '../../components/ui/loading-overlay';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    async function loadRole() {
      const storedRole = await getUserRole();
      if (storedRole) {
        setRole(storedRole);
      }
      
      const token = await getAccessToken();
      if (token && storedRole) {
        // Navigate after a tiny delay so Expo Router is fully mounted
        setTimeout(() => {
          try {
            router.replace('/');
          } catch (e) {
            console.warn('Navigation not ready:', e);
          }
        }, 100);
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

  const attemptLogin = async (data: LoginFormData) => {
    const response = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
      userType: role.toUpperCase(),
    });

    const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
    const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;

    if (accessToken) {
      await setTokens(accessToken, refreshToken || '');
      await setUserRole(role.toLowerCase());
      // Defer navigation — calling router.replace() synchronously here can
      // throw a navigation error that gets caught by onSubmit's catch block,
      // causing a false "Login Failed" toast even though login succeeded.
      setTimeout(() => { router.replace('/'); }, 100);
    } else {
      showErrorToast({ title: 'Login Failed', message: 'Invalid credentials or no token received.' });
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await attemptLogin(data);
    } catch (firstError: any) {
      // If it's a network error (no response received), retry once after a brief delay.
      // This handles Android emulator virtual network hiccups where 10.0.2.2 drops momentarily.
      const isNetworkError = !firstError.response && !!firstError.request;

      if (isNetworkError) {
        console.warn('[Login] Network error on first attempt, retrying in 2s...');
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await attemptLogin(data);
          return; // Retry succeeded — exit early
        } catch (retryError: any) {
          // Retry also failed — fall through to handle the error below
          console.log('[Login] Retry also failed:', retryError?.message);
        }
      }

      // Handle the original (or retry) error
      const error = firstError;
      const responseData = error.response?.data || {};

      let errorMessage: string;
      if (error.response) {
        errorMessage = error.response.data?.message || 'Login failed';
      } else if (error.request) {
        errorMessage = 'Network error — could not reach the server. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }

      console.log('[Login] Final error:', errorMessage);

      const requiresVerification = responseData.requiresVerification;
      const preAuthToken = responseData.preAuthToken;

      if (
        error.response?.status === 403 &&
        (requiresVerification || errorMessage.toLowerCase().includes('verified') || errorMessage.toLowerCase().includes('verification'))
      ) {
        router.replace({
          pathname: '/(auth)/verification',
          params: {
            email: data.email,
            userType: role.toUpperCase(),
            requestCode: 'true',
            preAuthToken: preAuthToken || '',
          }
        });
        return;
      }

      showErrorToast({ title: 'Login Failed', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'student': return 'Student Portal';
      case 'teacher': return 'Teacher Portal';
      case 'parent': return 'Parent Portal';
      case 'admin': return 'Admin Portal';
      default: return 'Login';
    }
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    if (isDark) {
      switch (role) {
        case 'student': return ['#831843', '#020617']; // pink-900 to slate-950
        case 'teacher': return ['#064e3b', '#020617']; // emerald-900 to slate-950
        case 'parent': return ['#7c2d12', '#020617']; // orange-900 to slate-950
        case 'admin': return ['#1e3a8a', '#020617']; // blue-900 to slate-950
        default: return ['#0f172a', '#020617'];
      }
    } else {
      switch (role) {
        case 'student': return ['#fbcfe8', '#fdf2f8', '#ffffff']; // pink
        case 'teacher': return ['#a7f3d0', '#f0fdf4', '#ffffff']; // emerald
        case 'parent': return ['#fed7aa', '#fff7ed', '#ffffff']; // orange
        case 'admin': return ['#bae6fd', '#f0f9ff', '#ffffff']; // blue
        default: return ['#bae6fd', '#f0f9ff', '#ffffff'];
      }
    }
  };

  // Per-role button gradient: always vibrant regardless of light/dark mode
  const getRoleButtonColors = (): readonly [string, string] => {
    switch (role) {
      case 'student': return ['#ec4899', '#9d174d']; // pink
      case 'teacher': return ['#10b981', '#065f46']; // emerald
      case 'parent':  return ['#f97316', '#9a3412']; // orange
      case 'admin':   return ['#3b82f6', '#1e3a8a']; // blue
      default:        return ['#3b82f6', '#1e3a8a'];
    }
  };

  // Matching accent for links, forgot password etc.
  const getRoleLinkColor = (): string => {
    switch (role) {
      case 'student': return '#db2777';
      case 'teacher': return '#059669';
      case 'parent':  return '#ea580c';
      case 'admin':   return '#2563eb';
      default:        return '#2563eb';
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">

        <KeyboardAwareScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
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
                  <Text style={{ fontFamily: 'LexendBold', fontSize: 12, color: getRoleLinkColor(), textTransform: 'uppercase', letterSpacing: 2 }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.85}
                style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', opacity: isLoading ? 0.7 : 1 }}
              >
                <LinearGradient
                  colors={getRoleButtonColors()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 56, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 32, borderRadius: 16 }}
                >
                  {isLoading
                    ? <ActivityIndicator color="#ffffff" style={{ marginRight: 8 }} />
                    : null
                  }
                  <Text style={{ fontFamily: 'LexendBold', fontSize: 15, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2 }}>
                    Sign In
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
