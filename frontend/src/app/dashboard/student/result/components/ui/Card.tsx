import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = true 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClass = shadow ? 'shadow-sm' : '';

  return (
    <div
      className={`rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark ${paddingClasses[padding]} ${shadowClass} ${className}`}
    >
      {children}
    </div>
  );
}