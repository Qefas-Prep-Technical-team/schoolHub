interface BadgeProps {
    children: React.ReactNode;
    variant: 'excellent' | 'passed' | 'needs-improvement' | 'at-risk';
    size?: 'sm' | 'md';
}

export default function Badge({
    children,
    variant,
    size = 'md'
}: BadgeProps) {
    const baseClasses = 'flex items-center gap-2 rounded-full font-medium';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
    };

    const variantClasses = {
        excellent: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        passed: 'bg-primary/10 text-primary dark:bg-primary/20',
        'needs-improvement': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'at-risk': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };

    return (
        <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
            <div className={`size-1.5 rounded-full ${variant === 'excellent' ? 'bg-green-500' :
                    variant === 'passed' ? 'bg-primary' :
                        variant === 'needs-improvement' ? 'bg-orange-500' :
                            'bg-red-500'
                }`} />
            {children}
        </span>
    );
}