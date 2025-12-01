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
  variant = 'secondary',
  icon,
  onClick,
  className = '',
  type = 'button'
}) => {
  const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 text-sm font-bold hover:transition-colors";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "bg-transparent border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default Button;