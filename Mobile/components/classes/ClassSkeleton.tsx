import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

interface ClassSkeletonProps {
  viewMode: 'list' | 'grid';
}

export function ClassSkeleton({ viewMode }: ClassSkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (viewMode === 'grid') {
    return (
      <Animated.View 
        style={animatedStyle}
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex-1 m-2"
      >
        <View className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-4" />
        <View className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full mb-2" />
        <View className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-6" />
        
        <View className="h-[1px] w-full bg-slate-100 dark:bg-slate-800 mb-4" />
        
        <View className="flex-row items-center justify-between">
          <View className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
          <View className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </View>
      </Animated.View>
    );
  }

  if (viewMode === 'details') {
    return (
      <Animated.View style={animatedStyle} className="flex-1 mt-4">
        {/* Overview Card Skeleton */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          
          {/* Banner & Avatar Skeleton */}
          <View className="relative mb-10">
            <View className="h-[120px] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <View className="absolute -bottom-5 left-4 w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900" />
          </View>
          
          <View className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-3 px-2" />
          <View className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-2 mx-2" />
          <View className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 mx-2" />

          <View className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-full mb-3" />
          <View className="flex-row">
            <View className="w-16 h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl mr-3" />
            <View className="w-16 h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </View>
        </View>

        {/* Stats Grid Skeleton */}
        <View className="flex-col mb-4">
          <View className="flex-row mb-4">
            <View className="flex-1 h-32 bg-slate-200 dark:bg-slate-800 rounded-[24px] mr-2" />
            <View className="flex-1 h-32 bg-slate-200 dark:bg-slate-800 rounded-[24px] ml-2" />
          </View>
          <View className="flex-row">
            <View className="flex-1 h-32 bg-slate-200 dark:bg-slate-800 rounded-[24px] mr-2" />
            <View className="flex-1 h-32 bg-slate-200 dark:bg-slate-800 rounded-[24px] ml-2" />
          </View>
        </View>

        {/* Tabs Skeleton */}
        <View className="flex-row mt-4">
          <View className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl mr-3" />
          <View className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl mr-3" />
          <View className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={animatedStyle}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 mr-4" />
        <View className="flex-1">
          <View className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full mb-2" />
          <View className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </View>
      </View>

      <View className="h-[1px] w-full bg-slate-100 dark:bg-slate-800 mb-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 mr-2" />
          <View className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </View>
        <View className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </View>
    </Animated.View>
  );
}
