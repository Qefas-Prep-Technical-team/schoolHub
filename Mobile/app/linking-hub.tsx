import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Globe, X, Link2, Search, QrCode, Shield, Copy, ArrowUpRight, Trophy, FileText, Check } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  useActiveLinks, 
  useLinkRequests, 
  useLinkProfile, 
  useRespondToLinkRequest, 
  useCreateLinkRequest,
  useRevokeActiveLink,
  useCancelLinkRequest
} from '@/lib/api/hooks/useLinks';

export default function LinkingHubScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [mainTab, setMainTab] = useState<'network' | 'classroom'>('network');
  const [subTab, setSubTab] = useState<'active' | 'pending'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [connectNote, setConnectNote] = useState('');

  // Queries
  const { data: profileResponse } = useLinkProfile();
  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks({ category: mainTab });
  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests({ 
    category: mainTab,
    status: subTab === 'pending' ? 'PENDING' : undefined
  });

  // Mutations
  const createMutation = useCreateLinkRequest();
  const respondMutation = useRespondToLinkRequest();
  const revokeMutation = useRevokeActiveLink();
  const cancelMutation = useCancelLinkRequest();

  const profile = profileResponse?.data || {};
  const activeLinks = (activeLinksData as any)?.items || [];
  const requests = (requestsData as any)?.items || [];

  const handleConnect = () => {
    if (!connectCode) {
      Alert.alert('Error', 'Please enter a connection code');
      return;
    }
    
    // For now, default to STUDENT_CLASS for classroom tab, SCHOOL_STUDENT for network
    const linkType = mainTab === 'classroom' ? 'STUDENT_CLASS' : 'SCHOOL_STUDENT';
    const formattedCode = linkType === 'STUDENT_CLASS' ? connectCode.toUpperCase() : connectCode.toLowerCase();

    createMutation.mutate(
      { targetCode: formattedCode, linkType, note: connectNote },
      { onSuccess: () => {
        setIsConnectModalOpen(false);
        setConnectCode('');
        setConnectNote('');
      }}
    );
  };

  const getPeerName = (item: any, isRequest = false) => {
    const r = isRequest ? item : item.approvedFromRequest || item;
    // Basic logic to extract peer name based on frontend structure
    if (r.targetSchool?.name) return r.targetSchool.name;
    if (r.requesterSchool?.name) return r.requesterSchool.name;
    if (r.class?.name) return r.class.name;
    
    const peerId = profile?.id;
    const participants = [
      r.targetStudent, r.targetTeacher, r.targetParent, 
      r.requesterStudent, r.requesterTeacher, r.requesterParent
    ].filter(Boolean);
    
    const peer = participants.find((p: any) => p.id !== peerId);
    return peer?.name || peer?.username || "Verified Member";
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#f8fafc', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="h-10 w-10 bg-white dark:bg-slate-900 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800"
        >
          <X size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Connect Hub</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* ID Card */}
        <View className="bg-indigo-600 rounded-[2.5rem] p-6 mb-8 overflow-hidden relative shadow-xl shadow-indigo-500/20">
          <View className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          
          <View className="flex-row items-start justify-between mb-8">
            <View className="flex-1 pr-4">
              <View className="self-start px-3 py-1 bg-white/20 rounded-full mb-4 flex-row items-center">
                <Shield size={12} color="#fff" />
                <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-1">Student Passport</Text>
              </View>
              <Text className="text-3xl font-black text-white leading-none mb-1">{profile?.name || 'Student'}</Text>
              <Text className="text-indigo-200 font-bold text-xs uppercase tracking-widest">ID: {profile?.studentCode || '---'}</Text>
            </View>
            <View className="bg-white p-2 rounded-2xl">
              {profile?.linkingCode ? (
                <QRCode value={profile.linkingCode} size={64} backgroundColor="white" color="black" />
              ) : (
                <View className="w-16 h-16 bg-slate-200 rounded-xl" />
              )}
            </View>
          </View>

          <View className="flex-row items-end justify-between">
            <View className="bg-white/10 p-3 rounded-2xl flex-1 mr-4 border border-white/20">
              <Text className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Linking Code</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-black tracking-[0.2em] font-mono text-white">{profile?.linkingCode || '---'}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => setIsConnectModalOpen(true)}
              className="h-14 w-14 bg-white rounded-2xl items-center justify-center"
            >
              <Link2 size={24} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & Tabs */}
        <View className="mb-6">
          <View className="flex-row bg-slate-200/50 dark:bg-slate-900 rounded-xl p-1 mb-4">
            <TouchableOpacity 
              onPress={() => setMainTab('network')}
              className={`flex-1 py-2 items-center rounded-lg ${mainTab === 'network' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-black uppercase tracking-widest ${mainTab === 'network' ? 'text-pink-600' : 'text-slate-500'}`}>Network</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setMainTab('classroom')}
              className={`flex-1 py-2 items-center rounded-lg ${mainTab === 'classroom' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-black uppercase tracking-widest ${mainTab === 'classroom' ? 'text-purple-600' : 'text-slate-500'}`}>Classroom</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-2 mb-6">
            <TouchableOpacity 
              onPress={() => setSubTab('active')}
              className={`px-4 py-2 rounded-lg ${subTab === 'active' ? (mainTab === 'classroom' ? 'bg-purple-600' : 'bg-slate-900 dark:bg-white') : 'bg-transparent'}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${subTab === 'active' ? (isDark && mainTab === 'network' ? 'text-black' : 'text-white') : 'text-slate-400'}`}>Connected</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setSubTab('pending')}
              className={`px-4 py-2 rounded-lg ${subTab === 'pending' ? 'bg-orange-500' : 'bg-transparent'}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${subTab === 'pending' ? 'text-white' : 'text-slate-400'}`}>Pending Requests</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Lists */}
        <View className="pb-20">
          {isLoadingActive || isLoadingRequests ? (
            <ActivityIndicator size="large" color="#ec4899" className="my-10" />
          ) : subTab === 'active' ? (
            activeLinks.length > 0 ? activeLinks.map((link: any) => (
              <View key={link.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`h-12 w-12 rounded-xl items-center justify-center mr-4 ${mainTab === 'classroom' ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-rose-50 dark:bg-pink-900/30'}`}>
                    <Trophy size={20} color={mainTab === 'classroom' ? '#a855f7' : '#ec4899'} />
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="font-bold text-slate-900 dark:text-white text-base leading-tight" numberOfLines={1}>{getPeerName(link)}</Text>
                    <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                      {link.linkType?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => revokeMutation.mutate(link.id)}
                  disabled={revokeMutation.isPending}
                  className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center border border-slate-200 dark:border-slate-700"
                >
                  <X size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )) : (
              <Text className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest py-10">No active {mainTab} connections</Text>
            )
          ) : (
            requests.length > 0 ? requests.map((req: any) => {
              const isOutgoing = req.requesterId === profile?.id;
              return (
                <View key={req.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                      <Text className="text-[8px] font-black uppercase tracking-widest text-orange-600">{isOutgoing ? 'SENT' : 'INCOMING'}</Text>
                    </View>
                    <Text className="text-[8px] font-black uppercase tracking-widest text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</Text>
                  </View>
                  
                  <View className="flex-row items-center mb-6">
                    <View className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 items-center justify-center mr-4">
                      <Globe size={20} color="#f97316" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-900 dark:text-white text-base leading-tight" numberOfLines={1}>{getPeerName(req, true)}</Text>
                      <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                        {req.linkType?.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    {isOutgoing ? (
                      <TouchableOpacity 
                        onPress={() => cancelMutation.mutate(req.id)}
                        disabled={cancelMutation.isPending}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl items-center"
                      >
                        <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">Cancel</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity 
                          onPress={() => respondMutation.mutate({ id: req.id, action: 'ACCEPT' })}
                          disabled={respondMutation.isPending}
                          className="flex-1 bg-orange-500 py-3 rounded-xl items-center flex-row justify-center"
                        >
                          <Check size={16} color="white" style={{ marginRight: 8 }} />
                          <Text className="text-white font-bold text-xs uppercase tracking-widest">Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => respondMutation.mutate({ id: req.id, action: 'REJECT' })}
                          disabled={respondMutation.isPending}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl items-center"
                        >
                          <Text className="text-red-500 font-bold text-xs uppercase tracking-widest">Decline</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            }) : (
              <Text className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest py-10">No pending requests</Text>
            )
          )}
        </View>
      </ScrollView>

      {/* Connect Modal */}
      <Modal visible={isConnectModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 pb-12 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Connection</Text>
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Enter a secure code</Text>
              </View>
              <TouchableOpacity onPress={() => setIsConnectModalOpen(false)} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
                <X size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Entity Code</Text>
                <TextInput
                  value={connectCode}
                  onChangeText={setConnectCode}
                  placeholder="e.g. QEFAS123"
                  placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                  className="bg-slate-50 dark:bg-slate-800 h-14 px-4 rounded-2xl text-slate-900 dark:text-white font-bold font-mono tracking-widest border border-slate-200 dark:border-slate-700"
                  autoCapitalize="characters"
                />
              </View>
              <View>
                <Text className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Note (Optional)</Text>
                <TextInput
                  value={connectNote}
                  onChangeText={setConnectNote}
                  placeholder="Hello, I would like to join..."
                  placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                  className="bg-slate-50 dark:bg-slate-800 h-14 px-4 rounded-2xl text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700"
                />
              </View>

              <TouchableOpacity 
                onPress={handleConnect}
                disabled={createMutation.isPending}
                className="bg-indigo-600 h-14 rounded-2xl items-center justify-center mt-4 flex-row"
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Link2 size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-black uppercase tracking-widest">Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
