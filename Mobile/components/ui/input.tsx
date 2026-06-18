import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text, TouchableOpacity } from 'react-native';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, label, error, icon: Icon, rightIcon: RightIcon, onRightIconPress, containerClassName, ...props }, ref) => {
    return (
      <View className={cn("flex-col gap-1.5", containerClassName)}>
        {label && (
          <Text className="text-[10px] font-lexend font-bold uppercase tracking-widest text-slate-500 ml-1 dark:text-slate-400">
            {label}
          </Text>
        )}
        <View className="relative justify-center">
          {Icon && (
            <View className="absolute left-4 z-10">
              <Icon size={18} className="text-slate-400" />
            </View>
          )}
          <TextInput
            ref={ref}
            className={cn(
              "h-14 rounded-2xl bg-slate-50 px-4 font-lexend text-base text-slate-900 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:border-primary",
              Icon && "pl-12",
              RightIcon && "pr-12",
              error && "border-error focus:border-error dark:border-error-container dark:focus:border-error-container",
              className
            )}
            placeholderTextColor="#94a3b8"
            {...props}
          />
          {RightIcon && (
            <TouchableOpacity 
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              className="absolute right-4 z-10 p-1"
            >
              <RightIcon size={20} className="text-slate-400" />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text className="text-xs font-lexend text-error dark:text-error-container ml-1 mt-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
