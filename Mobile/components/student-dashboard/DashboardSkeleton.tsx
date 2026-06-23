import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function DashboardSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="flex-1 px-6 mt-4">
      {/* Hero Skeleton */}
      <View className="h-[200px] w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem] mb-6" />
      
      {/* Insights Skeletons */}
      <View className="flex-row justify-between mb-6">
        <View className="h-28 flex-1 bg-slate-200 dark:bg-slate-800 rounded-[1.5rem] mr-2" />
        <View className="h-28 flex-1 bg-slate-200 dark:bg-slate-800 rounded-[1.5rem] mx-1" />
        <View className="h-28 flex-1 bg-slate-200 dark:bg-slate-800 rounded-[1.5rem] ml-2" />
      </View>

      {/* Radar Chart Skeleton */}
      <View className="h-[300px] w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem] mb-6" />

      {/* Quick Actions Skeleton */}
      <View className="h-[250px] w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem]" />
    </Animated.View>
  );
}
