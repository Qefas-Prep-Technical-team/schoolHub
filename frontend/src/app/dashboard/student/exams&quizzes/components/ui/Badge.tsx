interface BadgeProps {
  children: React.ReactNode;
  variant: 'upcoming' | 'active' | 'ongoing' | 'taken' | 'graded' | 'submitted' | 'missing';
  size?: 'sm' | 'md';
}

export default function Badge({ 
  children, 
  variant,
  size = 'md'
}: BadgeProps) {
  const baseClasses = 'inline-block font-semibold rounded-full';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    upcoming: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    active: 'bg-blue-100 text-pink-800 dark:bg-pink-900/50 dark:text-blue-300',
    ongoing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    taken: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    graded: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    submitted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    missing: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

