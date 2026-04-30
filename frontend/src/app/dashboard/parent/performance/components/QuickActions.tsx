import {
    TrendingUp,
    History,
    ChevronRight,
    FileText,
    Target
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
    href: string;
}

export default function QuickActions() {
    const actions: QuickAction[] = [
        {
            id: 1,
            title: 'Subject Analysis',
            description: 'In-depth performance breakdown',
            icon: <Target className="h-5 w-5" />,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            href: '/dashboard/parent/performance/subject-performance'
        },
        {
            id: 2,
            title: 'Exam Records',
            description: 'View full history of results',
            icon: <FileText className="h-5 w-5" />,
            iconColor: 'text-orange-600 dark:text-orange-400',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            href: '/dashboard/parent/exams&results'
        },
    ];

    return (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                Quick Actions
            </h3>

            <div className="flex flex-col gap-4">
                {actions.map((action) => (
                    <Link
                        key={action.id}
                        href={action.href}
                        className="flex items-center justify-between w-full group p-4 bg-slate-50 dark:bg-white/5 hover:bg-orange-600 hover:text-white rounded-[1.5rem] transition-all duration-300 border border-slate-100 dark:border-white/5 hover:border-orange-500 shadow-sm hover:shadow-xl hover:shadow-orange-600/20 active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${action.iconBg} ${action.iconColor} p-3 rounded-2xl group-hover:bg-white/20 group-hover:text-white transition-colors`}>
                                {action.icon}
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-black uppercase tracking-tight">
                                    {action.title}
                                </p>
                                <p className="text-[10px] font-bold opacity-60 group-hover:opacity-100 uppercase tracking-widest mt-0.5">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

