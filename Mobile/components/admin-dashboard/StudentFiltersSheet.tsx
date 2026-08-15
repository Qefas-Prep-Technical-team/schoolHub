import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { X, Filter, Check } from 'lucide-react-native';

interface StudentFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  activeFilters: {
    gender: string;
    status: string;
  };
  onApplyFilters: (filters: { gender: string; status: string }) => void;
}

export default function StudentFiltersSheet({ visible, onClose, isDark, activeFilters, onApplyFilters }: StudentFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const applyAndClose = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters = { gender: '', status: '' };
    setLocalFilters(defaultFilters);
    onApplyFilters(defaultFilters);
    onClose();
  };

  const renderFilterOptions = (title: string, options: { label: string; value: string }[], key: 'gender' | 'status') => (
    <View className="mb-6">
      <Text className="text-sm font-LexendBold text-slate-900 dark:text-white mb-3">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = localFilters[key] === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setLocalFilters({ ...localFilters, [key]: option.value })}
              className={`px-4 py-2 rounded-full border flex-row items-center justify-center ${
                isSelected
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Text
                className={`font-LexendBold text-sm ${
                  isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {option.label}
              </Text>
              {isSelected && <Check size={14} color="#fff" style={{ marginLeft: 6 }} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View className="bg-white dark:bg-slate-950 rounded-t-[2rem] p-6 pb-10">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-2">
                  <Filter size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
                  <Text className="text-xl font-LexendBold text-slate-900 dark:text-white">
                    Advanced Filters
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full">
                  <X size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
                </TouchableOpacity>
              </View>

              {/* Filters */}
              {renderFilterOptions('Gender', [
                { label: 'All', value: '' },
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
              ], 'gender')}

              {renderFilterOptions('Status', [
                { label: 'All', value: '' },
                { label: 'Verified', value: 'true' },
                { label: 'Pending', value: 'false' },
              ], 'status')}

              {/* Actions */}
              <View className="flex-row gap-4 mt-4">
                <TouchableOpacity 
                  onPress={resetFilters}
                  className="flex-1 py-4 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <Text className="font-LexendBold text-slate-600 dark:text-slate-400">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={applyAndClose}
                  className="flex-1 py-4 items-center justify-center rounded-2xl bg-blue-600 shadow-sm"
                >
                  <Text className="font-LexendBold text-white">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
