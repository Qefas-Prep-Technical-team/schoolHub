import InputField from "./InputField";
import LoginButton from "./LoginButton";

export default function LoginForm() {
    return (
        <div className="flex w-full flex-col justify-center gap-6 p-8 sm:p-12">
            <div className="flex flex-col gap-2 text-left">
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">Welcome to the Parent Portal</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">Track Your Child’s Progress</p>
            </div>

            <div className="flex flex-col gap-4">
                <InputField label="Email" icon="mail" type="email" placeholder="Enter your email" />
                <InputField label="Password" icon="lock" type="password" placeholder="Enter your password" />
                <LoginButton />
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center underline cursor-pointer hover:text-primary transition-colors duration-200">
                    Forgot Password?
                </p>
            </div>
        </div>
    );
}
