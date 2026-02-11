import { Submission } from './types';

interface Props {
  status: Submission['status'];
  title: string;
  message: string;
}

export default function SuccessMessage({ status, title, message }: Props) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'awaiting_grade':
        return {
          icon: 'hourglass_top',
          text: 'Submitted – Awaiting Grade',
          iconColor: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-500/20',
          textColor: 'text-orange-600 dark:text-orange-400',
        };
      case 'graded':
        return {
          icon: 'grade',
          text: 'Graded',
          iconColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-500/20',
          textColor: 'text-green-600 dark:text-green-400',
        };
      case 'returned':
        return {
          icon: 'assignment_returned',
          text: 'Returned for Revision',
          iconColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-500/20',
          textColor: 'text-blue-600 dark:text-blue-400',
        };
      default:
        return {
          icon: 'task_alt',
          text: 'Submitted',
          iconColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-500/20',
          textColor: 'text-green-600 dark:text-green-400',
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <>
      <div className="flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-500/20 mb-6">
        <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">
          task_alt
        </span>
      </div>
      
      <h1 className="text-[#0e121b] dark:text-white tracking-tight text-3xl sm:text-4xl font-bold leading-tight pb-3">
        {title}
      </h1>
      
      <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal pb-4 max-w-md">
        {message}
      </p>
      
      <div className={`inline-flex items-center justify-center gap-2 rounded-full ${statusConfig.bgColor} px-3 py-1 text-sm font-medium ${statusConfig.textColor} mb-8`}>
        <span className={`material-symbols-outlined text-base ${statusConfig.iconColor}`}>
          {statusConfig.icon}
        </span>
        {statusConfig.text}
      </div>
    </>
  );
}