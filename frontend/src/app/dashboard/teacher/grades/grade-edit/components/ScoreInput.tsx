import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreInputProps {
  label: string;
  maxScore: number;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  label,
  maxScore,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const percentage = maxScore > 0 ? (value / maxScore) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
        <span>{label}</span>
        <span className="text-slate-400 dark:text-slate-500">/ {maxScore}</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={0}
        max={maxScore}
        step="0.5"
        disabled={disabled}
        className={cn(
          'h-12 w-full text-xl font-bold rounded-lg border-slate-300 dark:border-slate-700',
          'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
        )}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Percentage: {percentage.toFixed(1)}%
      </p>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ScoreInput;