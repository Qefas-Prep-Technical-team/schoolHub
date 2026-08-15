import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: {
    title: string;
    value: string;
  };
}

export default function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 80,
  centerLabel,
}: DonutChartProps) {
  const size = outerRadius * 2;
  const center = outerRadius;

  // Calculate total value to determine slice angles
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  let currentAngle = 90; // Start at 90 degrees (top)

  const createPieSlice = (value: number, color: string) => {
    if (value <= 0) return null;
    
    // Subtract a tiny bit for the "paddingAngle" visual gap
    const sliceAngle = (value / total) * 360 - 2; 
    
    if (sliceAngle <= 0) return null;

    // SVG arc math
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(endAngle);
    const y2 = center + outerRadius * Math.sin(endAngle);

    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const d = `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;

    currentAngle += sliceAngle + 2; 

    return <Path d={d} fill={color} />;
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {data.map((item, index) => {
            const slice = createPieSlice(item.value, item.color);
            return <React.Fragment key={index}>{slice}</React.Fragment>;
          })}
        </G>
      </Svg>
      
      {centerLabel && (
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {centerLabel.value}
          </Text>
          <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
            {centerLabel.title}
          </Text>
        </View>
      )}
    </View>
  );
}
