import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  onClick,
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 disabled:hover:bg-primary/50",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700",
    outline: "bg-white dark:bg-transparent text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/10"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default Button;