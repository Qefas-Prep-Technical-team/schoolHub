'use client';

import { useState } from 'react';
import Card from './ui/Card';

interface PerformanceChartProps {
  title: string;
  imageUrl: string;
  altText: string;
  className?: string;
}

export default function PerformanceChart({ 
  title, 
  imageUrl, 
  altText, 
  className = '' 
}: PerformanceChartProps) {
  const [view, setView] = useState<'chart' | 'stats'>('chart');

  return (
    <Card className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-light dark:text-text-dark">{title}</h3>
        <div className="flex gap-2">
          <button
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              view === 'chart'
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            onClick={() => setView('chart')}
          >
            Chart
          </button>
          <button
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              view === 'stats'
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            onClick={() => setView('stats')}
          >
            Stats
          </button>
        </div>
      </div>
      
      <div className="h-64 flex items-center justify-center">
        {view === 'chart' ? (
          <img
            src={imageUrl}
            alt={altText}
            className="h-full w-full object-contain dark:invert-[0.85]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Performance Statistics</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
                  <p className="text-2xl font-bold text-text-light dark:text-text-dark">92%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                </div>
                <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
                  <p className="text-2xl font-bold text-text-light dark:text-text-dark">+4.2%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Improvement</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}