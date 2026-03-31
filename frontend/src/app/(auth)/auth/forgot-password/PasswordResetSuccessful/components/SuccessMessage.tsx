export default function SuccessMessage() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary dark:text-white">
        Password Reset Successful 🎉
      </h1>
      <p className="text-text-secondary dark:text-slate-400">
        Your password has been updated. You can now log in to your account.
      </p>
    </div>
  );
}
