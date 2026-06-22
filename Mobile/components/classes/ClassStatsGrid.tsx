import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ClassStatsGridProps {
  attendance: number;
  assignments: {
    completed: number;
    total: number;
  };
  grade: string;
  lastActivity: string;
}

const CircularProgress = ({ value, maxValue, label, color, size = 72, strokeWidth = 5 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = isNaN(value) ? 0 : value;
  const percentage = maxValue > 0 ? (safeValue / maxValue) * 100 : 0;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View className="items-center flex-1">
      <View style={{ width: size, height: size }} className="items-center justify-center mb-3">
        <Svg width={size} height={size} className="absolute">
          {/* Background Ring */}
          <Circle
            stroke="#e2e8f0"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress Ring */}
          <Circle
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        {/* Inner Text */}
        <View className="items-center justify-center absolute">
          {label === 'Attendance' ? (
            <Text className="text-[18px] font-black text-slate-800 dark:text-white">
              {safeValue}<Text className="text-[10px] font-bold">%</Text>
            </Text>
          ) : label === 'Tasks Done' ? (
            <Text className="text-[20px] font-black text-slate-800 dark:text-white">
              {safeValue}
            </Text>
          ) : (
            <Text className="text-[20px] font-black text-slate-800 dark:text-white">
              {value}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
};

export function ClassStatsGrid({ attendance, assignments, grade }: ClassStatsGridProps) {
  // Compute percentage-like value for grade ring
  let gradeValue = 0;
  if (grade === 'A') gradeValue = 100;
  else if (grade === 'B') gradeValue = 80;
  else if (grade === 'C') gradeValue = 60;
  else if (grade === 'D') gradeValue = 40;
  else if (grade === 'F') gradeValue = 20;

  return (
    <View 
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-6 flex-row justify-between items-center"
      style={{ elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}
    >
      <CircularProgress 
        value={attendance} 
        maxValue={100} 
        label="Attendance" 
        color="#4f46e5" 
      />
      
      <CircularProgress 
        value={assignments.completed} 
        maxValue={assignments.total || 1} 
        label="Tasks Done" 
        color="#4f46e5" 
      />
      
      <CircularProgress 
        value={grade} 
        maxValue={100} 
        label="Current Grade" 
        color="#4f46e5" 
      />
    </View>
  );
}
