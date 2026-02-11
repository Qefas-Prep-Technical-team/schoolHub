import {
    BookOpen,
    School,
    Calendar,
    Clock,
    HelpCircle,
    Calculator,
    User,
    RotateCcw
} from 'lucide-react';

interface ExamDetailsGridProps {
    details: {
        subject: string;
        className: string;
        dateTime: string;
        duration: string;
        totalQuestions: number;
        totalMarks: number;
        teacher: string;
        attempts: string;
    };
}

export default function ExamDetailsGrid({ details }: ExamDetailsGridProps) {
    const detailItems = [
        {
            icon: BookOpen,
            label: 'Subject',
            value: details.subject
        },
        {
            icon: School,
            label: 'Class',
            value: details.className
        },
        {
            icon: Calendar,
            label: 'Date & Time',
            value: details.dateTime
        },
        {
            icon: Clock,
            label: 'Duration',
            value: details.duration
        },
        {
            icon: HelpCircle,
            label: 'Total Questions',
            value: details.totalQuestions.toString()
        },
        {
            icon: Calculator,
            label: 'Total Marks',
            value: details.totalMarks.toString()
        },
        {
            icon: User,
            label: 'Teacher',
            value: details.teacher
        },
        {
            icon: RotateCcw,
            label: 'Attempts',
            value: details.attempts
        }
    ];

    return (
        <div className="p-4 sm:p-6 bg-card-background dark:bg-background-dark/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
            {detailItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div key={index} className="flex items-start gap-3">
                        <Icon className="text-primary-action mt-0.5" size={20} />
                        <div className="flex flex-col gap-1">
                            <p className="text-secondary-text dark:text-gray-400 text-sm font-normal leading-normal">
                                {item.label}
                            </p>
                            <p className="text-primary-text dark:text-white text-sm font-medium leading-normal">
                                {item.value}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}