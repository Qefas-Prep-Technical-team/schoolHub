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
    primary: "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-900 dark:hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
    outline: "bg-transparent border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
