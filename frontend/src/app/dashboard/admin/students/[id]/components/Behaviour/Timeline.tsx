// app/components/Timeline.tsx
import { TimelineEvent } from './types';

const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'incident',
    title: 'Incident Report',
    date: 'October 26, 2023',
    description: 'Disruption during assembly. Eleanor was talking loudly with another student after being asked to stop.',
    loggedBy: 'Ms. Jones'
  },
  {
    id: '2',
    type: 'note',
    title: 'Teacher\'s Note',
    date: 'October 24, 2023',
    description: 'Seemed distracted today in class, worth checking in to see if everything is alright at home.',
    loggedBy: 'Mrs. Davis'
  },
  {
    id: '3',
    type: 'merit',
    title: 'Merit Awarded',
    date: 'October 22, 2023',
    description: 'Excellent class participation in the history debate. Showed great critical thinking.',
    loggedBy: 'Mr. Smith'
  }
];

const getEventStyles = (type: TimelineEvent['type']): { 
  bgColor: string; 
  icon: string; 
  iconColor: string;
  badgeColor: string;
  badgeText: string;
} => {
  const styles = {
    incident: {
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      icon: 'priority_high',
      iconColor: 'text-orange-500 dark:text-orange-400',
      badgeColor: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
      badgeText: 'Incident'
    },
    note: {
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      icon: 'sticky_note_2',
      iconColor: 'text-purple-500 dark:text-purple-400',
      badgeColor: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      badgeText: 'Note'
    },
    merit: {
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      icon: 'star',
      iconColor: 'text-green-500 dark:text-green-400',
      badgeColor: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
      badgeText: 'Merit'
    },
    demerit: {
      bgColor: 'bg-red-100 dark:bg-red-900/50',
      icon: 'warning',
      iconColor: 'text-red-500 dark:text-red-400',
      badgeColor: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
      badgeText: 'Demerit'
    }
  };

  return styles[type];
};

export default function Timeline() {
  return (
    <div className="relative mt-8">
      {/* Vertical line */}
      <div 
        aria-hidden="true" 
        className="absolute left-5 top-2 h-full w-0.5 bg-gray-200 dark:bg-gray-700"
      ></div>
      
      {/* Timeline Items */}
      {timelineEvents.map((event: TimelineEvent, index: number) => {
        const styles = getEventStyles(event.type);
        
        return (
          <div key={event.id} className="relative mb-8 flex items-start gap-4">
            {/* Icon */}
            <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.bgColor}`}>
              <span className={`material-symbols-outlined ${styles.iconColor}`}>
                {styles.icon}
              </span>
            </div>
            
            {/* Content */}
            <div className="w-full rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles.badgeColor}`}>
                    {styles.badgeText}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {event.date}
                </p>
              </div>
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {event.description}
              </p>
              
              <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Logged by: {event.loggedBy}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}