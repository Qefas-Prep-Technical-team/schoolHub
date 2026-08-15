import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, X, Lock } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateLinkRequest } from '@/lib/api/hooks/useLinks';

export const AddChildCard = () => {
  const isDark = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [studentCode, setStudentCode] = useState('');
  
  const { mutate: createLink, isPending } = useCreateLinkRequest();

  const handleLinkChild = () => {
    if (!studentCode.trim()) return;
    
    createLink(
      {
        targetCode: studentCode.trim(),
        linkType: 'PARENT_STUDENT',
        note: 'Linking child to parent account',
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setStudentCode('');
        }
      }
    );
  };

  return (
    <>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        className="bg-orange-50/50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-orange-200 dark:border-slate-700 flex-row items-center p-6 mb-6"
      >
        <View className="h-14 w-14 rounded-full bg-orange-100 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 items-center justify-center mr-5">
          <Plus size={24} color={isDark ? '#ea580c' : '#f97316'} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-LexendBold text-slate-800 dark:text-white mb-1">
            Add Another Child
          </Text>
          <Text className="text-[11px] font-Lexend text-slate-500 dark:text-slate-400">
            Link a new student to your parent account using their student code.
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            <View className={`absolute inset-0 ${isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'}`} />
            <TouchableOpacity 
              activeOpacity={1} 
              className="absolute inset-0 bg-black/40"
              onPress={() => setModalVisible(false)}
            />
            
            <View className="bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 pb-12 shadow-2xl">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-3">
                  <View className="p-3 bg-orange-500 rounded-2xl">
                    <Plus size={20} color="#ffffff" />
                  </View>
                  <View>
                    <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight">Link Terminal</Text>
                    <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest mt-0.5">Initiate Synchronization</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>

              <View className="space-y-4 mb-8 mt-4">
                <Text className="text-[10px] font-LexendBlack text-slate-400 uppercase tracking-widest ml-2 mb-2">Student Access Code</Text>
                <View className="relative flex-row items-center">
                  <View className="absolute left-4 z-10">
                    <Lock size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                  </View>
                  <TextInput
                    className="w-full h-16 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white font-LexendBold border border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500"
                    placeholder="e.g. STU-2024-001"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={studentCode}
                    onChangeText={setStudentCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest text-center mt-4">
                  Authorization requires student validation
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLinkChild}
                disabled={isPending || !studentCode.trim()}
                className={`h-16 rounded-2xl flex-row items-center justify-center shadow-lg ${
                  isPending || !studentCode.trim() 
                    ? 'bg-slate-300 dark:bg-slate-700' 
                    : 'bg-orange-500 shadow-orange-500/30'
                }`}
              >
                {isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-LexendBlack text-sm uppercase tracking-widest">Establish Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
