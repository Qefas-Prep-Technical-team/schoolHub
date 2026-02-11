import { PerformanceLevel } from "./types";


interface PerformanceBadgeProps {
  level: PerformanceLevel;
}

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ level }) => {
  const getBadgeStyles = () => {
    switch (level) {
      case 'High':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 ring-green-600/20 dark:ring-green-500/30';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 ring-yellow-600/20 dark:ring-yellow-500/30';
      case 'Low':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 ring-red-600/20 dark:ring-red-500/30';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 ring-gray-600/20';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeStyles()}`}>
      {level}
    </span>
  );
};

export default PerformanceBadge;