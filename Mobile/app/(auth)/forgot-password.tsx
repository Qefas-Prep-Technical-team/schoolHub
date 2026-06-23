import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { KeyboardAwareScrollView, Image } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiClient } from '../../lib/api/client';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Token & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRequestReset = async () => {
    if (!email || !email.includes('@')) {
      setApiError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.post('/auth/password/reset/request', { email });
      setStep(2); // Move to token entry step
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please check the email address.';
      console.log('Request reset error:', errorMessage);
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token) {
      setApiError('Please enter the reset token from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setApiError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.post('/auth/password/reset/complete', {
        token,
        newPassword,
        confirmPassword
      });
      setStep(3); // Success
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.';
      console.log('Reset password error:', errorMessage);
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#0f172a', '#020617'] : ['#bae6fd', '#f0f9ff', '#ffffff']}
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
          <View className="px-6 pt-4 pb-8 flex-1">


            {step === 3 ? (
              <View className="flex-1 items-center justify-center mt-10">
                <CheckCircle2 size={80} className="text-green-500 mb-6" />
                <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white mb-2 text-center">
                  Password Reset!
                </Text>
                <Text className="font-lexend text-base text-slate-500 dark:text-slate-400 text-center">
                  Your password has been successfully updated. Redirecting you to login...
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <View className="mb-8">
                  <View className="flex-row items-center mb-2">
                    <TouchableOpacity
                      onPress={() => step === 2 ? setStep(1) : router.back()}
                      className="w-10 h-10 rounded-full bg-slate-100/60 dark:bg-slate-900/60 items-center justify-center mr-3"
                    >
                      <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
                    </TouchableOpacity>
                    <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white tracking-tight flex-1">
                      {step === 1 ? 'Reset Password' : 'Create New Password'}
                    </Text>
                  </View>
                  <Text className="font-lexend text-base text-slate-500 dark:text-slate-400 leading-relaxed ml-[52px]">
                    {step === 1
                      ? "Enter the email associated with your account and we'll send you a reset token."
                      : "Enter the reset token sent to your email along with your new password."}
                  </Text>
                </View>

                <View className="items-center mb-6 mt-[-10px]">
                  <Image
                    source={require('../../assets/login/student.png')}
                    className="w-48 h-48"
                    resizeMode="contain"
                  />
                </View>

                {apiError && (
                  <View className="mb-6 p-4 rounded-xl bg-error-container dark:bg-error-container/20 border border-error/20">
                    <Text className="font-lexend text-error dark:text-error text-sm">
                      {apiError}
                    </Text>
                  </View>
                )}

                <View className="gap-6">
                  {step === 1 ? (
                    <>
                      <Input
                        label="Email Address"
                        placeholder="name@school.edu"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        icon={Mail}
                        value={email}
                        onChangeText={setEmail}
                      />
                      <Button
                        size="lg"
                        onPress={handleRequestReset}
                        isLoading={isLoading}
                        className="mt-4 shadow-lg shadow-primary/30"
                      >
                        Send Reset Token
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        label="Reset Token"
                        placeholder="Paste the token from your email"
                        autoCapitalize="none"
                        icon={KeyRound}
                        value={token}
                        onChangeText={setToken}
                      />
                      <Input
                        label="New Password"
                        placeholder="••••••••••••"
                        secureTextEntry={!showPassword}
                        icon={Lock}
                        rightIcon={showPassword ? EyeOff : Eye}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                      <Input
                        label="Confirm New Password"
                        placeholder="••••••••••••"
                        secureTextEntry={!showPassword}
                        icon={Lock}
                        rightIcon={showPassword ? EyeOff : Eye}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      <Button
                        size="lg"
                        onPress={handleResetPassword}
                        isLoading={isLoading}
                        className="mt-4 shadow-lg shadow-primary/30"
                      >
                        Reset Password
                      </Button>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
