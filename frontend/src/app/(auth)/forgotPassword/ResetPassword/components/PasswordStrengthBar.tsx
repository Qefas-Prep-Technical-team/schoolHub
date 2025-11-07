export default function PasswordStrengthBar() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        <div className="h-1 rounded-full bg-red-500"></div>
        <div className="h-1 rounded-full bg-gray-200 dark:bg-white/20"></div>
        <div className="h-1 rounded-full bg-gray-200 dark:bg-white/20"></div>
        <div className="h-1 rounded-full bg-gray-200 dark:bg-white/20"></div>
      </div>
      <p className="text-xs font-medium text-red-500">Weak</p>
    </div>
  );
}
