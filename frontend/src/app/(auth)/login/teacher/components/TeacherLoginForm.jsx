export default function TeacherLoginForm() {
    return (
        <form className="flex flex-col gap-4">
            <label className="flex flex-col">
                <p className="text-text-light dark:text-text-dark text-base font-medium pb-2">
                    Email Address
                </p>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="form-input rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-gray-700 h-14 p-[15px] text-base text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
            </label>

            <label className="flex flex-col">
                <p className="text-text-light dark:text-text-dark text-base font-medium pb-2">
                    Password
                </p>
                <div className="relative flex w-full">
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="form-input rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-gray-700 h-14 p-[15px] text-base text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-primary pr-12"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark hover:text-text-light dark:hover:text-text-dark"
                    >
                        <span className="material-symbols-outlined">visibility_off</span>
                    </button>
                </div>
            </label>

            <div className="text-right mt-1">
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot Password?
                </a>
            </div>

            <button
                type="submit"
                className="flex items-center justify-center h-14 w-full rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 mt-4"
            >
                Login as Teacher
            </button>
        </form>
    );
}
