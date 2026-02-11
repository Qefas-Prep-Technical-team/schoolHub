import {
    TrendingUp,
    History,
    ChevronRight
} from 'lucide-react';

interface QuickAction {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
}

export default function QuickActions() {
    const actions: QuickAction[] = [
        {
            id: 1,
            title: 'Compare Performance',
            description: 'Vs Class Average',
            icon: <TrendingUp className="h-5 w-5" />,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            id: 2,
            title: 'Exam History',
            description: 'View past grades',
            icon: <History className="h-5 w-5" />,
            iconColor: 'text-orange-600 dark:text-orange-400',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        },
    ];

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                Quick Actions
            </h3>

            {actions.map((action) => (
                <button
                    key={action.id}
                    className="flex items-center justify-between w-full group mb-3 p-3 hover:bg-background-light dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 last:mb-0"
                >
                    <div className="flex items-center gap-3">
                        <div className={`${action.iconBg} ${action.iconColor} p-2 rounded-lg`}>
                            {action.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-text-main dark:text-white">
                                {action.title}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                {action.description}
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
                </button>
            ))}
        </div>
    );
}