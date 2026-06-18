import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { setUserRole } from '../lib/auth/secure-store';
import { cn } from '../lib/utils';
import { GraduationCap, BookOpen, Users, ShieldCheck } from 'lucide-react-native';
import { Button } from '../components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';

const roles = [
  { id: 'student', title: 'Student', icon: GraduationCap, color: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', textColor: 'text-blue-600 dark:text-blue-400' },
  { id: 'teacher', title: 'Teacher', icon: BookOpen, color: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'parent', title: 'Parent', icon: Users, color: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', textColor: 'text-amber-600 dark:text-amber-400' },
  { id: 'admin', title: 'School Admin', icon: ShieldCheck, color: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-600 dark:text-purple-400' },
];

export default function RolePicker() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const handleContinue = async () => {
    if (selectedRole) {
      await setUserRole(selectedRole);
      // Navigate to the welcome screen for the selected role
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <View className="flex-1 px-6 pt-12 pb-8">
        <View className="items-center mb-10 mt-6">
          <Image 
            source={require('../assets/images/icon.png')} 
            className="w-20 h-20 mb-6" 
            resizeMode="contain" 
          />
          <Text className="font-lexend-bold text-3xl text-slate-900 dark:text-white mb-2 text-center">
            Welcome to Qefas Hub
          </Text>
          <Text className="font-lexend text-slate-500 dark:text-slate-400 text-center text-base">
            How will you be using the application today?
          </Text>
        </View>

        <View className="flex-1 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.7}
                onPress={() => setSelectedRole(role.id)}
                className={cn(
                  "flex-row items-center p-5 rounded-[24px] border-2 transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5 dark:border-primary-container dark:bg-primary-container/10" 
                    : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900",
                )}
              >
                <View className={cn("w-14 h-14 rounded-2xl items-center justify-center mr-4", role.color)}>
                  <Icon size={28} className={role.textColor} />
                </View>
                <View className="flex-1">
                  <Text className={cn(
                    "font-lexend-bold text-lg mb-1", 
                    isSelected ? "text-primary dark:text-primary-container" : "text-slate-900 dark:text-white"
                  )}>
                    {role.title}
                  </Text>
                  <Text className="font-lexend text-sm text-slate-500 dark:text-slate-400">
                    Sign in as a {role.title.toLowerCase()}
                  </Text>
                </View>
                <View className={cn(
                  "w-6 h-6 rounded-full border-2 items-center justify-center",
                  isSelected ? "border-primary bg-primary dark:border-primary-container dark:bg-primary-container" : "border-slate-300 dark:border-slate-600 bg-transparent"
                )}>
                  {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button 
          onPress={handleContinue}
          disabled={!selectedRole}
          className={cn("mt-6 mb-4 shadow-md", selectedRole ? "bg-primary dark:bg-primary-container opacity-100" : "opacity-50")}
          size="lg"
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}
