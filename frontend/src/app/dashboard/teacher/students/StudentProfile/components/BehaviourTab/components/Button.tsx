import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  onClick,
  className = '',
  type = 'button'
}) => {
  const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-bold leading-normal tracking-[0.015em] transition-colors";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600",
    outline: "bg-transparent border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="material-symbols-outlined text-xl">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default Button;