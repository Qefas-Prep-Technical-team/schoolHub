interface BadgeProps {
  children: React.ReactNode;
  variant?: "active" | "inactive";
}

export const Badge = ({ children, variant = "active" }: BadgeProps) => {
  const baseClasses =
    "inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium";
  const variants: Record<string, string> = {
    active: "bg-status-active/20 text-status-active",
    inactive: "bg-status-inactive/20 text-status-inactive",
  };

  return <span className={`${baseClasses} ${variants[variant]}`}>{children}</span>;
};
