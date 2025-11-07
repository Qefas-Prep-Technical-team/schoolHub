interface SuccessAlertProps {
  message: string;
}

export default function SuccessAlert({ message }: SuccessAlertProps) {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm font-medium text-green-800 dark:text-green-300">
      <span className="material-symbols-outlined text-lg">check_circle</span>
      <p>{message}</p>
    </div>
  );
}
