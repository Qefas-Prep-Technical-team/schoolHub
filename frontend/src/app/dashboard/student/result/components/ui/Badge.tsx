interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'solid';
  color?: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'solid',
  color = 'gray',
  size = 'sm',
  className = ''
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-md font-medium ring-1 ring-inset';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  const colorClasses = {
    green: {
      solid: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 ring-green-600/20 dark:ring-green-500/30',
      outline: 'bg-transparent text-green-700 dark:text-green-300 ring-green-700/30 dark:ring-green-500/30',
    },
    blue: {
      solid: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 ring-blue-600/20 dark:ring-blue-500/30',
      outline: 'bg-transparent text-blue-700 dark:text-blue-300 ring-blue-700/30 dark:ring-blue-500/30',
    },
    yellow: {
      solid: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-200 ring-yellow-600/20 dark:ring-yellow-500/30',
      outline: 'bg-transparent text-yellow-700 dark:text-yellow-300 ring-yellow-700/30 dark:ring-yellow-500/30',
    },
    orange: {
      solid: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200 ring-orange-600/20 dark:ring-orange-500/30',
      outline: 'bg-transparent text-orange-700 dark:text-orange-300 ring-orange-700/30 dark:ring-orange-500/30',
    },
    red: {
      solid: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 ring-red-600/20 dark:ring-red-500/30',
      outline: 'bg-transparent text-red-700 dark:text-red-300 ring-red-700/30 dark:ring-red-500/30',
    },
    gray: {
      solid: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-gray-600/20 dark:ring-gray-500/30',
      outline: 'bg-transparent text-gray-700 dark:text-gray-300 ring-gray-700/30 dark:ring-gray-500/30',
    },
  };
type Variant = "solid" | "outline" | "default";

const resolvedVariant = variant === "default" ? "solid" : variant;
  return (
   <span className={`${baseClasses} ${sizeClasses[size]} ${colorClasses[color][resolvedVariant]} ${className}`}>
      {children}
    </span>
  );
}