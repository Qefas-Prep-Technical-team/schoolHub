import { StatCardT } from "./types";


interface StatCardProps {
  stat: StatCardT;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'danger':
        return 'text-danger';
      default:
        return 'text-text-secondary-light dark:text-text-secondary-dark';
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
      <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium">
        {stat.title}
      </p>
      <p className="text-text-primary-light dark:text-text-primary-dark tracking-light text-3xl font-bold">
        {stat.value}
      </p>
      <p className={`${getStatusColor(stat.status)} text-sm font-medium flex items-center gap-1`}>
        {stat.trend && (
          <span className="material-symbols-outlined text-base">
            {getTrendIcon(stat.trend.direction)}
          </span>
        )}
        {stat.subtitle}
      </p>
    </div>
  );
};

export default StatCard;