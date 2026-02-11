interface BadgeProps {
  children: React.ReactNode;
  variant?: 'graded' | 'pending' | 'missing';
  size?: 'sm' | 'md';
}

export default function Badge({ 
  children, 
  variant = 'graded',
  size = 'md'
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    graded: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    missing: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}