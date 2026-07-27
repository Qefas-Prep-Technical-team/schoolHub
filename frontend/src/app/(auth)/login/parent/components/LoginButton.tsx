interface LoginButtonProps {
    disabled?: boolean;
    onClick?: () => void;
}

export default function LoginButton({ disabled = false, onClick }: LoginButtonProps) {
    return (
        <button
            className="flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-orange-600 dark:bg-orange-500 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:bg-orange-500 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            disabled={disabled}
            onClick={onClick}
            type={onClick ? "button" : "submit"}
        >
            <span className="truncate">
                {disabled ?
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-3"></div>
                        Signing in...
                    </div>
                    : "Sign In"}
            </span>
        </button>
    );
}
