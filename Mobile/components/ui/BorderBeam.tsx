import React, { useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BorderBeamProps {
  children: React.ReactNode;
  /** Primary bright color of the beam head */
  colorFrom?: string;
  /** Secondary color for the beam tail */
  colorTo?: string;
  /** Duration of one full rotation in milliseconds */
  duration?: number;
  /** Thickness of the border */
  borderWidth?: number;
  /** Border radius of the container */
  borderRadius?: number;
  /** Container style */
  style?: ViewStyle;
  /** Container class for tailwind */
  className?: string;
}

/**
 * BorderBeam (React Native / Expo)
 * 
 * Replicates the "Magic UI Border Beam" effect by rotating a large, precisely 
 * tuned linear gradient behind an inner clipping mask. This achieves a perfect
 * conic-like sweep without requiring @shopify/react-native-skia or complex SVG
 * strokeDashoffset calculations.
 */
export function BorderBeam({
  children,
  colorFrom = '#6366f1', // indigo-500
  colorTo = '#818cf8',   // indigo-400
  duration = 3000,
  borderWidth = 2,
  borderRadius = 32, // Match the typical card border radius in the dashboard
  style,
  className,
}: BorderBeamProps) {
  const rotation = useSharedValue(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View
      className={className}
      style={[
        {
          borderRadius,
          padding: borderWidth,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}
    >
      {/* 
        The spinning gradient layer. 
        It is oversized and absolutely centered so that as it rotates, 
        its straight edges never enter the visible bounding box of the card.
      */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 1000,
            height: 1000,
            top: '50%',
            left: '50%',
            marginTop: -500,
            marginLeft: -500,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', colorTo, colorFrom, 'transparent']}
          // The locations create a long tail that peaks sharply and vanishes, 
          // mimicking a comet sweep or true conic gradient head.
          locations={[0.2, 0.48, 0.5, 0.501]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* 
        Inner mask layer. 
        This blocks out the center of the spinning gradient, leaving only the 
        padding area (borderWidth) visible, creating the border beam effect.
      */}
      <View
        style={{
          flex: 1,
          borderRadius: borderRadius - borderWidth,
          overflow: 'hidden',
        }}
        className={isDark ? "bg-slate-900" : "bg-white"}
      >
        {children}
      </View>
    </View>
  );
}
