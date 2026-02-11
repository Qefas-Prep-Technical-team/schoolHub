import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  icon,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  const baseStyles = `flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${fullWidth ? 'w-full' : ''}`;
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-300 dark:hover:bg-gray-600",
    outline: "flex items-center gap-2 rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default Button;