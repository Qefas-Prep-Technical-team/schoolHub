import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  value: number | string;
  maxValue: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  isPercentage?: boolean;
}

const CircularProgress = ({ value, maxValue, label, color, size = 72, strokeWidth = 5, isPercentage = false }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
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
          {isPercentage ? (
            <View className="items-center">
              <Text className="text-[20px] font-black text-slate-800 dark:text-white">
                {safeValue === 0 && typeof value === 'string' ? value : safeValue + '%'}
              </Text>
            </View>
          ) : (
            <Text className="text-[20px] font-black text-slate-800 dark:text-white">
              {value}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center px-1 leading-tight">{label}</Text>
    </View>
  );
};

interface CategoryStatsGridProps {
  stats: {
    label: string;
    value: number | string;
    maxValue: number;
    color: string;
    isPercentage?: boolean;
  }[];
  gradeScore?: number;
}

export function CategoryStatsGrid({ stats, gradeScore = 0 }: CategoryStatsGridProps) {
  // Compute how much is left to the next grade
  let nextGradeThreshold = 100;
  if (gradeScore < 45) nextGradeThreshold = 45; // To D
  else if (gradeScore < 50) nextGradeThreshold = 50; // To C
  else if (gradeScore < 60) nextGradeThreshold = 60; // To B
  else if (gradeScore < 75) nextGradeThreshold = 75; // To A
  
  const pointsToNext = gradeScore >= 75 ? 0 : nextGradeThreshold - gradeScore;

  if (!stats || stats.length === 0) return null;

  return (
    <View 
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-4"
      style={{ elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}
    >
      <View className="flex-row justify-between items-center mb-2">
        {stats.map((stat, idx) => (
          <CircularProgress 
            key={idx}
            value={stat.value} 
            maxValue={stat.maxValue} 
            label={stat.label} 
            color={stat.color}
            isPercentage={stat.isPercentage}
          />
        ))}
      </View>
      
      {gradeScore > 0 && pointsToNext > 0 && (
        <View className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl self-center mt-4 border border-indigo-100 dark:border-indigo-800/50">
          <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {pointsToNext}% away from a higher grade! 🚀
          </Text>
        </View>
      )}
      {gradeScore >= 75 && (
        <View className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl self-center mt-4 border border-emerald-100 dark:border-emerald-800/50">
          <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            You're currently getting an A! Keep it up! 🏆
          </Text>
        </View>
      )}
    </View>
  );
}
