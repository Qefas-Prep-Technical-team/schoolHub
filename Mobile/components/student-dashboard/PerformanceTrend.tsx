import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TrendingUp } from 'lucide-react-native';

interface PerformanceTrendProps {
  attempts: any[];
  standaloneGrades: any[];
}

export function PerformanceTrend({ attempts, standaloneGrades }: PerformanceTrendProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const data = useMemo(() => {
    const timeline: { date: Date, score: number, label: string }[] = [];

    attempts?.forEach(a => {
      if (a.submittedAt) {
        timeline.push({
          date: new Date(a.submittedAt),
          score: Math.round((a.totalScore / (a.totalMarks || 1)) * 100),
          label: a.exam?.title || 'Exam'
        });
      }
    });

    standaloneGrades?.forEach(g => {
      if (g.dateLogged || g.createdAt) {
        timeline.push({
          date: new Date(g.dateLogged || g.createdAt),
          score: Math.round((g.score / (g.maxMarks || 1)) * 100),
          label: g.subject || 'Assignment'
        });
      }
    });

    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    return timeline.map(t => ({
      name: t.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: t.score,
      fullLabel: t.label
    }));
  }, [attempts, standaloneGrades]);

  if (!data || data.length === 0) {
    return null;
  }

  // Chart Dimensions
  const chartHeight = 150;
  const paddingH = 20;
  const paddingV = 20;
  
  // Calculate SVG width dynamically based on screen size (minus margins)
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48 - (paddingH * 2); // 48 is mx-6 padding

  // SVG Scales
  const maxScore = 100;
  const minScore = 0;

  const getX = (index: number) => paddingH + (index * (chartWidth / Math.max(1, data.length - 1)));
  const getY = (score: number) => paddingV + (chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight);

  const pointsString = data.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#64748b' : '#94a3b8';
  const strokeColor = '#10b981'; // emerald-500

  return (
    <View className="mx-6 mt-6 p-6 bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Performance <Text className="text-emerald-500">Trend</Text>
          </Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score progression over time</Text>
        </View>
        <View className="p-3 bg-emerald-500/10 rounded-2xl">
          <TrendingUp size={20} color="#10b981" />
        </View>
      </View>

      <View className="items-center justify-center">
        <Svg width={chartWidth + paddingH * 2} height={chartHeight + paddingV * 2}>
          {/* Horizontal Grid Lines (0, 50, 100) */}
          {[0, 50, 100].map((val) => {
            const y = getY(val);
            return (
              <React.Fragment key={`grid-${val}`}>
                <Line x1={paddingH} y1={y} x2={chartWidth + paddingH} y2={y} stroke={gridColor} strokeDasharray="4,4" strokeWidth={1} />
                <SvgText x={0} y={y + 4} fill={textColor} fontSize="10" fontWeight="bold">
                  {val}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Data Line */}
          {data.length > 1 && (
            <Polyline
              points={pointsString}
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.score);
            return (
              <Circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill={strokeColor}
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
