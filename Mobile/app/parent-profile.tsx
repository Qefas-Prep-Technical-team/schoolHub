import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNetwork } from '@/hooks/use-network';
import { 
  ArrowLeft, Mail, Phone, MapPin, Settings, Edit3, ShieldCheck, 
  Lock, Shield, Users, Globe, X, User
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useUpdateParentProfile } from '@/lib/api/hooks/useParent';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/lib/api/client';

export default function ParentProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { isConnected } = useNetwork();
  
  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useAuthUser();
  const { data: children = [], isLoading: isChildrenLoading, refetch: refetchChildren } = useParentChildren();
  const [imgError, setImgError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isConnected) return;
    setRefreshing(true);
    await Promise.all([refetchUser(), refetchChildren()]);
    setRefreshing(false);
  }, [isConnected, refetchUser, refetchChildren]);

  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateParentProfile();

  const handleOpenEdit = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    updateProfile({ name: editName, phone: editPhone }, {
      onSuccess: () => setEditModalVisible(false)
    });
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingImage(true);
        const uri = result.assets[0].uri;
        
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);

        const response = await apiClient.post('/upload/proxy', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const publicUrl = response.data?.data?.publicUrl;
        if (publicUrl) {
          updateProfile({ profileImage: publicUrl }, {
            onSuccess: () => refetchUser()
          });
        }
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isLoading = isUserLoading || isChildrenLoading;

  const placeholderUrl = user ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900` : '';
  const displayImage = (!imgError && user?.profileImage && user.profileImage !== "null" && user.profileImage !== "") 
    ? user.profileImage 
    : placeholderUrl;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <View className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/20 dark:bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
      <View className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <ScrollView 
        className="flex-1 z-10" 
        bounces={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#ea580c"
            colors={['#ea580c']}
          />
        }
      >
        {isLoading ? (
          <View className="flex flex-col pb-10 w-full">
            {/* HERO SKELETON */}
            <View className="h-[380px] bg-slate-200 dark:bg-slate-800/50 w-full opacity-70" />
            
            {/* CARDS SKELETON */}
            <View className="px-5 -mt-6 z-20 flex flex-col gap-8">
                {/* Stats Row Skeleton */}
                <View className="h-24 w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 opacity-70" />
                
                {/* Security Card Skeleton */}
                <View className="h-40 w-full bg-slate-200 dark:bg-slate-800/80 rounded-[2.5rem] opacity-70" />

                {/* Personal Details Card Skeleton */}
                <View className="h-80 w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 opacity-70" />
            </View>
          </View>
        ) : user ? (
          <View className="flex flex-col pb-10">
            {/* Full-bleed Background Hero */}
            <View className="relative w-full h-[380px]">
                <Image 
                    source={{ uri: displayImage }} 
                    style={{ width: '100%', height: '100%', position: 'absolute' }} 
                    contentFit="cover" 
                    onError={() => setImgError(true)}
                />
                
                <View className="absolute inset-0 bg-black/40" />
                
                <SafeAreaView className="flex-1 px-4 pt-2 z-10" edges={['top']}>
                    {/* Top Navigation */}
                    <View className="flex-row justify-between items-center mb-2 px-2">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                            <ArrowLeft size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/settings')} className="w-10 h-10 items-center justify-center">
                            <Settings size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Centered Profile Info */}
                    <View className="flex-1 items-center justify-center pb-8">
                        <TouchableOpacity 
                            onPress={handlePickImage} 
                            disabled={isUploadingImage || isUpdating} 
                            className="w-24 h-24 rounded-full border-2 border-white/40 overflow-hidden mb-4 shadow-lg relative group active:scale-95 transition-transform"
                        >
                            <Image 
                                source={{ uri: displayImage }} 
                                style={{ width: '100%', height: '100%' }} 
                                contentFit="cover" 
                            />
                            <View className="absolute inset-0 bg-black/40 items-center justify-center">
                                {isUploadingImage ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Edit3 size={20} color="#ffffff" opacity={0.8} />
                                )}
                            </View>
                        </TouchableOpacity>
                        
                        <Text className="text-2xl font-bold text-white tracking-tight mb-2 shadow-sm text-center px-6">
                            {user.name}
                        </Text>
                        <Text className="text-[13px] font-medium text-white/80 text-center px-10 leading-tight">
                            ID: {user.parentCode || 'PAR-HUB-XXXX'} • Primary Guardian
                        </Text>
                    </View>
                </SafeAreaView>
            </View>

            {/* Overlapping Content Area */}
            <View className="px-5 -mt-6 relative z-20 flex flex-col gap-8">
              
              {/* Stats row */}
              <View className="flex-row gap-4 w-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <View className="flex-1 items-center border-r border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-widest mb-1">Family Size</Text>
                  <Text className="text-2xl font-LexendBlack text-orange-600 tracking-tighter">{children.length}</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-widest mb-1">Account</Text>
                  <Text className="text-2xl font-LexendBlack text-emerald-500 tracking-tighter">Active</Text>
                </View>
              </View>

            {/* Security Card */}
            <View className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
              <View className="absolute -right-8 -top-8 w-40 h-40 bg-orange-600/30 rounded-full blur-3xl" />
              <View className="flex-row items-center gap-4 mb-6 relative z-10">
                <View className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                  <Lock color="#f97316" size={24} />
                </View>
                <View>
                  <Text className="text-lg font-LexendBlack text-white uppercase tracking-tight">Security</Text>
                  <Text className="text-[10px] font-LexendBlack text-orange-500 uppercase tracking-widest mt-0.5">Protected</Text>
                </View>
              </View>
              
              <TouchableOpacity className="active:scale-[0.98] transition-transform">
                <View className="w-full py-4 rounded-[1.5rem] bg-orange-600 flex-row items-center justify-center gap-3 shadow-xl shadow-orange-600/20">
                  <Shield size={18} color="#fff" />
                  <Text className="text-[11px] font-LexendBlack text-white uppercase tracking-widest">Manage Security</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Personal Details Card */}
            <View className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl border border-white/50 dark:border-white/5">
              <View className="flex-row items-center gap-4 mb-8">
                <View className="p-3 bg-slate-900 dark:bg-orange-600 rounded-2xl shadow-xl">
                  <ShieldCheck size={24} color="#fff" />
                </View>
                <View>
                  <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tighter">Personal Details</Text>
                  <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em] mt-1">Contact Info</Text>
                </View>
              </View>

              <View className="flex flex-col gap-8">
                <View className="flex-row items-center gap-4 group">
                  <View className="h-12 w-12 items-center justify-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <Mail size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em]">Email Address</Text>
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{user.email || 'N/A'}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4 group">
                  <View className="h-12 w-12 items-center justify-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <Phone size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em]">Phone Number</Text>
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{user.phone || 'N/A'}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4 group">
                  <View className="h-12 w-12 items-center justify-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <Globe size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em]">Language</Text>
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white mt-1 uppercase tracking-tight">English</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center gap-4 group">
                  <View className="h-12 w-12 items-center justify-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em]">Location</Text>
                    <Text className="text-sm font-LexendBlack text-slate-900 dark:text-white mt-1 uppercase tracking-tight">Nigeria</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleOpenEdit}
                className="mt-8 active:scale-[0.98] transition-transform shadow-xl shadow-orange-600/30 overflow-hidden rounded-[2rem]"
              >
                <LinearGradient 
                  colors={['#ea580c', '#f59e0b']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }}
                  className="p-5 items-center justify-center flex-row gap-3"
                >
                  <Edit3 size={20} color="#fff" />
                  <Text className="text-white font-LexendBlack text-[13px] uppercase tracking-widest">
                    Edit Profile
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Linked Children Card */}
            <View className="bg-slate-900 dark:bg-white/[0.03] rounded-[3rem] p-8 text-white dark:text-slate-100 relative overflow-hidden border border-white/5">
              <View className="absolute right-0 bottom-0 p-8 opacity-5 -rotate-12">
                <Users size={120} />
              </View>
              
              <View className="relative z-10 flex flex-col gap-10">
                <View className="flex-row justify-between items-start gap-4">
                  <View className="flex-1 flex flex-col gap-2">
                    <View className="bg-orange-600 px-3 py-1 rounded-full self-start">
                      <Text className="text-[9px] font-LexendBlack text-white uppercase tracking-widest">Family</Text>
                    </View>
                    <Text className="text-2xl font-LexendBlack uppercase tracking-tight text-white">Linked Children</Text>
                    <Text className="text-white/40 dark:text-slate-500 text-[10px] font-LexendBlack uppercase tracking-[0.2em]">Children linked to your account</Text>
                  </View>
                  <View className="p-4 bg-orange-600 rounded-2xl shadow-xl shadow-orange-600/30">
                    <Users size={24} color="#fff" />
                  </View>
                </View>

                <View className="flex flex-col gap-5 mt-2">
                  {children.length > 0 ? children.map((child: any, i: number) => (
                    <View key={i} className="flex-row items-center gap-4 bg-white/10 dark:bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/5">
                      <View className="h-14 w-14 rounded-xl overflow-hidden relative border-2 border-white/10">
                        <Image 
                          source={{ uri: child.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=ea580c&color=fff` }} 
                          style={{ width: '100%', height: '100%' }} 
                          contentFit="cover" 
                        />
                      </View>
                      <View>
                        <Text className="text-sm font-LexendBlack uppercase tracking-tight text-white">{child.name || 'N/A'}</Text>
                        <Text className="text-[10px] text-orange-500 font-LexendBlack uppercase tracking-widest mt-0.5">{child.studentCode || 'N/A'}</Text>
                      </View>
                    </View>
                  )) : (
                    <Text className="text-white/30 font-LexendBold uppercase tracking-[0.2em] text-xs italic">No children linked to this account.</Text>
                  )}
                </View>
              </View>
            </View>

            </View>
          </View>
        ) : (
          <View className="items-center justify-center mt-20">
            <Text className="text-slate-500 font-LexendMedium text-center">Failed to load profile.</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-8 pb-12 relative overflow-hidden">
            <View className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent pointer-events-none" />
            
            <View className="flex-row justify-between items-center mb-8 relative z-10">
              <View className="flex-row items-center gap-4">
                <View className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
                  <User size={20} color="#fff" />
                </View>
                <View>
                  <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tighter">Registry Edit</Text>
                  <Text className="text-[11px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Update personal data</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={isDark ? '#cbd5e1' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <View className="space-y-6 relative z-10 flex flex-col gap-6">
              <View>
                <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3">Full Name</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <User size={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                  </View>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-LexendBold"
                    placeholder="Enter your full name"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3">Email Address (Read Only)</Text>
                <View className="relative opacity-70">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Mail size={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                  </View>
                  <TextInput
                    value={user?.email || ""}
                    editable={false}
                    className="h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02] text-slate-900 dark:text-white font-LexendBold"
                  />
                </View>
                <Text className="text-[9px] font-LexendBlack text-slate-400 uppercase tracking-widest ml-1 mt-2 italic">Email updates require secondary verification.</Text>
              </View>

              <View>
                <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3">Phone Number</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Phone size={18} color={isDark ? '#cbd5e1' : '#64748b'} />
                  </View>
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    className="h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-LexendBold"
                    placeholder="+234 800 XXX XXXX"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  />
                </View>
              </View>
            </View>

            <View className="flex-row gap-4 mt-10 relative z-10">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                disabled={isUpdating}
                className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 items-center justify-center active:scale-95 transition-transform"
              >
                <Text className="font-LexendBlack text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={isUpdating}
                className="flex-[2] h-14 rounded-2xl bg-orange-600 items-center justify-center flex-row gap-2 active:scale-95 transition-transform"
              >
                {isUpdating ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="font-LexendBlack text-white text-xs uppercase tracking-widest">Updating...</Text>
                  </>
                ) : (
                  <Text className="font-LexendBlack text-white text-xs uppercase tracking-widest">Update Registry</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
