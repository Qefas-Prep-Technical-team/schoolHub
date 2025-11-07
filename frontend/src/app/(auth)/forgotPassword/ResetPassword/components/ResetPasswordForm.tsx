import PasswordField from "./PasswordField";
import PasswordStrengthBar from "./PasswordStrengthBar";

export default function ResetPasswordForm() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PasswordField
          label="New Password"
          placeholder="Enter your new password"
        />
        <PasswordStrengthBar />
        <PasswordField
          label="Confirm Password"
          placeholder="Confirm your new password"
          icon="visibility_off"
          error
          errorMessage="Passwords do not match."
        />
      </div>
      <div className="flex flex-col gap-4">
        <button className="flex items-center justify-center gap-2 h-12 px-6 text-base font-semibold text-white rounded-lg bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none w-full">
          Reset Password
        </button>
        <a
          href="#"
          className="text-sm font-semibold text-center text-[#4d6599] dark:text-slate-400 hover:text-primary dark:hover:text-primary"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}
