import React, { ReactNode } from 'react';

interface InfoCardV2Props {
  title: string;
  children: ReactNode;
  className?: string;
}

const InfoCardV2: React.FC<InfoCardV2Props> = ({ title, children, className = '' }) => {
  return (
    <div className={`p-6 bg-card-light dark:bg-card-dark rounded-xl ${className}`}>
      <h2 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
        {title}
      </h2>
      <div className="mt-6 space-y-6">
        {children}
      </div>
    </div>
  );
};

export default InfoCardV2;