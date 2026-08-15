import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const SupportCard = () => {
  return (
    <View className="mb-8">
      <View className="bg-slate-900 dark:bg-orange-600 rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-slate-800 dark:border-white/10">
        <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        
        <Text className="text-white text-xl font-black uppercase tracking-tight relative z-10 mb-2">Need Assistance?</Text>
        <Text className="text-white/70 text-xs font-Lexend mb-6 relative z-10 leading-relaxed">
          Our support team is available 24/7 to help you with any questions regarding your child's education.
        </Text>
        
        <TouchableOpacity className="w-full py-3.5 rounded-2xl bg-white flex-row justify-center items-center relative z-10 shadow-xl">
          <Text className="text-slate-900 font-black text-[11px] uppercase tracking-widest">Live Support Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
