import React from 'react';
import { View, Text } from 'react-native';

export default function ParentChildrenScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
        My Children
      </Text>
    </View>
  );
}
