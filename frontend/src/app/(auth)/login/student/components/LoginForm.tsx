import PasswordField from "./PasswordField";

export default function LoginForm() {
    return (
        <form className="flex flex-col gap-6">
            <label className="flex flex-col">
                <p className="text-base font-medium pb-2 dark:text-gray-300">Email / Username</p>
                <input
                    type="email"
                    placeholder="Enter your email or username"
                    className="rounded-xl border border-[#cfd7e7] p-[15px] text-base text-[#0d121b] placeholder:text-[#4c669a] focus:border-primary focus:outline-0 dark:border-gray-600 dark:bg-background-dark/50 dark:text-white h-14"
                />
            </label>

            <label className="flex flex-col">
                <p className="text-base font-medium pb-2 dark:text-gray-300">Password</p>
                <PasswordField />
            </label>

            <div className="flex flex-col gap-4">
                <button className="h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 focus:ring-2 focus:ring-primary/50">
                    Login as Student
                </button>
                <a href="#" className="text-center text-sm font-medium text-primary hover:underline">
                    Forgot Password?
                </a>
            </div>
        </form>
    );
}
