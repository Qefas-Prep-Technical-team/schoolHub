interface LoginButtonProps {
    disabled?: boolean;
    onClick?: () => void;
}

export default function LoginButton({ disabled = false, onClick }: LoginButtonProps) {
    return (
        <button
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white font-bold mt-4 hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
            onClick={onClick}
            type={onClick ? "button" : "submit"}
        >
            <span className="truncate">
                {disabled ?
                    <div
                        className="flex items-center justify-center"
                    >
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing In...
                    </div>
                    : "Login as Parent"}
            </span>
        </button>
    );
}