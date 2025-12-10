import React, { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`w-full rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 ${className}`}>
      <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
        {title}
      </h2>
      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;