import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, UserPlus, Mail, Phone, Calendar, User, Upload, CheckCircle2 } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminAddStudentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: ''
  });

  const renderInput = (icon: any, placeholder: string, value: string, key: string, keyboardType: any = 'default') => (
    <View className="mb-4">
      <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 h-14">
        {React.createElement(icon, { size: 20, color: isDark ? '#64748b' : '#94a3b8', className: 'mr-3' })}
        <TextInput
          className="flex-1 text-slate-900 dark:text-white font-Lexend text-base"
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={value}
          onChangeText={(text) => setForm({ ...form, [key]: text })}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ChevronLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="flex-1 px-4 text-center text-lg font-LexendBold text-slate-900 dark:text-white tracking-tight">
          Enroll Student
        </Text>
        <View className="h-10 w-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* Avatar Upload */}
          <View className="items-center mb-8">
            <View className="relative">
              <View className="h-24 w-24 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800 items-center justify-center border-dashed">
                <User size={32} color="#818cf8" />
              </View>
              <TouchableOpacity className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-600 rounded-full items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                <Upload size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white mt-4">Profile Photo</Text>
            <Text className="text-xs font-Lexend text-slate-500">Optional, max 2MB</Text>
          </View>

          {/* Form Bento */}
          <View className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <View className="flex-row items-center gap-3 mb-6">
              <UserPlus size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
              <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Personal Info</Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                {renderInput(User, "First Name", form.firstName, "firstName")}
              </View>
              <View className="flex-1">
                {renderInput(User, "Last Name", form.lastName, "lastName")}
              </View>
            </View>
            
            {renderInput(Mail, "Email Address", form.email, "email", "email-address")}
            {renderInput(Phone, "Phone Number", form.phone, "phone", "phone-pad")}
            {renderInput(Calendar, "Date of Birth (YYYY-MM-DD)", form.dob, "dob")}
            
            {/* Gender Selection */}
            <View className="flex-row gap-3 mt-2">
              {['Male', 'Female'].map((gender) => (
                <TouchableOpacity 
                  key={gender}
                  onPress={() => setForm({...form, gender})}
                  className={`flex-1 h-14 rounded-2xl items-center justify-center border ${
                    form.gender === gender 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Text className={`font-LexendBold ${form.gender === gender ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity className="h-16 bg-slate-900 dark:bg-white rounded-2xl items-center justify-center shadow-xl mb-12 flex-row gap-2">
            <CheckCircle2 size={20} color={isDark ? '#0f172a' : '#ffffff'} />
            <Text className="text-white dark:text-slate-900 font-LexendBold text-lg">Create Student</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
