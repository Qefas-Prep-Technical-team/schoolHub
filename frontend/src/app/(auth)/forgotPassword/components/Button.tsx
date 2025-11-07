import React, { FC } from 'react';

interface ButtonProps {
  text: string;
  variant?: "primary" | "ghost";
  onClick?: () => void;
}

const Button = ({ text, variant = "primary", onClick }: ButtonProps) => {

    const base =
    "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg px-5 w-full transition-colors";

  const variants = {
    primary:
      `${base} h-12 bg-primary text-white text-base font-bold tracking-[0.015em] hover:bg-primary/90`,
    ghost:
      `${base} h-10 bg-transparent text-text-light dark:text-text-dark text-sm font-bold tracking-[0.015em] hover:bg-black/5 dark:hover:bg-white/10`,
  };
  return (
   <button onClick={onClick} className={variants[variant]}>
    <span className="truncate">{text}</span>
  </button>
  );
};

export default Button;
