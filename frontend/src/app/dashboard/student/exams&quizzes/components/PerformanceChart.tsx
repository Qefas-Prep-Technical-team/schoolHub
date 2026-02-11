import Card from './ui/Card';
import ProgressCircle from './ui/ProgressCircle';

export default function PerformanceChart() {
  const performanceScore = 82; // 82%

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-base font-medium text-slate-900 dark:text-white">
        Overall Performance
      </p>

      <div className="flex flex-col items-center">
        <ProgressCircle
          value={performanceScore}
          size={192}
          strokeWidth={12}
          label={`${performanceScore}%`}
          sublabel="Great work"
        />
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          You are performing above the class average. Keep it up!
        </p>
      </div>
    </Card>
  );
}