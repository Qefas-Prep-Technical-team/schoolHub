import React from 'react';

interface ColorSwatchProps {
  color: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'size-5',
    md: 'size-6',
    lg: 'size-8'
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`rounded-full ${sizeClasses[size]}`}
        style={{ backgroundColor: color }}
        aria-label={`Color: ${label}`}
      />
      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
        {label}
      </p>
    </div>
  );
};

export default ColorSwatch;