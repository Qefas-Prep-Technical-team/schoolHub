import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../lib/api/client';
import { Button } from '../../components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';

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

  useEffect(() => {
    if (requestCode && !hasRequested.current && email && userType) {
      hasRequested.current = true;
      requestVerificationCode();
    }
  }, [requestCode, email, userType]);

  const requestVerificationCode = async () => {
    try {
      await apiClient.post('/auth/request-code', { email, userType });
    } catch (error: any) {
      console.error('Request code error:', error);
      setApiError(error.response?.data?.message || 'Failed to send verification code.');
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setApiError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.post('/auth/verify-code', { email, code, userType });
      setIsSuccess(true);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (error: any) {
      console.error('Verify code error:', error);
      setApiError(error.response?.data?.message || 'Failed to verify code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-950 items-center justify-center p-6">
        <Text className="font-lexend text-slate-600 dark:text-slate-400 text-center mb-4">
          No email provided for verification.
        </Text>
        <Button onPress={() => router.replace('/(auth)/signup')}>Go to Registration</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
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
                <CheckCircle2 size={80} className="text-green-500 mb-6" />
                <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white mb-2 text-center">
                  Verification Successful!
                </Text>
                <Text className="font-lexend text-base text-slate-500 dark:text-slate-400 text-center">
                  Redirecting you to login...
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

                  <View className="flex-row justify-center mt-4">
                    <Text className="font-lexend text-slate-500 dark:text-slate-400 text-sm">
                      Didn't receive the code?{' '}
                    </Text>
                    <TouchableOpacity onPress={requestVerificationCode}>
                      <Text className="font-lexend-bold text-primary text-sm">Resend Code</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
