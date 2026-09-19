interface BadgeProps {
  children: React.ReactNode;
  variant: 'coming soon' | 'open' | 'closed' | 'ongoing' | 'graded' | 'submitted' | 'missing';
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
    'coming soon': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'open': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', 
    'closed': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'ongoing': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300', 
    'graded': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    'submitted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'missing': 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

