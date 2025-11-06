interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const percentage = Math.round((step / total) * 100);

  return (
    <div className="flex flex-col gap-2 p-4 mb-4">
      <div className="flex gap-6 justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Step {step} of {total}
        </p>
      </div>
      <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
