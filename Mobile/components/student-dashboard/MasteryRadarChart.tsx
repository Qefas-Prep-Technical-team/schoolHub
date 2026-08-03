import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RadarChartProps {
  data: { subject: string; A: number; fullMark: number }[];
}

export function MasteryRadarChart({ data }: RadarChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!data || data.length === 0) {
    return (
      <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 items-center justify-center min-h-[200px]">
        <Text className="text-slate-400 font-bold text-center">Not enough data to calculate subject mastery yet.</Text>
      </View>
    );
  }

  // Configuration
  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 40; // padding
  const sides = data.length;
  const angleStep = (Math.PI * 2) / sides;
  
  // Theme colors
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const fillColor = 'rgba(236, 72, 153, 0.4)'; // pink-500 with opacity
  const strokeColor = '#ec4899'; // pink-500

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, offset = 0) => {
    const r = (value / 100) * radius + offset;
    const theta = index * angleStep - Math.PI / 2; // Start at top
    return {
      x: center + r * Math.cos(theta),
      y: center + r * Math.sin(theta)
    };
  };

  // Generate grid points for concentric shapes (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPolygons = gridLevels.map(level => {
    const points = data.map((_, i) => {
      const { x, y } = getCoordinates(level, i);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Generate data polygon
  const dataPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(d.A, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View className="items-center w-full">
      <View className="items-center justify-center mb-2">
        <Svg width={size} height={size}>
          {/* Concentric Grid Polygons */}
          {gridPolygons.map((points, i) => (
            <Polygon
              key={`grid-${i}`}
              points={points}
              fill="none"
              stroke={gridColor}
              strokeWidth="1"
              strokeDasharray={i === gridLevels.length - 1 ? "" : "4,4"}
            />
          ))}

          {/* Axes Lines */}
          {data.map((_, i) => {
            const { x, y } = getCoordinates(100, i);
            return (
              <Line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={gridColor}
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon */}
          <Polygon
            points={dataPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* Data Points Dots */}
          {data.map((d, i) => {
            const { x, y } = getCoordinates(d.A, i);
            return (
              <Circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill={strokeColor}
              />
            );
          })}

          {/* Labels */}
          {data.map((d, i) => {
            // Push text slightly further out
            const { x, y } = getCoordinates(100, i, 15);
            const label = d.subject.length > 10 ? d.subject.substring(0, 8) + '...' : d.subject;
            
            // Adjust text anchor based on position to prevent cutoff
            let textAnchor = "middle";
            if (x < center - 10) textAnchor = "end";
            if (x > center + 10) textAnchor = "start";

            return (
              <SvgText
                key={`label-${i}`}
                x={x}
                y={y + 4} // slight vertical optical adjustment
                fill={textColor}
                fontSize="10"
                fontWeight="bold"
                textAnchor={textAnchor as any}
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
