import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Hash, GraduationCap, Briefcase, Fingerprint, Cake, ShieldCheck, Phone, MapPin, Calendar, Edit3, X, Save, CheckCircle2, ChevronRight, School, Camera, Settings } from 'lucide-react-native';
import { useStudentProfile, useUpdateStudentProfile, useRequestEmailUpdate, useVerifyEmailUpdate } from '@/lib/api/hooks/useStudent';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { data: profile, isLoading } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const requestEmailUpdate = useRequestEmailUpdate();
  const verifyEmailUpdate = useVerifyEmailUpdate();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    profileImage: '',
    bannerImage: '',
    height: '',
    weight: '',
    club: '',
    favouriteColour: '',
    guardianName: '',
    guardianPhone: ''
  });

  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
  const [verificationCode, setVerificationCode] = useState('');

  const handleEdit = () => {
    if (!profile) return;
    setFormData({
      name: profile.name,
      email: profile.email,
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      profileImage: profile.profileImage || '',
      bannerImage: profile.bannerImage || '',
      height: profile.height?.toString() || '',
      weight: profile.weight?.toString() || '',
      club: profile.club || '',
      favouriteColour: profile.favouriteColour || '',
      guardianName: profile.guardianName || '',
      guardianPhone: profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || ''
    });
    setEmailStep('input');
    setVerificationCode('');
    setIsEditing(true);
  };

  const pickImage = async (field: 'profileImage' | 'bannerImage') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === 'bannerImage' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  const handleRequestEmailChange = () => {
    requestEmailUpdate.mutate(formData.email, {
      onSuccess: () => setEmailStep('verify')
    });
  };

  const handleVerifyEmail = () => {
    verifyEmailUpdate.mutate(verificationCode, {
      onSuccess: () => {
        setEmailStep('input');
        setVerificationCode('');
      }
    });
  };

  const handleSave = () => {
    const { email: _email, ...rest } = formData;
    updateProfile.mutate(rest, {
      onSuccess: () => setIsEditing(false)
    });
  };

  if (isLoading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const initials = profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HERO SECTION */}
        <View className="relative h-64 bg-slate-900 w-full overflow-hidden">
          {profile.bannerImage ? (
            <Image source={{ uri: profile.bannerImage }} className="w-full h-full opacity-80" />
          ) : (
            <View className="absolute inset-0 items-center justify-center bg-indigo-900">
              <View className="absolute w-64 h-64 bg-primary/30 rounded-full blur-3xl opacity-50" />
            </View>
          )}
          
          <View className="absolute inset-0 bg-black/20" />
          
          <SafeAreaView edges={['top']} className="absolute inset-x-0 px-6 flex-row justify-between items-center z-10 pt-4">
            <Text className="text-white font-black text-xl italic tracking-widest uppercase">ID.Card</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={handleEdit} className="h-10 px-4 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30">
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/settings')} className="h-10 w-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30">
                <Settings size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* PROFILE OVERLAP */}
        <View className="px-6 -mt-16 mb-8 items-center z-20">
          <View className="relative">
            <View className="h-32 w-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-950 items-center justify-center overflow-hidden shadow-2xl">
              {profile.profileImage ? (
                <Image source={{ uri: profile.profileImage }} className="w-full h-full" />
              ) : (
                <Text className="text-4xl font-black text-slate-400">{initials}</Text>
              )}
            </View>
            <View className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-xl border-4 border-slate-50 dark:border-slate-950 items-center justify-center">
              <CheckCircle2 size={16} color="white" />
            </View>
          </View>
          
          <View className="items-center mt-4 space-y-1">
            <Text className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{profile.name}</Text>
            <View className="flex-row items-center gap-2">
              <View className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{profile.studentCode}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5 mt-2">
              <Fingerprint size={12} color="#94a3b8" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Official Academic Identity</Text>
            </View>
          </View>
        </View>

        {/* QUICK STATS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingBottom: 24 }}>
          <StatCard icon={<Hash size={20} />} label="Reg ID" value={profile.studentCode} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" />
          <StatCard icon={<GraduationCap size={20} />} label="Level" value={profile.gradeLevel || 'Standard'} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
          <StatCard icon={<Briefcase size={20} />} label="Dept" value={profile.department?.name || 'General'} color="text-amber-600 bg-amber-50 dark:bg-amber-500/10" />
        </ScrollView>

        {/* PERSONAL DATA */}
        <View className="px-6 mb-6">
          <View className="p-5 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-3 mb-2 px-2 pt-2">
              <User size={20} className="text-indigo-500" />
              <Text className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Personal Data</Text>
            </View>
            
            <View className="mt-2">
              <InfoItem icon={<User size={18} />} label="Legal Name" value={profile.name} description="Verified registration name." />
              <InfoItem icon={<Mail size={18} />} label="Email" value={profile.email} description="Primary contact address." />
              <InfoItem icon={<ShieldCheck size={18} />} label="Gender" value={profile.gender || 'Not Specified'} description="Biological gender." />
              <InfoItem icon={<Cake size={18} />} label="Birth Date" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'} description="Official date of birth." />
              <InfoItem icon={<Phone size={18} />} label="Guardian Phone" value={profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || 'Not Linked'} description="Emergency contact number." isLast />
            </View>
          </View>
        </View>

        {/* INSTITUTION */}
        <View className="px-6 mb-6">
          <View className="p-6 rounded-[2.5rem] bg-slate-950 shadow-xl space-y-6">
            <View className="flex-row items-center gap-3 mb-2">
              <School size={24} className="text-indigo-400" />
              <Text className="text-xl font-black text-white uppercase italic tracking-tight">Institution</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="space-y-1">
                <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Academy</Text>
                <Text className="text-lg font-black text-white italic">{profile.school?.name || 'Qefas-Prep Academy'}</Text>
              </View>
              <View className="space-y-1 items-end">
                <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined</Text>
                <Text className="text-lg font-black text-white italic">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A'}</Text>
              </View>
            </View>
            
            <View className="h-px bg-white/10 w-full my-2" />
            
            <View className="flex-row items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <View className="h-8 w-8 rounded-full bg-emerald-500/20 items-center justify-center">
                <CheckCircle2 size={16} color="#34d399" />
              </View>
              <Text className="text-xs text-slate-300 font-medium italic flex-1">Your account is fully verified and compliant.</Text>
            </View>
          </View>
        </View>

        {/* EXTRA CURRICULAR */}
        <View className="px-6">
          <View className="p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 space-y-6">
            <Text className="text-lg font-black text-indigo-900 dark:text-indigo-400 uppercase italic tracking-tight mb-2">Attributes</Text>
            <View className="flex-row flex-wrap gap-y-6">
              <AttributeItem label="Club" value={profile.club || 'None'} />
              <AttributeItem label="Fav Colour" value={profile.favouriteColour || 'None'} />
              <AttributeItem label="Height" value={profile.height ? `${profile.height} cm` : 'N/A'} />
              <AttributeItem label="Weight" value={profile.weight ? `${profile.weight} kg` : 'N/A'} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={isEditing} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsEditing(false)}>
        <View className="flex-1 bg-white dark:bg-slate-950">
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <TouchableOpacity onPress={() => setIsEditing(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <X size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text className="font-black text-lg italic uppercase text-slate-900 dark:text-white">Edit Profile</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={updateProfile.isPending || formData.email !== profile.email || emailStep === 'verify'}
              className="h-10 px-4 items-center justify-center rounded-full bg-indigo-600 disabled:opacity-50"
            >
              {updateProfile.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-bold text-xs uppercase tracking-wider text-white">Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* Image Uploaders */}
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity onPress={() => pickImage('profileImage')} className="h-24 w-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <Image source={{ uri: formData.profileImage }} className="w-full h-full" />
                ) : (
                  <Camera size={24} color="#94a3b8" />
                )}
                <View className="absolute inset-x-0 bottom-0 bg-black/40 py-1 items-center">
                  <Text className="text-[8px] font-bold text-white uppercase tracking-widest">Avatar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage('bannerImage')} className="flex-1 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center overflow-hidden relative">
                {formData.bannerImage ? (
                  <Image source={{ uri: formData.bannerImage }} className="w-full h-full opacity-80" />
                ) : (
                  <Camera size={24} color="#94a3b8" />
                )}
                <View className="absolute inset-x-0 bottom-0 bg-black/40 py-1 items-center">
                  <Text className="text-[8px] font-bold text-white uppercase tracking-widest">Banner</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View className="flex-col gap-8 mt-4 pb-20">
              <InputGroup label="Legal Name">
                <TextInput value={formData.name} onChangeText={t => setFormData({...formData, name: t})} className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white" />
              </InputGroup>

              <InputGroup label="Communication Email">
                <View className="flex-row gap-2">
                  <TextInput 
                    value={formData.email} 
                    onChangeText={t => setFormData({...formData, email: t})} 
                    editable={emailStep === 'input'}
                    className="flex-1 h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white opacity-100 disabled:opacity-50" 
                  />
                  {formData.email !== profile.email && emailStep === 'input' && (
                    <TouchableOpacity onPress={handleRequestEmailChange} disabled={requestEmailUpdate.isPending} className="h-14 px-4 bg-primary items-center justify-center rounded-2xl">
                      {requestEmailUpdate.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-bold text-xs uppercase text-white tracking-widest">Verify</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </InputGroup>

              {emailStep === 'verify' && (
                <View className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900">
                  <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">Enter Verification Code</Text>
                  <View className="flex-row gap-2">
                    <TextInput 
                      value={verificationCode} 
                      onChangeText={setVerificationCode} 
                      keyboardType="number-pad"
                      className="flex-1 h-14 px-4 rounded-2xl bg-white dark:bg-slate-950 font-black text-center tracking-[1em]" 
                      maxLength={6}
                    />
                    <TouchableOpacity onPress={handleVerifyEmail} disabled={verifyEmailUpdate.isPending} className="h-14 px-4 bg-indigo-600 items-center justify-center rounded-2xl">
                      {verifyEmailUpdate.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-bold text-xs uppercase text-white tracking-widest">Submit</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View className="flex-row gap-4">
                <InputGroup label="Height (cm)" className="flex-1">
                  <TextInput value={formData.height} onChangeText={t => setFormData({...formData, height: t})} keyboardType="number-pad" className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white" />
                </InputGroup>
                <InputGroup label="Weight (kg)" className="flex-1">
                  <TextInput value={formData.weight} onChangeText={t => setFormData({...formData, weight: t})} keyboardType="number-pad" className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white" />
                </InputGroup>
              </View>

              <InputGroup label="Club / Activities">
                <TextInput value={formData.club} onChangeText={t => setFormData({...formData, club: t})} className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white" />
              </InputGroup>
              
              <InputGroup label="Guardian Phone">
                <TextInput value={formData.guardianPhone} onChangeText={t => setFormData({...formData, guardianPhone: t})} keyboardType="phone-pad" className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white" />
              </InputGroup>
            </View>
            <View className="h-40" />
          </ScrollView>
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

function InputGroup({ label, children, className = '' }: { label: string, children: React.ReactNode, className?: string }) {
  return (
    <View className={`flex-col gap-2 ${className}`}>
      <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</Text>
      {children}
    </View>
  );
}
