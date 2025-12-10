import React from 'react';
import { CalendarCheck } from 'lucide-react';

interface TeacherAvailabilityButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const TeacherAvailabilityButton: React.FC<TeacherAvailabilityButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-w-[48px] h-12 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Check Teacher Availability"
    >
      <CalendarCheck size={20} />
    </button>
  );
};

export default TeacherAvailabilityButton;