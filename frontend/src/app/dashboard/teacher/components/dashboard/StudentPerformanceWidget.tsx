'use client';

import { User, Award, TrendingUp, BarChart3 } from 'lucide-react';
import Image from 'next/image';

interface StudentPerformanceWidgetProps {
  performanceMetrics: {
    topStudents: Array<{
      id: string;
      name: string;
      image?: string;
      average: number;
    }>;
    distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  };
}

export default function StudentPerformanceWidget({ performanceMetrics }: StudentPerformanceWidgetProps) {
  const { topStudents, distribution } = performanceMetrics;
  
  const totalStudents = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  const getDistributionWidth = (count: number) => {
    if (totalStudents === 0) return '0%';
    return `${(count / totalStudents) * 100}%`;
  };

  return (
    <div className="p-6 bg-white/70 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Student Performance
        </h2>
        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <BarChart3 className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Top Students Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Performers</h3>
        {topStudents.length > 0 ? (
          topStudents.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                    {student.image ? (
                      <Image src={student.image} alt={student.name} fill className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-gray-800">
                    <span className="text-[10px] font-black text-gray-500">#{index + 1}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {student.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Class Proficiency</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {student.average}%
                </span>
                <div className="flex items-center text-[10px] text-green-500 font-bold">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  <span>Elite</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500">No performance data available</p>
          </div>
        )}
      </div>

      {/* Grade Distribution Section */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Grade Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'Grade A', count: distribution.A, color: 'bg-green-500' },
            { label: 'Grade B', count: distribution.B, color: 'bg-blue-500' },
            { label: 'Grade C', count: distribution.C, color: 'bg-yellow-500' },
            { label: 'Grade D/F', count: distribution.D + distribution.F, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="text-gray-900 dark:text-white">{item.count} Students</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: getDistributionWidth(item.count) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
