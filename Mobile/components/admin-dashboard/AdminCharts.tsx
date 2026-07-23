import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const AdminCharts = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width - 32; // 16px padding on each side

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#0f172a' : '#ffffff',
    backgroundGradientTo: isDark ? '#0f172a' : '#ffffff',
    color: (opacity = 1) => isDark ? `rgba(99, 102, 241, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 3, 
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: isDark ? "#4f46e5" : "#6366f1"
    }
  };

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [200, 240, 280, 290, 310, 350],
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, 
        strokeWidth: 3
      }
    ],
    legend: ["Enrollment Trends"]
  };

  const pieData = [
    {
      name: "Grade 10",
      population: 215,
      color: "#8b5cf6",
      legendFontColor: isDark ? "#cbd5e1" : "#475569",
      legendFontSize: 12
    },
    {
      name: "Grade 11",
      population: 280,
      color: "#3b82f6",
      legendFontColor: isDark ? "#cbd5e1" : "#475569",
      legendFontSize: 12
    },
    {
      name: "Grade 12",
      population: 310,
      color: "#f43f5e",
      legendFontColor: isDark ? "#cbd5e1" : "#475569",
      legendFontSize: 12
    },
    {
      name: "Other",
      population: 85,
      color: "#f59e0b",
      legendFontColor: isDark ? "#cbd5e1" : "#475569",
      legendFontSize: 12
    }
  ];

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">
          Performance Insights
        </Text>
      </View>

      {/* Line Chart Card */}
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <Text className="text-sm font-LexendBold text-slate-700 dark:text-slate-300 mb-4 px-2">
          New Enrollments (Last 6 Months)
        </Text>
        <LineChart
          data={lineData}
          width={screenWidth - 32} // Account for internal padding
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            borderRadius: 16
          }}
          withVerticalLines={false}
          withHorizontalLines={true}
        />
      </View>

      {/* Pie Chart Card */}
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <Text className="text-sm font-LexendBold text-slate-700 dark:text-slate-300 mb-2 px-2">
          Student Distribution
        </Text>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 0]}
          absolute
        />
      </View>
    </View>
  );
};
