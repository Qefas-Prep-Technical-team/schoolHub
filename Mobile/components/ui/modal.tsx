import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, Text, ModalProps as RNModalProps } from 'react-native';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react-native';

export interface ModalProps extends RNModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, ...props }: ModalProps) {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="w-full max-w-sm rounded-[2rem] bg-white dark:bg-slate-950 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
              {title && (
                <Text className="font-lexend text-xl font-bold text-slate-900 dark:text-white uppercase italic tracking-tight">
                  {title}
                </Text>
              )}
              {description && (
                <Text className="font-lexend text-xs font-medium text-slate-500 mt-1">
                  {description}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <X size={20} className="text-slate-500" />
            </TouchableOpacity>
          </View>
          
          <View>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
