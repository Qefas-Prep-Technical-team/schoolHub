import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image, Modal, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, SunMoon, ShieldAlert, ChevronRight, School, Bell, Lock, Smartphone, Monitor, Eye, EyeOff } from 'lucide-react-native';
import { useColorScheme, useThemeControls } from '@/hooks/use-color-scheme';
import { LogoutButton } from '../../components/ui/LogoutButton';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams } from 'expo-router';

type Tab = 'general' | 'school' | 'account';

export default function AdminSettingsScreen() {
  const colorScheme = useColorScheme();
  const { toggleColorScheme } = useThemeControls();
  const isDark = colorScheme === 'dark';

  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((params.tab as Tab) || 'general');

  React.useEffect(() => {
    if (params.tab && ['general', 'school', 'account'].includes(params.tab as string)) {
      setActiveTab(params.tab as Tab);
    }
  }, [params.tab]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all password fields.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mismatch', text2: 'New passwords do not match.' });
      return;
    }
    Toast.show({ type: 'success', text1: 'Success', text2: 'Password updated successfully!' });
    setIsPasswordModalOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Colors computed from isDark to avoid complex NativeWind modifiers
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#f1f5f9';
  const sectionBg = isDark ? '#0f172a' : '#f8fafc';
  const inputBorder = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#020617' : '#f8fafc' }]}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0f172a' }]}>
            Settings
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            System & Preferences
          </Text>
        </View>

        {/* Inner Tab Navigation */}
        <View style={styles.tabBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.tabBar, { backgroundColor: isDark ? '#0f172a' : '#e2e8f0', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>

              {(['general', 'school', 'account'] as Tab[]).map((tab) => {
                const isActive = activeTab === tab;
                const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                const IconComponent = tab === 'general' ? Settings : tab === 'school' ? School : User;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      styles.tabItem,
                      isActive && { backgroundColor: isDark ? '#1e293b' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 }
                    ]}
                  >
                    <View style={{ marginRight: 8 }}>
                      <IconComponent size={16} color={isActive ? (isDark ? '#fff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b')} />
                    </View>
                    <Text style={[styles.tabLabel, { color: isActive ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b') }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

            </View>
          </ScrollView>
        </View>

        {/* Content Area */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>

          {/* ===== GENERAL TAB ===== */}
          {activeTab === 'general' && (
            <View>
              <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Display & Theme</Text>

              <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                {/* Dark Mode */}
                <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
                      <SunMoon size={20} color="#3b82f6" />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Dark Mode</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>Toggle system appearance</Text>
                    </View>
                  </View>
                  <Switch value={isDark} onValueChange={toggleColorScheme} trackColor={{ false: '#e2e8f0', true: '#3b82f6' }} thumbColor="#fff" />
                </View>

                {/* Push Notifications */}
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: '#eef2ff', borderColor: '#e0e7ff' }]}>
                      <Bell size={20} color="#6366f1" />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Push Notifications</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>Alerts for system events</Text>
                    </View>
                  </View>
                  <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#e2e8f0', true: '#6366f1' }} thumbColor="#fff" />
                </View>
              </View>
            </View>
          )}

          {/* ===== SCHOOL TAB ===== */}
          {activeTab === 'school' && (
            <View>
              <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Global Configurations</Text>

              <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                {/* Academic Year */}
                <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' }]}>
                      <School size={20} color="#10b981" />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Academic Year</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>Current: 2026/2027</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                </TouchableOpacity>

                {/* Student Registration */}
                <View style={styles.row}>
                  <View style={[styles.rowLeft, { flex: 1, paddingRight: 16 }]}>
                    <View style={[styles.iconCircle, { backgroundColor: '#fffbeb', borderColor: '#fef3c7' }]}>
                      <Lock size={20} color="#f59e0b" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Student Registration</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>Allow new students to register</Text>
                    </View>
                  </View>
                  <Switch value={registrationOpen} onValueChange={setRegistrationOpen} trackColor={{ false: '#e2e8f0', true: '#f59e0b' }} thumbColor="#fff" />
                </View>
              </View>
            </View>
          )}

          {/* ===== ACCOUNT TAB ===== */}
          {activeTab === 'account' && (
            <View>
              <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Profile Information</Text>

              <View style={[styles.card, { backgroundColor: cardBg, borderColor, padding: 20, marginBottom: 32 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.avatar, { borderColor: isDark ? '#3730a3' : '#c7d2fe' }]}>
                    <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Admin' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.profileName, { color: isDark ? '#fff' : '#0f172a' }]}>System Admin</Text>
                    <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>admin@schoolhub.edu</Text>
                    <View style={[styles.badge, { backgroundColor: isDark ? '#1e1b4b' : '#e0e7ff', borderColor: isDark ? '#3730a3' : '#c7d2fe' }]}>
                      <Text style={[styles.badgeText, { color: isDark ? '#818cf8' : '#4338ca' }]}>SUPER ADMIN</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Security</Text>

              <TouchableOpacity onPress={() => setIsPasswordModalOpen(true)} style={[styles.card, { backgroundColor: cardBg, borderColor, marginBottom: 32 }]}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                      <ShieldAlert size={20} color={isDark ? '#e2e8f0' : '#475569'} />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Change Password</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>Update your account password</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                </View>
              </TouchableOpacity>

              <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Active Sessions</Text>

              <View style={[styles.card, { backgroundColor: cardBg, borderColor, marginBottom: 32 }]}>
                {/* Session 1 - Current */}
                <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderColor: isDark ? '#1e40af' : '#bfdbfe' }]}>
                      <Smartphone size={20} color="#3b82f6" />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>iPhone 15 Pro</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>SchoolHub App • Active now</Text>
                    </View>
                  </View>
                  <View style={[styles.sessionBadge, { backgroundColor: isDark ? '#052e16' : '#d1fae5', borderColor: isDark ? '#166534' : '#a7f3d0' }]}>
                    <Text style={[styles.sessionBadgeText, { color: isDark ? '#4ade80' : '#065f46' }]}>Current</Text>
                  </View>
                </View>

                {/* Session 2 */}
                <View style={styles.row}>
                  <View style={[styles.rowLeft, { flex: 1 }]}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                      <Monitor size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#0f172a' }]}>MacBook Pro</Text>
                      <Text style={[styles.rowSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>Chrome • 2 hours ago</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 12, fontFamily: 'LexendBold', color: '#f43f5e' }}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Danger Zone</Text>
              <View style={[styles.card, { backgroundColor: cardBg, borderColor: isDark ? '#4c0519' : '#ffe4e6', padding: 8, marginBottom: 32 }]}>
                <LogoutButton />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ===== PASSWORD MODAL ===== */}
      <Modal visible={isPasswordModalOpen} transparent animationType="slide" onRequestClose={() => setIsPasswordModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}>

            <View style={styles.modalHeader}>
              <View style={[styles.modalHandle, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
              <View style={[styles.modalIconWrap, { backgroundColor: isDark ? '#1e3a5f' : '#eff6ff' }]}>
                <ShieldAlert size={28} color="#3b82f6" />
              </View>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Update Password</Text>
              <Text style={[styles.modalSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Ensure your account stays secure by using a strong password.
              </Text>
            </View>

            {/* Fields */}
            {[
              { label: 'Current Password', key: 'currentPassword' as const },
              { label: 'New Password', key: 'newPassword' as const },
              { label: 'Confirm New Password', key: 'confirmPassword' as const },
            ].map(({ label, key }, idx) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#cbd5e1' : '#374151' }]}>{label}</Text>
                <View style={[styles.inputRow, { backgroundColor: isDark ? '#020617' : '#f8fafc', borderColor: inputBorder }]}>
                  <Lock size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                  <TextInput
                    style={[styles.input, { color: isDark ? '#fff' : '#0f172a' }]}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                    secureTextEntry={!showPassword}
                    value={passwordData[key]}
                    onChangeText={(t) => setPasswordData({ ...passwordData, [key]: t })}
                  />
                  {idx === 0 && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsPasswordModalOpen(false)} style={[styles.modalBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={[styles.modalBtnText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdatePassword} style={[styles.modalBtn, { backgroundColor: '#2563eb' }]}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, marginTop: 8 },
  title: { fontSize: 30, fontFamily: 'LexendBold', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: 'Lexend', marginTop: 4 },
  tabBarWrapper: { paddingHorizontal: 24, marginBottom: 24, height: 48 },
  tabBar: { flexDirection: 'row', borderRadius: 999, padding: 4, borderWidth: 1 },
  tabItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  tabLabel: { fontFamily: 'LexendBold', fontSize: 14 },
  sectionLabel: { fontSize: 12, fontFamily: 'LexendBold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 4 },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { fontSize: 15, fontFamily: 'LexendBold', marginBottom: 2 },
  rowSub: { fontSize: 12, fontFamily: 'Lexend' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1 },
  avatar: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', marginRight: 16, borderWidth: 2, backgroundColor: '#eef2ff' },
  profileName: { fontSize: 18, fontFamily: 'LexendBold', marginBottom: 4 },
  badge: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 10, fontFamily: 'LexendBold', letterSpacing: 1 },
  sessionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  sessionBadgeText: { fontSize: 11, fontFamily: 'LexendBold' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 48 },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalHandle: { width: 48, height: 6, borderRadius: 3, marginBottom: 20 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontFamily: 'LexendBold', textAlign: 'center' },
  modalSub: { fontSize: 13, fontFamily: 'Lexend', textAlign: 'center', marginTop: 8, paddingHorizontal: 16 },
  fieldLabel: { fontSize: 12, fontFamily: 'LexendBold', marginBottom: 8, marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, marginLeft: 12, fontFamily: 'Lexend', fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  modalBtnText: { fontFamily: 'LexendBold', fontSize: 15 },
});
