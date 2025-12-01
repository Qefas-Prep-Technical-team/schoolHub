import { Subject } from "./types";


interface SubjectItemProps {
  subject: Subject;
}

const SubjectItem: React.FC<SubjectItemProps> = ({ subject }) => {
  const getTrendColor = (trend: Subject['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: Subject['trend']) => {
    switch (trend) {
      case 'up':
        return 'arrow_upward';
      case 'down':
        return 'arrow_downward';
      default:
        return 'trending_flat';
    }
  };

  return (
    <div className={`flex items-center gap-4 py-3 cursor-pointer ${subject.active ? 'bg-primary/10 -mx-2 px-2 rounded-lg' : ''}`}>
      <div className={`flex items-center justify-center rounded-lg shrink-0 size-10 ${
        subject.active 
          ? 'text-primary bg-primary/20' 
          : 'text-text-primary-light dark:text-text-primary-dark bg-gray-200 dark:bg-gray-700'
      }`}>
        <span className="material-symbols-outlined">{subject.icon}</span>
      </div>
      
      <div className="flex flex-col justify-center grow">
        <p className={`text-base font-medium leading-normal ${
          subject.active ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark'
        }`}>
          {subject.name}
        </p>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal">
          {subject.teacher}
        </p>
      </div>
      
      <div className={`flex items-center gap-1 ${getTrendColor(subject.trend)}`}>
        <span className="material-symbols-outlined text-base">
          {getTrendIcon(subject.trend)}
        </span>
      </div>
      
      <div className="shrink-0">
        <p className={`text-base ${subject.active ? 'font-bold text-primary' : 'font-normal text-text-primary-light dark:text-text-primary-dark'}`}>
          {subject.score}%
        </p>
      </div>
    </div>
  );
};

export default SubjectItem;