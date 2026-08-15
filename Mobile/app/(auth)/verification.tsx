import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import LottieView from 'lottie-react-native';
import { setTokens, setUserRole } from '../../lib/auth/secure-store';

export default function VerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const userType = params.userType as string;
  const requestCode = params.requestCode === 'true';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasRequested = useRef(false);
  const isSubmitting = useRef(false);
  const lottieRef = useRef<any>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  useEffect(() => {
    if (requestCode && !hasRequested.current && email && userType) {
      hasRequested.current = true;
      requestVerificationCode();
    }
  }, [requestCode, email, userType]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 100);
    }
  }, [isSuccess]);

  const requestVerificationCode = async () => {
    try {
      await apiClient.post('/auth/request-code', { email, userType: userType?.toUpperCase() });
      setCountdown(60); // Start 60-second countdown on success
    } catch (error: any) {
      console.error('Request code error:', error);
      setApiError(error.response?.data?.message || 'Failed to send verification code.');
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6 || isSubmitting.current) {
      if (code.length !== 6) setApiError('Please enter a valid 6-digit code.');
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.post('/auth/verify-code', { email, code, userType: userType?.toUpperCase() });
      setIsSuccess(true);
      
      const preAuthToken = params.preAuthToken as string | undefined;
      
      if (preAuthToken) {
        // Auto-login using secure preAuthToken
        try {
          const loginResponse = await apiClient.post('/auth/login', {
            email,
            userType,
            preAuthToken
          });
          
          const accessToken = loginResponse.data?.data?.accessToken || loginResponse.data?.accessToken;
          const refreshToken = loginResponse.data?.data?.refreshToken || loginResponse.data?.refreshToken;
          
          if (accessToken) {
            await setTokens(accessToken, refreshToken || '');
            await setUserRole(userType.toLowerCase());
            setTimeout(() => {
              router.replace('/');
            }, 1000);
            return;
          }
        } catch (loginErr) {
          console.error('Auto-login failed after verification:', loginErr);
          // Fallback to manual login
        }
      }
      
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (error: any) {
      console.error('Verify code error:', error);
      setApiError(error.response?.data?.message || 'Failed to verify code.');
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const getGradientColors = () => {
    const role = userType?.toLowerCase() || 'student';
    if (isDark) {
      switch(role) {
        case 'student': return ['#831843', '#020617']; // pink-900 to slate-950
        case 'teacher': return ['#064e3b', '#020617']; // emerald-900 to slate-950
        case 'parent': return ['#7c2d12', '#020617']; // orange-900 to slate-950
        case 'admin': return ['#1e3a8a', '#020617']; // blue-900 to slate-950
        default: return ['#0f172a', '#020617'];
      }
    } else {
      switch(role) {
        case 'student': return ['#fbcfe8', '#fdf2f8', '#ffffff']; // pink
        case 'teacher': return ['#a7f3d0', '#f0fdf4', '#ffffff']; // emerald
        case 'parent': return ['#fed7aa', '#fff7ed', '#ffffff']; // orange
        case 'admin': return ['#bae6fd', '#f0f9ff', '#ffffff']; // blue
        default: return ['#bae6fd', '#f0f9ff', '#ffffff'];
      }
    }
  };

  if (!email) {
    return (
      <LinearGradient
        colors={getGradientColors() as any}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 items-center justify-center p-6">
          <Text className="font-lexend text-slate-600 dark:text-slate-400 text-center mb-4">
            No email provided for verification.
          </Text>
          <Button onPress={() => router.replace('/(auth)/signup')}>Go to Registration</Button>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={getGradientColors() as any}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-6 pt-4 pb-8 flex-1">
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 items-center justify-center"
              >
                <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
              </TouchableOpacity>
            </View>

            {isSuccess ? (
              <View className="flex-1 items-center justify-center mt-20">
                <LottieView
                  ref={lottieRef}
                  source={require('../../assets/lottie/success.json')}
                  autoPlay={true}
                  loop={false}
                  style={{ width: 150, height: 150, marginBottom: 16 }}
                />
                <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white mb-2 text-center">
                  Verification Successful!
                </Text>
                <Text className="font-lexend text-base text-slate-500 dark:text-slate-400 text-center">
                  {params.preAuthToken ? 'Redirecting to dashboard...' : 'Redirecting you to login...'}
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <View className="mb-8">
                  <Text className="font-lexend-bold text-4xl text-slate-900 dark:text-white mb-2 tracking-tight">
                    Verify Email
                  </Text>
                  <Text className="font-lexend text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                    We've sent a 6-digit confirmation code to your email address at{' '}
                    <Text className="font-lexend-bold text-slate-800 dark:text-slate-200">{email}</Text>.
                  </Text>
                </View>

                {apiError && (
                  <View className="mb-6 p-4 rounded-xl bg-error-container dark:bg-error-container/20 border border-error/20">
                    <Text className="font-lexend text-error dark:text-error text-sm">
                      {apiError}
                    </Text>
                  </View>
                )}

                <View className="gap-6">
                  <View>
                    <Text className="font-lexend-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                      Verification Code
                    </Text>
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="••••••"
                      placeholderTextColor="#94a3b8"
                      className="h-16 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-lexend-bold text-center text-3xl tracking-[0.5em]"
                    />
                  </View>

                  <Button 
                    size="lg" 
                    onPress={handleVerify}
                    isLoading={isLoading}
                    disabled={code.length !== 6 || isLoading}
                    className="mt-4 shadow-lg shadow-primary/30"
                  >
                    Verify Account
                  </Button>

                  <View className="flex-row justify-center mt-4 items-center">
                    <Text className="font-lexend text-slate-500 dark:text-slate-400 text-sm">
                      Didn't receive the code?{' '}
                    </Text>
                    <TouchableOpacity 
                      onPress={requestVerificationCode}
                      disabled={countdown > 0}
                    >
                      <Text className={`font-lexend-bold text-sm ${countdown > 0 ? 'text-slate-400 dark:text-slate-500' : 'text-primary'}`}>
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
