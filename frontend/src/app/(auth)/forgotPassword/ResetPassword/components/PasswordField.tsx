type PasswordFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  icon?: string;
  error?: boolean;
  errorMessage?: string;
};

export default function PasswordField({
  label,
  placeholder,
  type = "password",
  icon = "visibility",
  error,
  errorMessage,
}: PasswordFieldProps) {
  return (
    <label className="flex flex-col w-full flex-1">
      <p className="text-[#0e121b] dark:text-white text-sm font-medium leading-normal pb-2">
        {label}
      </p>
      <div className="flex w-full flex-1 items-stretch rounded-lg">
        <input
          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
            error
              ? "border-red-500"
              : "border-[#d0d7e7] dark:border-white/20"
          } bg-background-light dark:bg-background-dark h-12 placeholder:text-[#4d6599] dark:placeholder:text-slate-500 p-3 rounded-r-none border-r-0 text-base font-normal leading-normal`}
          placeholder={placeholder}
          type={type}
        />
        <div
          className={`text-[#4d6599] dark:text-slate-400 flex border ${
            error
              ? "border-red-500"
              : "border-[#d0d7e7] dark:border-white/20"
          } bg-background-light dark:bg-background-dark items-center justify-center px-3 rounded-r-lg border-l-0`}
        >
          <span className="material-symbols-outlined !text-xl">{icon}</span>
        </div>
      </div>
      {error && (
        <p className="pt-1.5 text-xs text-error">{errorMessage}</p>
      )}
    </label>
  );
}
