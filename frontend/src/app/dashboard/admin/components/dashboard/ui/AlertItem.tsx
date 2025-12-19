import { cn } from '@/lib/utils';

interface AlertItemProps {
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  time: string;
  actions?: string[];
}

export default function AlertItem({ 
  title, 
  description, 
  type, 
  time, 
  actions = [] 
}: AlertItemProps) {
  const config = {
    urgent: {
      border: 'border-red-500',
      bg: 'bg-red-50 dark:bg-red-900/10',
      text: 'text-red-700 dark:text-red-400',
      button: 'text-red-700 hover:text-red-900',
    },
    warning: {
      border: 'border-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      text: 'text-orange-700 dark:text-orange-400',
      button: 'text-orange-700 hover:text-orange-900',
    },
    info: {
      border: 'border-slate-300 dark:border-slate-600',
      bg: 'bg-slate-50 dark:bg-slate-800/50',
      text: 'text-slate-700 dark:text-slate-300',
      button: 'text-slate-700 hover:text-slate-900',
    },
  };

  const { border, bg, text, button } = config[type];

  return (
    <div className={cn('p-3 border-l-4 rounded-r-lg', border, bg)}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-bold text-slate-800 dark:text-white">
          {title}
        </p>
        <span className="text-[10px] font-semibold">{time}</span>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
        {description}
      </p>
      {actions.length > 0 && (
        <div className="mt-2 flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                button
              )}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}