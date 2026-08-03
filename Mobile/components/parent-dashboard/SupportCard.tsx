import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HeadphonesIcon, MessageCircle } from 'lucide-react-native';

export const SupportCard = () => {
  return (
    <View className="mb-8 px-4">
      <View className="bg-slate-900 dark:bg-orange-600 rounded-[2rem] p-6 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Decorative background circle */}
        <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <View className="flex-row items-center space-x-3 mb-2 relative z-10">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
            <HeadphonesIcon size={20} color="#ffffff" />
          </View>
          <Text className="text-white text-lg font-LexendBold uppercase tracking-tight">Need Assistance?</Text>
        </View>
        
        <Text className="text-white/80 text-[11px] font-Lexend mt-2 mb-5 relative z-10 leading-relaxed">
          Our support team is available 24/7 to help you with any questions regarding your child's education.
        </Text>
        
        <TouchableOpacity className="w-full py-3.5 rounded-xl bg-white flex-row justify-center items-center space-x-2 relative z-10 active:opacity-90">
          <MessageCircle size={16} color="#0f172a" />
          <Text className="text-slate-900 font-LexendBold text-[11px] uppercase tracking-widest">
            Live Support Chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
