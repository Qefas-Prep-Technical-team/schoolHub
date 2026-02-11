interface BadgeProps {
    children: React.ReactNode;
    variant: 'exam' | 'quiz' | 'submission' | 'upcoming' | 'completed';
    size?: 'sm' | 'md';
}

export default function Badge({
    children,
    variant,
    size = 'md'
}: BadgeProps) {
    const baseClasses = 'font-medium rounded-full';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
    };

    const variantClasses = {
        exam: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        quiz: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        submission: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        upcoming: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    };

    return (
        <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
            {children}
        </span>
    );
}