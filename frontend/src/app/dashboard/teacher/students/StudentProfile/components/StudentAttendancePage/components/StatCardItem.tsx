import { StatCard } from "./types";


interface StatCardItemProps {
  stat: StatCard;
}

const StatCardItem: React.FC<StatCardItemProps> = ({ stat }) => {
  const getStatusStyles = () => {
    switch (stat.status) {
      case 'present':
        return {
          bg: 'bg-present/10 dark:bg-present/20',
          border: 'border-present/30',
          text: 'text-present',
          iconBg: 'bg-present'
        };
      case 'late':
        return {
          bg: 'bg-late/10 dark:bg-late/20',
          border: 'border-late/30',
          text: 'text-late',
          iconBg: 'bg-late'
        };
      case 'absent':
        return {
          bg: 'bg-absent/10 dark:bg-absent/20',
          border: 'border-absent/30',
          text: 'text-absent',
          iconBg: 'bg-absent'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-300 dark:border-gray-600',
          text: 'text-gray-600 dark:text-gray-300',
          iconBg: 'bg-gray-500'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`${styles.bg} ${styles.border} rounded-xl p-4 flex items-start gap-4`}>
      <div className={`${styles.iconBg} text-white rounded-full size-10 flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined">{stat.icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
      </div>
    </div>
  );
};

export default StatCardItem;