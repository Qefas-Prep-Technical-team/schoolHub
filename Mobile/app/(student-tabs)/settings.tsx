import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudentProfile, useUpdateDepartment, useUpdateLevel, useSchoolDepartments, useUpdatePassword, useDeviceSessions, useRevokeSession } from '@/lib/api/hooks/useStudent';
import { useColorScheme, useThemeControls } from '@/hooks/use-color-scheme';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { User, Mail, Fingerprint, Settings, Bell, SunMoon, Lock, ArrowLeft, Building2, GraduationCap, School, ShieldAlert, CheckCircle2, Eye, EyeOff, Smartphone, Monitor, Globe, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { showInfoToast, showErrorToast } from '@/lib/utils/toast';
import { clearTokens, clearUserRole } from '@/lib/auth/secure-store';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsScreen() {
  const { data: profile, isLoading } = useStudentProfile();
  const { data: departments = [], isLoading: isDeptsLoading } = useSchoolDepartments(profile?.schoolId);
  const updateDepartment = useUpdateDepartment();
  const updateLevel = useUpdateLevel();
  const updatePassword = useUpdatePassword();
  const { data: sessions, isLoading: isSessionsLoading } = useDeviceSessions();
  const revokeSession = useRevokeSession();

  const colorScheme = useColorScheme();
  const { toggleColorScheme } = useThemeControls();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<'general' | 'academic' | 'account'>('general');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const queryClient = useQueryClient();

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (profile?.departmentId) setSelectedDept(profile.departmentId);
    if (profile?.level) setSelectedLevel(profile.level);
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 opacity-50" />
          <View className="ml-4 flex-1">
            <View className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
          </View>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {/* Tabs Skeleton */}
          <View className="flex-row mb-8">
            <View className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mr-3 opacity-50" />
            <View className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mr-3 opacity-50" />
            <View className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
          </View>

          {/* Cards Skeleton */}
          {[1, 2, 3].map((item) => (
            <View key={item} className="mb-6 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-50">
              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 mr-4" />
                <View className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </View>
              <View className="h-14 w-full bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4" />
              <View className="h-14 w-full bg-slate-50 dark:bg-slate-800 rounded-2xl" />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isLocked = !!profile.departmentId;
  const isLevelLocked = !!profile.level;
  const schoolLevels: string[] = profile.school?.levels || [];
  const initials = profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const handleUpdateDept = () => {
    if (!selectedDept) {
      showInfoToast({ title: 'Missing Selection', message: 'Please select a department first.' });
      return;
    }
    updateDepartment.mutate(selectedDept, {
      onSuccess: () => setIsDeptModalOpen(false)
    });
  };

  const handleUpdateLevel = () => {
    if (!selectedLevel) {
      showInfoToast({ title: 'Missing Selection', message: 'Please select a level first.' });
      return;
    }
    updateLevel.mutate(selectedLevel, {
      onSuccess: () => setIsLevelModalOpen(false)
    });
  };

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorToast({ title: 'Password Mismatch', message: 'New passwords do not match.' });
      return;
    }
    updatePassword.mutate(passwordData, {
      onSuccess: () => {
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type.includes('mobile') || type.includes('tablet')) return <Smartphone size={20} />;
    if (type.includes('desktop') || type.includes('mac') || type.includes('windows')) return <Monitor size={20} />;
    return <Globe size={20} />;
  };

  const handleLogout = async () => {
    try {
      await clearTokens();
      await clearUserRole();
      queryClient.clear();
      // Route to '/' so index.tsx re-evaluates auth state
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* HEADER */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full items-center justify-center mr-4">
          <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-2xl font-black italic uppercase text-slate-900 dark:text-white tracking-widest">Settings</Text>
      </View>

      {/* TABS */}
      <View className="px-6 mb-4">
        <View className="flex-row p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <TabButton title="General" isActive={activeTab === 'general'} onPress={() => setActiveTab('general')} color="bg-pink-600" />
          <TabButton title="Academic" isActive={activeTab === 'academic'} onPress={() => setActiveTab('academic')} color="bg-rose-600" />
          <TabButton title="Account" isActive={activeTab === 'account'} onPress={() => setActiveTab('account')} color="bg-pink-500" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        {activeTab === 'general' && (
          <View className="flex-col gap-6">
            <View className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-3 mb-6 px-2">
                <User className="text-pink-600" size={20} />
                <Text className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">Personal Info</Text>
              </View>
              
              <View className="flex-col gap-0">
                <View className="py-4 px-2 border-b border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</Text>
                  <Text className="text-base font-bold text-slate-900 dark:text-white mt-1">{profile.name}</Text>
                </View>
                <View className="py-4 px-2 border-b border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</Text>
                  <Text className="text-base font-bold text-slate-900 dark:text-white mt-1">{profile.email}</Text>
                </View>
                <View className="py-4 px-2 border-b border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Code</Text>
                  <Text className="text-base font-bold text-slate-900 dark:text-white mt-1">#{profile.studentCode}</Text>
                </View>
                <View className="py-4 px-2">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <View className={`h-2 w-2 rounded-full ${profile.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <Text className="text-base font-black text-slate-900 dark:text-white">{profile.verified ? 'Active & Verified' : 'Pending Verification'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* App Preferences Card */}
            <View className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-3 mb-6 px-2">
                <SunMoon className="text-indigo-600" size={20} />
                <Text className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">App Preferences</Text>
              </View>
              
              <View className="flex-col gap-0">
                <View className="flex-row items-center justify-between py-4 px-2">
                  <View className="flex-1">
                    <Text className="font-bold text-slate-900 dark:text-white">Dark Mode</Text>
                    <Text className="text-xs text-slate-500 font-medium mt-0.5">Toggle app visual theme</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={toggleColorScheme} 
                    className={`w-14 h-8 rounded-full flex-row items-center px-1 ${isDark ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                  >
                    <View className="w-6 h-6 bg-white rounded-full items-center justify-center shadow-sm">
                      <SunMoon size={12} color={isDark ? '#4f46e5' : '#94a3b8'} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'academic' && (
          <View className="flex-col gap-8">
            {/* Department Setup */}
            <View className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                  <Building2 className="text-pink-500" size={20} />
                  <Text className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">Department</Text>
                </View>
                {isLocked && (
                  <View className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex-row items-center gap-1">
                    <CheckCircle2 size={12} color="#10b981" />
                    <Text className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">Locked</Text>
                  </View>
                )}
              </View>

              {!isLocked ? (
                <View className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded-xl mb-4 flex-row gap-3">
                  <ShieldAlert size={20} color="#f59e0b" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="font-bold text-amber-900 dark:text-amber-200 text-sm uppercase tracking-tight">One-Time Choice</Text>
                    <Text className="text-amber-700 dark:text-amber-400 text-xs mt-1">Department selection is restricted to a single update. Ensure your choice is accurate.</Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 mb-4 items-center">
                  <Lock size={16} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 flex-1">Updates are currently locked. Contact administration for changes.</Text>
                </View>
              )}

              {!profile.schoolId ? (
                <Text className="text-sm font-bold text-slate-400 text-center py-4">Please link to a school first.</Text>
              ) : (
                <View>
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Field</Text>
                  <TouchableOpacity 
                    disabled={isLocked || isDeptsLoading} 
                    onPress={() => setIsDeptModalOpen(true)}
                    className="h-14 px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex-row items-center justify-between"
                  >
                    <Text className={`font-bold ${selectedDept || isLocked ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {isLocked 
                        ? (profile.department?.name || 'Department Locked') 
                        : isDeptsLoading 
                          ? 'Loading...' 
                          : (departments.find((d: any) => d.id === selectedDept)?.name || 'Choose Department')}
                    </Text>
                  </TouchableOpacity>
                  
                  {!isLocked && (
                    <TouchableOpacity 
                      onPress={handleUpdateDept}
                      disabled={updateDepartment.isPending || !selectedDept}
                      className="h-14 mt-4 bg-pink-600 rounded-2xl items-center justify-center flex-row"
                    >
                      {updateDepartment.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-black uppercase text-white tracking-widest">Lock In Selection</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Level Setup */}
            <View className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                  <GraduationCap className="text-rose-500" size={20} />
                  <Text className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">Academic Level</Text>
                </View>
                {isLevelLocked && (
                  <View className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex-row items-center gap-1">
                    <CheckCircle2 size={12} color="#10b981" />
                    <Text className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">Locked</Text>
                  </View>
                )}
              </View>

              {!isLevelLocked ? (
                <View className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded-xl mb-4 flex-row gap-3">
                  <ShieldAlert size={20} color="#f59e0b" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="font-bold text-amber-900 dark:text-amber-200 text-sm uppercase tracking-tight">One-Time Choice</Text>
                    <Text className="text-amber-700 dark:text-amber-400 text-xs mt-1">Level selection is permanent. Only the school can update it after.</Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 mb-4 items-center">
                  <Lock size={16} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 flex-1">Level is locked. Contact your school administrator to change it.</Text>
                </View>
              )}

              {!profile.schoolId ? (
                <Text className="text-sm font-bold text-slate-400 text-center py-4">Link to a school to see available levels.</Text>
              ) : schoolLevels.length === 0 ? (
                <Text className="text-sm font-bold text-slate-400 text-center py-4">No levels configured by the school.</Text>
              ) : (
                <View>
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Level</Text>
                  <TouchableOpacity 
                    disabled={isLevelLocked} 
                    onPress={() => setIsLevelModalOpen(true)}
                    className="h-14 px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex-row items-center justify-between"
                  >
                    <Text className={`font-bold ${selectedLevel ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {selectedLevel || 'Choose Level'}
                    </Text>
                  </TouchableOpacity>
                  
                  {!isLevelLocked && (
                    <TouchableOpacity 
                      onPress={handleUpdateLevel}
                      disabled={updateLevel.isPending || !selectedLevel}
                      className="h-14 mt-4 bg-rose-600 rounded-2xl items-center justify-center flex-row"
                    >
                      {updateLevel.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-black uppercase text-white tracking-widest">Lock In Selection</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'account' && (
          <View className="flex-col gap-8">
            <View className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-3 mb-6 px-2">
                <Settings className="text-violet-600" size={20} />
                <Text className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">Account Preferences</Text>
              </View>

              <View className="flex-col gap-0">
                <View className="flex-row items-center justify-between py-6 px-2 border-b border-slate-100 dark:border-slate-800">
                  <View className="flex-row gap-4 flex-1">
                    <View className="h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 items-center justify-center">
                      <Lock className="text-violet-600" size={20} />
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="font-bold text-slate-900 dark:text-white">Security</Text>
                      <Text className="text-xs text-slate-500 font-medium mt-0.5">Password & Authentication</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setIsPasswordModalOpen(true)} className="h-9 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 items-center justify-center">
                    <Text className="font-bold text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300">Change</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between opacity-60 py-6 px-2">
                  <View className="flex-row gap-4 flex-1">
                    <View className="h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 items-center justify-center">
                      <Bell className="text-violet-600" size={20} />
                    </View>
                    <View className="flex-1 justify-center">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-bold text-slate-900 dark:text-white">Notifications</Text>
                        <View className="px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20">
                          <Text className="text-[8px] uppercase font-black text-violet-600 tracking-widest">Soon</Text>
                        </View>
                      </View>
                      <Text className="text-xs text-slate-500 font-medium mt-0.5">Control alerts</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* DEVICE SESSIONS */}
            <View className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center justify-between mb-6 px-2">
                <View className="flex-row items-center gap-3">
                  <Smartphone className="text-indigo-600" size={20} />
                  <Text className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">Logged-in Devices</Text>
                </View>
                {isSessionsLoading && <ActivityIndicator size="small" color="#4f46e5" />}
              </View>
              <View className="flex-col gap-4">
                {sessions?.length === 0 ? (
                  <Text className="text-sm font-bold text-slate-400 px-2 py-4">No active devices found.</Text>
                ) : (
                  <>
                    {sessions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session: any) => (
                      <View key={session.id} className={`p-5 rounded-2xl border ${session.isCurrentDevice ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'}`}>
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center gap-3">
                            <View className={`h-10 w-10 rounded-xl items-center justify-center ${session.isCurrentDevice ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-slate-900 shadow-sm'}`}>
                              {getDeviceIcon(session.deviceType)}
                            </View>
                            <View>
                              <View className="flex-row items-center gap-2">
                                <Text className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{session.deviceModel || 'Unknown Device'}</Text>
                                {session.isCurrentDevice && (
                                  <View className="px-2 py-0.5 bg-indigo-500 rounded"><Text className="text-[8px] font-black uppercase text-white tracking-widest">Current</Text></View>
                                )}
                              </View>
                              <Text className="text-xs font-bold text-slate-500">{session.osVersion} â€¢ {session.ipAddress}</Text>
                            </View>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active: {new Date(session.lastActiveAt).toLocaleDateString()}</Text>
                          <TouchableOpacity 
                            onPress={() => revokeSession.mutate(session.id)}
                            disabled={revokeSession.isPending}
                            className={`h-8 px-4 rounded-xl flex-row items-center justify-center ${session.isCurrentDevice ? 'bg-slate-200 dark:bg-slate-800' : 'bg-rose-100 dark:bg-rose-900/30'}`}
                          >
                            {revokeSession.isPending && revokeSession.variables === session.id ? (
                              <ActivityIndicator size="small" color={session.isCurrentDevice ? '#64748b' : '#e11d48'} />
                            ) : (
                              <>
                                <LogOut size={12} color={session.isCurrentDevice ? (isDark ? '#cbd5e1' : '#475569') : '#e11d48'} className="mr-1" />
                                <Text className={`font-bold text-[10px] uppercase tracking-widest ${session.isCurrentDevice ? 'text-slate-600 dark:text-slate-300' : 'text-rose-600'}`}>{session.isCurrentDevice ? 'Log Out' : 'Revoke'}</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    {sessions && sessions.length > itemsPerPage && (
                      <View className="flex-row items-center justify-between mt-4">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sessions.length)} of {sessions.length}
                        </Text>
                        <View className="flex-row gap-2">
                          <TouchableOpacity 
                            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`h-8 px-3 rounded-xl items-center justify-center border border-slate-200 dark:border-slate-800 ${currentPage === 1 ? 'opacity-50' : 'bg-white dark:bg-slate-900'}`}
                          >
                            <Text className="font-bold text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300">Prev</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => setCurrentPage(p => Math.min(Math.ceil(sessions.length / itemsPerPage), p + 1))}
                            disabled={currentPage >= Math.ceil(sessions.length / itemsPerPage)}
                            className={`h-8 px-3 rounded-xl items-center justify-center border border-slate-200 dark:border-slate-800 ${currentPage >= Math.ceil(sessions.length / itemsPerPage) ? 'opacity-50' : 'bg-white dark:bg-slate-900'}`}
                          >
                            <Text className="font-bold text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300">Next</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* FULL SYSTEM LOGOUT */}
            <TouchableOpacity
              onPress={handleLogout}
              className="mt-2 flex-row items-center justify-center py-5 bg-rose-50 dark:bg-rose-900/20 rounded-[2rem] border border-rose-200 dark:border-rose-900/50"
            >
              <LogOut size={20} color="#e11d48" className="mr-2" />
              <Text className="text-sm font-black uppercase tracking-widest text-rose-600">
                Log Out Completely
              </Text>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>

      {/* DEPARTMENT MODAL */}
      <Modal visible={isDeptModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsDeptModalOpen(false)}>
        <View className="flex-1 bg-white dark:bg-slate-950 p-6">
          <Text className="text-xl font-black uppercase italic tracking-widest text-slate-900 dark:text-white mb-6">Select Department</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {departments.map((dept: any) => (
              <TouchableOpacity 
                key={dept.id} 
                onPress={() => { setSelectedDept(dept.id); setIsDeptModalOpen(false); }}
                className={`p-4 rounded-2xl mb-3 border-2 ${selectedDept === dept.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <Text className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{dept.name}</Text>
                <Text className="text-xs font-bold text-slate-400 tracking-widest">{dept.code}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* LEVEL MODAL */}
      <Modal visible={isLevelModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsLevelModalOpen(false)}>
        <View className="flex-1 bg-white dark:bg-slate-950 p-6">
          <Text className="text-xl font-black uppercase italic tracking-widest text-slate-900 dark:text-white mb-6">Select Level</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {schoolLevels.map((lvl: string) => (
              <TouchableOpacity 
                key={lvl} 
                onPress={() => { setSelectedLevel(lvl); setIsLevelModalOpen(false); }}
                className={`p-4 rounded-2xl mb-3 border-2 ${selectedLevel === lvl ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <Text className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{lvl}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* PASSWORD MODAL */}
      <Modal visible={isPasswordModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsPasswordModalOpen(false)}>
        <View className="flex-1 bg-white dark:bg-slate-950 p-6">
          <Text className="text-xl font-black uppercase italic tracking-widest text-slate-900 dark:text-white mb-6">Change Password</Text>
          <View className="flex-col gap-6">
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</Text>
              <View className="h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 flex-row items-center">
                <TextInput 
                  value={passwordData.currentPassword} 
                  onChangeText={t => setPasswordData({...passwordData, currentPassword: t})} 
                  secureTextEntry={!showPassword} 
                  className="flex-1 font-bold text-slate-900 dark:text-white" 
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>
            
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</Text>
              <View className="h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 flex-row items-center">
                <TextInput 
                  value={passwordData.newPassword} 
                  onChangeText={t => setPasswordData({...passwordData, newPassword: t})} 
                  secureTextEntry={!showPassword} 
                  className="flex-1 font-bold text-slate-900 dark:text-white" 
                />
              </View>
            </View>
            
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</Text>
              <View className="h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 flex-row items-center">
                <TextInput 
                  value={passwordData.confirmPassword} 
                  onChangeText={t => setPasswordData({...passwordData, confirmPassword: t})} 
                  secureTextEntry={!showPassword} 
                  className="flex-1 font-bold text-slate-900 dark:text-white" 
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleUpdatePassword}
              disabled={updatePassword.isPending || !passwordData.currentPassword || !passwordData.newPassword}
              className="h-14 mt-4 bg-violet-600 rounded-2xl items-center justify-center flex-row"
            >
              {updatePassword.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-black uppercase text-white tracking-widest">Update Security</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

function TabButton({ title, isActive, onPress, color }: { title: string, isActive: boolean, onPress: () => void, color: string }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`flex-1 h-12 items-center justify-center rounded-xl ${isActive ? color : 'bg-transparent'}`}
    >
      <Text className={`font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
