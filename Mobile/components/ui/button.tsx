import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { cn } from '../../lib/utils';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  textClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  size = 'md', 
  isLoading = false, 
  children, 
  className,
  textClassName,
  disabled,
  leftIcon,
  rightIcon,
  ...props 
}: ButtonProps) {
  const baseClasses = "flex-row items-center justify-center rounded-xl font-bold transition-all";
  
  const variantClasses = {
    default: "bg-primary dark:bg-primary-container",
    outline: "border-2 border-primary bg-transparent",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
    destructive: "bg-error dark:bg-error-container",
  };

  const sizeClasses = {
    sm: "h-9 px-4",
    md: "h-12 px-6",
    lg: "h-14 px-8",
  };

  const textVariantClasses = {
    default: "text-on-primary",
    outline: "text-primary dark:text-primary-container",
    ghost: "text-primary dark:text-primary-container",
    destructive: "text-on-error",
  };

  const textSizeClasses = {
    sm: "text-xs uppercase tracking-widest",
    md: "text-sm uppercase tracking-widest",
    lg: "text-base uppercase tracking-widest",
  };

  return (
    <TouchableOpacity
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || isLoading) ? "opacity-50" : "opacity-100",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator 
          color={variant === 'default' || variant === 'destructive' ? '#ffffff' : '#1e40af'} 
          className="mr-2" 
        />
      )}
      {leftIcon && <View className="mr-2">{leftIcon}</View>}
      <Text className={cn("font-lexend text-center font-bold", textVariantClasses[variant], textSizeClasses[size], textClassName)}>
        {children}
      </Text>
      {rightIcon && <View className="ml-2">{rightIcon}</View>}
    </TouchableOpacity>
  );
}
