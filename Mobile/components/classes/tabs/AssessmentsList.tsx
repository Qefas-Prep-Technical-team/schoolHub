import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export interface AssessmentItem {
  id: number | string;
  title: string;
  dueDate: string;
  status: 'graded' | 'submitted' | 'upcoming' | 'overdue';
  grade?: string;
  type: string;
  timestamp: number;
  link: string;
}

interface AssessmentsListProps {
  assessments: AssessmentItem[];
}

export function AssessmentsList({ assessments }: AssessmentsListProps) {
  const router = useRouter();

  if (!assessments || assessments.length === 0) {
    return (
      <View className="py-12 items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <FileText size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Assessments Yet</Text>
        <Text className="text-sm text-slate-500 text-center max-w-[250px]">
          You have no pending or completed exams or assignments for this class.
        </Text>
      </View>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'graded':
        return { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle, label: 'Graded' };
      case 'submitted':
        return { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: CheckCircle, label: 'Submitted' };
      case 'overdue':
        return { color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: AlertCircle, label: 'Overdue' };
      default:
        return { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock, label: 'Upcoming' };
    }
  };

  return (
    <View className="space-y-3 pb-8">
      {assessments.map((item, index) => {
        const config = getStatusConfig(item.status);
        const Icon = config.icon;

        return (
          <TouchableOpacity 
            key={`${item.id}-${index}`}
            // Note: Currently link routing will be a stub. In a full app, route to specific screens based on type.
            onPress={() => {}}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex-row items-center"
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${config.bg}`}>
              <Icon size={24} className={config.color} />
            </View>
            
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">{item.type}</Text>
                <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
                  <Text className={`text-[10px] font-bold ${config.color}`}>{config.label}</Text>
                </View>
              </View>
              <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row items-center">
                <Clock size={12} className="text-slate-400 mr-1" />
                <Text className="text-xs text-slate-500 dark:text-slate-400">Due: {item.dueDate}</Text>
              </View>
            </View>

            <View className="items-end justify-center ml-2">
              {item.grade ? (
                <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg mb-1">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">{item.grade}</Text>
                </View>
              ) : null}
              <ChevronRight size={20} className="text-slate-400" />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
