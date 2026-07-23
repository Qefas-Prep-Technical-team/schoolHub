import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Hash, Briefcase, Fingerprint, ShieldCheck, Phone, CheckCircle2, School, Settings, ShieldAlert, Smartphone, Lock, Eye, EyeOff, ChevronLeft, Activity } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LogoutButton } from '../components/ui/LogoutButton';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function AdminProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'admin' | 'school'>('admin');

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

  const inputBorder = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HERO SECTION */}
        <View className="relative h-64 bg-slate-900 w-full overflow-hidden">
          <View className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl opacity-50" />
          <Image source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop' }} className="w-full h-full opacity-80 absolute inset-0" />
          
          <View className="absolute inset-0 bg-black/20" />
          
          <SafeAreaView edges={['top']} style={{ position: 'absolute', left: 0, right: 0, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, paddingTop: 16 }}>
            <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30">
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white font-black text-xl italic tracking-widest uppercase">ID.Card</Text>
            <TouchableOpacity onPress={() => router.push('/(admin-tabs)/settings')} className="h-10 w-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30">
              <Settings size={20} color="#ffffff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* PROFILE OVERLAP */}
        <View className="px-6 -mt-16 mb-8 items-center z-20">
          <View className="relative">
            <View className="h-32 w-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-950 items-center justify-center overflow-hidden shadow-2xl p-1">
              <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Admin' }} className="w-full h-full rounded-[1.7rem]" />
            </View>
            <View className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-xl border-4 border-slate-50 dark:border-slate-950 items-center justify-center">
              <CheckCircle2 size={16} color="white" />
            </View>
          </View>
          
          <View className="items-center mt-4 space-y-1">
            <Text className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">System Admin</Text>
            <View className="flex-row items-center gap-2">
              <View className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Super Admin</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5 mt-2">
              <Fingerprint size={12} color="#94a3b8" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Authorized System Administrator</Text>
            </View>
          </View>
        </View>

        {/* TAB TOGGLE */}
        <View className="px-6 mb-8">
          <View className="flex-row p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-800">
            <TouchableOpacity 
              onPress={() => setActiveTab('admin')}
              className={`flex-1 py-3 rounded-full items-center justify-center ${activeTab === 'admin' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Admin Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('school')}
              className={`flex-1 py-3 rounded-full items-center justify-center ${activeTab === 'school' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'school' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>School Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'admin' ? (
          <View key="admin-tab">
            {/* QUICK STATS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingBottom: 24 }}>
              <StatCard icon={<Hash size={20} />} label="Reg ID" value="ADM-001" color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" />
              <StatCard icon={<ShieldCheck size={20} />} label="Level" value="Super User" color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
              <StatCard icon={<Briefcase size={20} />} label="Dept" value="Management" color="text-amber-600 bg-amber-50 dark:bg-amber-500/10" />
            </ScrollView>

            {/* PERSONAL DATA */}
            <View className="px-6 mb-6">
              <View className="p-5 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center gap-3 mb-2 px-2 pt-2">
                  <User size={20} color="#6366f1" />
                  <Text className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Personal Data</Text>
                </View>
                
                <View className="mt-2">
                  <InfoItem icon={<User size={18} />} label="Legal Name" value="System Admin" description="Verified registration name." />
                  <InfoItem icon={<Mail size={18} />} label="Email" value="admin@schoolhub.edu" description="Primary contact address." />
                  <InfoItem icon={<Phone size={18} />} label="Phone" value="+1 (555) 123-4567" description="Direct contact number." isLast />
                </View>
              </View>
            </View>

            {/* ATTRIBUTES */}
            <View className="px-6 mb-6">
              <View className="p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 space-y-6">
                <Text className="text-lg font-black text-indigo-900 dark:text-indigo-400 uppercase italic tracking-tight mb-2">Attributes</Text>
                <View className="flex-row flex-wrap gap-y-6">
                  <AttributeItem label="Role" value="Administrator" />
                  <AttributeItem label="Clearance" value="Level 5" />
                  <AttributeItem label="Status" value="Active" />
                  <AttributeItem label="System" value="Online" />
                </View>
              </View>
            </View>

            {/* SECURITY & ACCESS */}
            <View className="px-6 mb-6">
              <Text className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-4 ml-2">Security & Access</Text>
              <View className="flex-row flex-wrap justify-between">
                {/* Change Password Bento */}
                <TouchableOpacity onPress={() => setIsPasswordModalOpen(true)} className="w-[48%] bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 items-center justify-center shadow-sm">
                  <View className="h-14 w-14 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/30 items-center justify-center mb-3">
                    <ShieldAlert size={26} color="#3b82f6" />
                  </View>
                  <Text className="font-LexendBold text-slate-900 dark:text-white text-center">Password</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Update key</Text>
                </TouchableOpacity>

                {/* Sessions Bento */}
                <TouchableOpacity className="w-[48%] bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 items-center justify-center shadow-sm">
                  <View className="h-14 w-14 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center mb-3">
                    <Smartphone size={26} color="#10b981" />
                  </View>
                  <Text className="font-LexendBold text-slate-900 dark:text-white text-center">Sessions</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">2 Active</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DANGER ZONE */}
            <View className="px-6 mb-6">
              <View className="bg-red-50 dark:bg-red-950/20 p-2 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 shadow-sm">
                <LogoutButton />
              </View>
            </View>
          </View>
        ) : (
          <View key="school-tab">
            {/* SCHOOL STATS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingBottom: 24 }}>
              <StatCard icon={<School size={20} />} label="Type" value="High School" color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" />
              <StatCard icon={<User size={20} />} label="Students" value="1,240" color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
              <StatCard icon={<Briefcase size={20} />} label="Teachers" value="85" color="text-amber-600 bg-amber-50 dark:bg-amber-500/10" />
            </ScrollView>

            {/* INSTITUTION DETAILS */}
            <View className="px-6 mb-6">
              <View className="p-6 rounded-[2.5rem] bg-slate-950 shadow-xl space-y-6">
                <View className="flex-row items-center gap-3 mb-2">
                  <School size={24} color="#818cf8" />
                  <Text className="text-xl font-black text-white uppercase italic tracking-tight">Institution</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="space-y-1">
                    <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Academy</Text>
                    <Text className="text-lg font-black text-white italic">Qefas-Prep Academy</Text>
                  </View>
                  <View className="space-y-1 items-end">
                    <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est.</Text>
                    <Text className="text-lg font-black text-white italic">1998</Text>
                  </View>
                </View>
                
                <View className="h-px bg-white/10 w-full my-2" />
                
                <View className="flex-row items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <View className="h-8 w-8 rounded-full bg-emerald-500/20 items-center justify-center">
                    <CheckCircle2 size={16} color="#34d399" />
                  </View>
                  <Text className="text-xs text-slate-300 font-medium italic flex-1">Institution is fully accredited and active.</Text>
                </View>
              </View>
            </View>
            
            {/* CONTACT DETAILS */}
            <View className="px-6 mb-6">
              <View className="p-5 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center gap-3 mb-2 px-2 pt-2">
                  <Phone size={20} color="#10b981" />
                  <Text className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Contact Info</Text>
                </View>
                
                <View className="mt-2">
                  <InfoItem icon={<Phone size={18} />} label="Main Office" value="+1 (555) 987-6543" description="General inquiries." />
                  <InfoItem icon={<Mail size={18} />} label="Support Email" value="support@qefasprep.edu" description="Technical and administrative support." isLast />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <View className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex-row items-center gap-4 shadow-sm min-w-[160px]">
      <View className={`h-12 w-12 rounded-2xl items-center justify-center ${color}`}>
        {icon}
      </View>
      <View>
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</Text>
        <Text className="text-base font-black text-slate-900 dark:text-white truncate">{value}</Text>
      </View>
    </View>
  );
}

function InfoItem({ icon, label, value, description, isLast = false }: { icon: React.ReactNode, label: string, value: string, description: string, isLast?: boolean }) {
  return (
    <View className={`flex-row gap-4 items-center py-4 px-2 ${!isLast ? 'border-b border-slate-100 dark:border-slate-800/60' : ''}`}>
      <View className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</Text>
        <Text className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">{value}</Text>
        <Text className="text-[10px] font-bold text-slate-500 italic mt-0.5">{description}</Text>
      </View>
    </View>
  );
}

function AttributeItem({ label, value }: { label: string, value: string }) {
  return (
    <View className="w-1/2 pr-4">
      <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</Text>
      <Text className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
