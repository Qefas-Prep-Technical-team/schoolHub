import { Metric } from './types';
import Card from './ui/Card';

interface MetricsGridProps {
    metrics: Metric[];
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
    const getTrendColor = (trend?: Metric['trend']) => {
        switch (trend) {
            case 'positive':
                return 'text-green-500';
            case 'negative':
                return 'text-red-500';
            default:
                return 'text-gray-500 dark:text-[#95a5c6]';
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {metrics.map((metric) => (
                <Card key={metric.label} className="flex min-w-[158px] flex-col gap-2 p-5">
                    <p className="text-base font-medium leading-normal text-gray-600 dark:text-white">
                        {metric.label}
                    </p>
                    <p className="text-3xl font-bold leading-tight tracking-light text-gray-900 dark:text-white">
                        {metric.value}
                    </p>
                    {metric.subtext && (
                        <p className={`text-sm font-medium leading-normal ${getTrendColor(metric.trend)}`}>
                            {metric.subtext}
                        </p>
                    )}
                </Card>
            ))}
        </div>
    );
}