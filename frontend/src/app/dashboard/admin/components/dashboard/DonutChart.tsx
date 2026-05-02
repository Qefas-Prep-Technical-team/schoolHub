'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  centerLabel?: {
    title: string;
    value: string;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].name}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 80,
  showTooltip = true,
  centerLabel,
}: DonutChartProps) {
  return (
    <div className="relative size-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={450}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                }}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} cursor={false} />}
        </PieChart>
      </ResponsiveContainer>
      
      {centerLabel && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="absolute flex items-center justify-center flex-col pointer-events-none"
        >
          <span className="block text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {centerLabel.value}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {centerLabel.title}
          </span>
        </motion.div>
      )}
    </div>
  );
}

