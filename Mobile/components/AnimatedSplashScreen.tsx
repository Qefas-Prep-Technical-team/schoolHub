import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

export function AnimatedSplashScreen({ isAppReady, onFinish }: { isAppReady: boolean; onFinish: () => void }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const colorScheme = useColorScheme();

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [scale]);

  useEffect(() => {
    if (isAppReady) {
      // Hide the native splash screen now that our React Native animation is taking over
      SplashScreen.hideAsync().catch(() => {});

      // Short delay before fading out to ensure a smooth transition
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        });
      }, 500);
    }
  }, [isAppReady, opacity, onFinish]);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const backgroundColor = colorScheme === 'dark' ? '#020617' : '#ffffff';

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedContainerStyle, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.Image
        source={require('../assets/images/icon.png')}
        style={[{ width: 120, height: 120, resizeMode: 'contain' }, animatedImageStyle]}
      />
    </Animated.View>
  );
}
