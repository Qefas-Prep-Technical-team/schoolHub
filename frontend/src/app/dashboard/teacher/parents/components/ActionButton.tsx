interface ActionButtonProps {
    variant: 'primary' | 'secondary';
    icon: string;
    label: string;
    onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ variant, icon, label, onClick }) => {
    const baseStyles = "flex flex-1 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:transition-colors";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]}`}
            onClick={onClick}
        >
            <span className="material-symbols-outlined text-base">{icon}</span>
            <span className="truncate">{label}</span>
        </button>
    );
};

export default ActionButton;