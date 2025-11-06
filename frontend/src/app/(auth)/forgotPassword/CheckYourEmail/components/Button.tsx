interface ButtonProps {
  text: string;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
}

export default function Button({ text, variant = "primary", onClick }: ButtonProps) {
  const base = "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 text-base font-semibold leading-normal tracking-wide w-full transition-colors";

  const variants = {
    primary: `${base} bg-primary text-white hover:bg-primary/90`,
    secondary: `${base} bg-secondary-button-light dark:bg-secondary-button-dark text-text-light dark:text-text-dark hover:bg-slate-200 dark:hover:bg-slate-600`,
    ghost: `${base} bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`,
  };

  return (
    <button onClick={onClick} className={variants[variant]}>
      <span className="truncate">{text}</span>
    </button>
  );
}
