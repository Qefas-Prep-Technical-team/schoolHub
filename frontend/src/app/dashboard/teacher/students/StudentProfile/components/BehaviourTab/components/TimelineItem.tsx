import { BehaviourNote, BehaviourType } from "./type";


interface TimelineItemProps {
  note: BehaviourNote;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ note, isLast }) => {
  const getNoteStyles = (type: BehaviourType) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-green-100 dark:bg-green-900/50',
          icon: 'thumb_up',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'negative':
        return {
          bg: 'bg-red-100 dark:bg-red-900/50',
          icon: 'thumb_down',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          icon: 'schedule',
          iconColor: 'text-slate-600 dark:text-slate-400'
        };
    }
  };

  const styles = getNoteStyles(note.type);

  return (
    <div className={`relative flex items-start gap-4 border-l border-slate-200 pl-8 ${
      isLast ? '' : 'pb-8'
    } dark:border-slate-700`}>
      <div className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full ${
        styles.bg
      } ring-8 ring-white dark:ring-slate-900`}>
        <span className={`material-symbols-outlined text-lg ${styles.iconColor}`}>
          {note.icon}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {note.category}
          <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
            {note.date}
          </span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {note.description}
        </p>
      </div>
    </div>
  );
};

export default TimelineItem;