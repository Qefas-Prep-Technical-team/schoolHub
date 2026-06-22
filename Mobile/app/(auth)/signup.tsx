import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserRole } from '../../lib/auth/secure-store';
import { apiClient } from '../../lib/api/client';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Building, Check } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
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

// We build a schema generator so it adapts to the role
const getSignupSchema = (role: string) => {
  const baseSchema = z.object({
    email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the Terms of Service and Privacy Policy'),
    // Optional fields for web parity
    schoolName: z.string().optional(),
    adminName: z.string().optional(),
    fullName: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }).refine((data) => {
    if (role === 'admin') {
      return !!data.schoolName && data.schoolName.length >= 2;
    }
    return true;
  }, {
    message: "School name is required",
    path: ['schoolName'],
  }).refine((data) => {
    if (role === 'admin') {
      return !!data.adminName && data.adminName.length >= 2;
    }
    return true;
  }, {
    message: "Admin name is required",
    path: ['adminName'],
  }).refine((data) => {
    if (role !== 'admin') {
      return !!data.fullName && data.fullName.length >= 2;
    }
    return true;
  }, {
    message: "Full name is required",
    path: ['fullName'],
  });

  return baseSchema;
};

type SignupFormData = z.infer<ReturnType<typeof getSignupSchema>>;

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    async function loadRole() {
      const storedRole = await getUserRole();
      if (storedRole) {
        setRole(storedRole);
      }
    }
    loadRole();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(getSignupSchema(role)),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      schoolName: '',
      adminName: '',
      fullName: '',
      acceptTerms: false,
    },
  });

  const getEndpoint = () => {
    switch(role) {
      case 'admin': return '/auth/register/school';
      case 'teacher': return '/auth/register/teacher';
      case 'parent': return '/auth/register/parents';
      default: return '/auth/register/student';
    }
  };

  const getRoleTitle = () => {
    switch(role) {
      case 'student': return 'Student Registration';
      case 'teacher': return 'Teacher Registration';
      case 'parent': return 'Parent Registration';
      case 'admin': return 'School Registration';
      default: return 'Sign Up';
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const endpoint = getEndpoint();
      const payload = role === 'admin' 
        ? {
            schoolName: data.schoolName,
            adminName: data.adminName,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            acceptTerms: data.acceptTerms,
          }
        : {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            acceptTerms: data.acceptTerms,
          };

      const response = await apiClient.post(endpoint, payload);
      
      // On success, redirect to verification page
      router.replace({
        pathname: '/(auth)/verification',
        params: {
          email: data.email,
          userType: role.toUpperCase(),
          requestCode: 'true'
        }
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create account. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getGradientColors = () => {
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

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
      <LoadingOverlay visible={isLoading} message="Creating account..." />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-6 pt-4 pb-8">
            <View className="flex-row items-center justify-between mb-6">
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
                Create an account to join Qefas Hub.
              </Text>
            </View>

            <View className="items-center mb-6 mt-2">
              <Image 
                source={illustrationConfig[role] || illustrationConfig.student} 
                className="w-56 h-56"
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

            <View className="gap-5">
              {role === 'admin' ? (
                <>
                  <Controller
                    control={control}
                    name="schoolName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="School Name"
                        placeholder="Qefas Academy"
                        icon={Building}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.schoolName?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="adminName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Admin Full Name"
                        placeholder="John Doe"
                        icon={User}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.adminName?.message}
                      />
                    )}
                  />
                </>
              ) : (
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      icon={User}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.fullName?.message}
                    />
                  )}
                />
              )}

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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="••••••••••••"
                    secureTextEntry={!showPassword}
                    icon={Lock}
                    rightIcon={showPassword ? EyeOff : Eye}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="acceptTerms"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-col mt-2">
                    <View className="flex-row items-center pr-4">
                      <TouchableOpacity 
                        className="p-1"
                        onPress={() => onChange(!value)}
                        activeOpacity={0.7}
                      >
                        <View className={`w-5 h-5 rounded border items-center justify-center mr-2 ${value ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-700 bg-transparent'}`}>
                          {value && <Check size={14} className="text-white" strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                      <Text className="font-lexend text-sm text-slate-600 dark:text-slate-400 flex-1 flex-wrap">
                        I agree to the{' '}
                        <Text 
                          className="font-lexend-bold text-primary"
                          onPress={() => setShowTerms(true)}
                        >
                          Terms of Service
                        </Text>
                        {' '}and{' '}
                        <Text 
                          className="font-lexend-bold text-primary"
                          onPress={() => setShowPrivacy(true)}
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    </View>
                    {errors.acceptTerms && (
                      <Text className="text-error dark:text-error text-xs mt-2 ml-8">
                        {errors.acceptTerms.message as string}
                      </Text>
                    )}
                  </View>
                )}
              />

              <Button 
                size="lg" 
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
                className="mt-6 shadow-lg shadow-primary/30"
              >
                Create Account
              </Button>
              
              <View className="flex-row justify-center mt-6">
                <Text className="font-lexend text-slate-500 dark:text-slate-400">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                  <Text className="font-lexend-bold text-primary dark:text-primary-container">Sign In</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showTerms} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTerms(false)}>
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <Text className="font-lexend-bold text-xl text-slate-900 dark:text-white">Terms of Service</Text>
            <TouchableOpacity onPress={() => setShowTerms(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Text className="font-lexend-bold text-slate-500">Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-6">
            <Text className="font-lexend-bold text-lg mb-2 text-slate-900 dark:text-white">Last Updated: May 9, 2026</Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              By using Qefas Hub, you agree to provide accurate information and use the platform for educational purposes only.
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Qefas Hub is provided "as is" without any warranties of any kind, either express or implied.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showPrivacy} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPrivacy(false)}>
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <Text className="font-lexend-bold text-xl text-slate-900 dark:text-white">Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacy(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Text className="font-lexend-bold text-slate-500">Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-6">
            <Text className="font-lexend-bold text-lg mb-2 text-slate-900 dark:text-white">Last Updated: May 9, 2026</Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Your privacy is important to us. We collect minimal data required for your educational experience, including your name, email, and school progress.
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              We do not sell your data to third parties. All data is encrypted and stored securely on our servers.
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              We use your information to:
            </Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 ml-4 mb-1">- Provide and maintain our Service</Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 ml-4 mb-1">- Notify you about changes to our Service</Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 ml-4 mb-1">- Provide customer support</Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 ml-4 mb-4">- Gather analysis or valuable information so that we can improve our Service</Text>
            <Text className="font-lexend text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              By using Qefas Hub, you consent to our data collection practices as outlined in this policy.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
