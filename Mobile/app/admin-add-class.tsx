import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, PlusCircle, Building2, Users, GraduationCap, CheckCircle2 } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminAddClassScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [form, setForm] = useState({
    className: '',
    capacity: '',
    level: 'Secondary',
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
          New Class
        </Text>
        <View className="h-10 w-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
          
          <View className="bg-indigo-600 rounded-[2.5rem] p-6 shadow-lg mb-8 items-center justify-center relative overflow-hidden">
             <View className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-500 rounded-full blur-2xl opacity-50" />
             <View className="h-20 w-20 bg-white/20 rounded-[2rem] items-center justify-center mb-4 backdrop-blur-md">
                <Building2 size={36} color="#ffffff" />
             </View>
             <Text className="text-white font-LexendBlack text-xl text-center italic tracking-tight uppercase">Setup Classroom</Text>
             <Text className="text-indigo-200 font-Lexend text-center mt-1">Configure a new learning environment</Text>
          </View>

          {/* Form Bento */}
          <View className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <View className="flex-row items-center gap-3 mb-6">
              <PlusCircle size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
              <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Class Details</Text>
            </View>

            {renderInput(GraduationCap, "Class Name (e.g. JSS 1A)", form.className, "className")}
            {renderInput(Users, "Capacity (e.g. 30)", form.capacity, "capacity", "number-pad")}
            
            {/* Level Selection */}
            <Text className="text-xs font-LexendBold text-slate-500 uppercase tracking-widest mt-2 mb-3">Education Level</Text>
            <View className="flex-row gap-3">
              {['Primary', 'Secondary'].map((lvl) => (
                <TouchableOpacity 
                  key={lvl}
                  onPress={() => setForm({...form, level: lvl})}
                  className={`flex-1 h-14 rounded-2xl items-center justify-center border ${
                    form.level === lvl 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Text className={`font-LexendBold ${form.level === lvl ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity className="h-16 bg-slate-900 dark:bg-white rounded-2xl items-center justify-center shadow-xl mb-12 flex-row gap-2">
            <CheckCircle2 size={20} color={isDark ? '#0f172a' : '#ffffff'} />
            <Text className="text-white dark:text-slate-900 font-LexendBold text-lg">Create Class</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
