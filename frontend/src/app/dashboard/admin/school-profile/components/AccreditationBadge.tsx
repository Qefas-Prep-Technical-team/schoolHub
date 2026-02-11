import React from 'react';
import { CheckCircle } from 'lucide-react';
import { AccreditationBadgeProps } from './types';

const AccreditationBadge: React.FC<AccreditationBadgeProps> = ({ status }) => {
  const config = {
    accredited: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      label: 'Fully Accredited',
      icon: <CheckCircle size={16} />
    },
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/50',
      text: 'text-yellow-700 dark:text-yellow-300',
      label: 'Accreditation Pending',
      icon: <CheckCircle size={16} />
    },
    provisional: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'Provisional Accreditation',
      icon: <CheckCircle size={16} />
    }
  };

  const { bg, text, label, icon } = config[status];

  return (
    <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-3 ${bg}`}>
      <span className={text}>
        {icon}
      </span>
      <p className={`text-sm font-medium leading-normal ${text}`}>
        {label}
      </p>
    </div>
  );
};

export default AccreditationBadge;