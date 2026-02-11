import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = true,
  border = true
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClass = shadow ? 'shadow-sm' : '';
  const borderClass = border ? 'border border-gray-200 dark:border-gray-700/80' : '';

  return (
    <div
      className={`rounded-xl bg-white dark:bg-gray-800/50 ${borderClass} ${paddingClasses[padding]} ${shadowClass} ${className}`}
    >
      {children}
    </div>
  );
}