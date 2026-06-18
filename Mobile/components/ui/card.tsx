import React from 'react';
import { View, ViewProps, Text, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

export function GlassCard({ className, ...props }: ViewProps) {
  // Uses a semi-transparent background for a glassmorphic effect
  return (
    <View
      className={cn(
        "rounded-[2rem] bg-white/70 dark:bg-slate-950/70 border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn("p-6 pb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("font-lexend text-xl font-bold text-slate-900 dark:text-white uppercase italic tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("font-lexend text-xs font-medium text-slate-500 mt-1", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return <View className={cn("p-6 pt-0 flex-row items-center", className)} {...props} />;
}
