import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, useThemeControls } from '@/hooks/use-color-scheme';
import { ArrowLeft, Bell, Moon, LogOut, Shield, CircleHelp, Smartphone, Monitor, KeyRound, X, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { clearTokens, clearUserRole } from '@/lib/auth/secure-store';
import { useDeviceSessions, useRevokeSession, useUpdatePassword } from '@/lib/api/hooks/useStudent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useThemeControls();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childrenPage, setChildrenPage] = useState(0);
  const CHILDREN_PER_PAGE = 3;

  const { data: user } = useAuthUser();
  const isParent = user?.role === 'PARENT';
  const { data: children } = useParentChildren();
  const [defaultChildId, setDefaultChildId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isParent) {
      AsyncStorage.getItem('defaultChildId').then(id => {
        if (id) setDefaultChildId(id);
      });
    }
  }, [isParent]);

  const handleSelectDefaultChild = async (childId: string) => {
    setDefaultChildId(childId);
    await AsyncStorage.setItem('defaultChildId', childId);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network refresh request
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Password Modal State
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);

  const { data: sessions = [], isLoading: isSessionsLoading } = useDeviceSessions();
  const { mutate: revokeSession } = useRevokeSession();
  const { mutateAsync: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword();

  const handleChangePassword = async () => {
    try {
      await updatePassword({ oldPassword, newPassword });
      setPasswordChanged(true);
      setTimeout(() => {
        setPasswordModalVisible(false);
        setPasswordChanged(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (e) {
      // Toast notification handles the error
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await clearTokens();
      await clearUserRole();
      queryClient.clear();
      setLogoutModalVisible(false);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <ArrowLeft size={20} color={isDark ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-LexendBold text-slate-900 dark:text-white mr-10">
          Settings
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#ea580c"
            colors={['#ea580c']}
          />
        }
      >

        {/* Preferences */}
        <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Preferences
        </Text>
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">

          <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Bell size={20} color="#3b82f6" />
              </View>
              <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white">Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={'#ffffff'}
            />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Moon size={20} color={isDark ? '#ffffff' : '#0f172a'} />
              </View>
              <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white">Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={'#ffffff'}
            />
          </View>
        </View>

        {/* Default Child (Parent Only) */}
        {isParent && children && children.length > 0 && (
          <>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider mb-4 mt-4">
              Default Child
            </Text>
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
              {children.slice(childrenPage * CHILDREN_PER_PAGE, (childrenPage + 1) * CHILDREN_PER_PAGE).map((child, index, array) => {
                const isSelected = child.id === defaultChildId;
                const isLast = index === array.length - 1;
                return (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => handleSelectDefaultChild(child.id)}
                    className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <Users size={20} color="#ea580c" />
                      </View>
                      <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white">{child.name}</Text>
                    </View>
                    {isSelected && <CheckCircle2 size={20} color="#10b981" />}
                  </TouchableOpacity>
                );
              })}
              {children.length > CHILDREN_PER_PAGE && (
                <View className="flex-row items-center justify-between p-4 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <TouchableOpacity 
                    disabled={childrenPage === 0}
                    onPress={() => setChildrenPage(prev => Math.max(0, prev - 1))}
                    className={`px-4 py-2 rounded-xl ${childrenPage === 0 ? 'bg-slate-100 dark:bg-slate-800 opacity-50' : 'bg-orange-50 dark:bg-orange-900/20'}`}
                  >
                    <Text className={`text-xs font-LexendBold ${childrenPage === 0 ? 'text-slate-400' : 'text-orange-600'}`}>Prev</Text>
                  </TouchableOpacity>
                  <Text className="text-xs font-LexendMedium text-slate-500 dark:text-slate-400">
                    Page {childrenPage + 1} of {Math.ceil(children.length / CHILDREN_PER_PAGE)}
                  </Text>
                  <TouchableOpacity 
                    disabled={childrenPage >= Math.ceil(children.length / CHILDREN_PER_PAGE) - 1}
                    onPress={() => setChildrenPage(prev => Math.min(Math.ceil(children.length / CHILDREN_PER_PAGE) - 1, prev + 1))}
                    className={`px-4 py-2 rounded-xl ${childrenPage >= Math.ceil(children.length / CHILDREN_PER_PAGE) - 1 ? 'bg-slate-100 dark:bg-slate-800 opacity-50' : 'bg-orange-50 dark:bg-orange-900/20'}`}
                  >
                    <Text className={`text-xs font-LexendBold ${childrenPage >= Math.ceil(children.length / CHILDREN_PER_PAGE) - 1 ? 'text-slate-400' : 'text-orange-600'}`}>Next</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        {/* Security */}
        <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Security
        </Text>
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">

          <TouchableOpacity
            onPress={() => setPasswordModalVisible(true)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <KeyRound size={20} color="#a855f7" />
              </View>
              <View>
                <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white">Change Password</Text>
                <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">Update your login credentials</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Login Devices */}
        <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Active Sessions
        </Text>
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
          {isSessionsLoading ? (
            <View className="p-4 items-center">
              <ActivityIndicator color="#ea580c" />
            </View>
          ) : sessions.map((session: any, index: number) => {
            const Icon = session.deviceType === 'Mobile' ? Smartphone : Monitor;
            const isLast = index === sessions.length - 1;
            const deviceName = session.deviceModel || session.deviceType || 'Unknown Device';
            const location = session.ipAddress || 'Unknown Location';
            const date = new Date(session.lastActiveAt).toLocaleDateString();
            
            return (
              <View key={session.id} className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Icon size={20} color={isDark ? '#cbd5e1' : '#64748b'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white">{deviceName}</Text>
                    <Text className="text-xs font-Lexend text-slate-500 dark:text-slate-400">{session.osVersion || 'Unknown OS'} • {location}</Text>
                  </View>
                </View>
                <View className="items-end ml-2">
                  <Text className={`text-[10px] font-LexendBold ${session.isCurrentDevice ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {session.isCurrentDevice ? 'Active Now' : date}
                  </Text>
                  {!session.isCurrentDevice && (
                    <TouchableOpacity onPress={() => revokeSession(session.id)} className="mt-1 p-1">
                      <Text className="text-[10px] font-LexendMedium text-red-500">Revoke</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Support */}
        <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Support
        </Text>
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
          <TouchableOpacity 
            onPress={() => Linking.openURL('mailto:support@qefashub.com')}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <CircleHelp size={20} color="#f97316" />
              </View>
              <Text className="text-sm font-LexendMedium text-slate-900 dark:text-white">Help & Support</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex-row items-center justify-center gap-2 shadow-sm mb-12"
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <>
              <LogOut size={20} color="#ef4444" />
              <Text className="text-red-500 font-LexendBold text-sm">
                Sign Out
              </Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-LexendBold text-slate-900 dark:text-white">Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <X size={24} color={isDark ? '#cbd5e1' : '#64748b'} />
              </TouchableOpacity>
            </View>

            {passwordChanged ? (
              <View className="items-center py-10">
                <CheckCircle2 size={64} color="#10b981" />
                <Text className="text-lg font-LexendBold text-slate-900 dark:text-white mt-4">Password Updated!</Text>
                <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 mt-2 text-center">Your password has been successfully changed.</Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-LexendMedium text-slate-700 dark:text-slate-300 mb-2">Current Password</Text>
                <TextInput
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 text-slate-900 dark:text-white font-Lexend"
                  placeholder="Enter current password"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                />

                <Text className="text-sm font-LexendMedium text-slate-700 dark:text-slate-300 mb-2">New Password</Text>
                <TextInput
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 text-slate-900 dark:text-white font-Lexend"
                  placeholder="Enter new password"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                />

                <Text className="text-sm font-LexendMedium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</Text>
                <TextInput
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-8 text-slate-900 dark:text-white font-Lexend"
                  placeholder="Re-enter new password"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                />

                <TouchableOpacity
                  onPress={handleChangePassword}
                  className="bg-blue-600 rounded-2xl p-4 items-center mb-6 flex-row justify-center"
                  disabled={!oldPassword || !newPassword || newPassword !== confirmPassword || isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-LexendBold text-base">Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm items-center shadow-lg">
            <View className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full items-center justify-center mb-4">
              <LogOut size={32} color="#ef4444" />
            </View>
            <Text className="text-xl font-LexendBold text-slate-900 dark:text-white mb-2 text-center">
              Sign Out?
            </Text>
            <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 text-center mb-8 px-4">
              Are you sure you want to sign out of your Qefas Hub account? You will need to log back in to access your dashboard.
            </Text>

            <View className="flex-row items-center gap-4 w-full">
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center"
                disabled={isLoggingOut}
              >
                <Text className="text-slate-700 dark:text-slate-300 font-LexendBold text-sm">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 items-center justify-center flex-row gap-2"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-LexendBold text-sm">Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
