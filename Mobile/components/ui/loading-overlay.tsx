import { View, ActivityIndicator, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Please wait...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50 items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
    >
      <View className="bg-white dark:bg-slate-900 p-6 rounded-2xl items-center shadow-xl border border-slate-200 dark:border-slate-800 w-64 max-w-[80%]">
        <ActivityIndicator size="large" color="#1e40af" className="mb-4" />
        <Text className="font-lexend text-slate-800 dark:text-slate-200 text-center text-base">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
