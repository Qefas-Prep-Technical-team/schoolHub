import { TopicPerformanceT } from './types';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';

interface TopicPerformanceProps {
    topics: TopicPerformanceT[];
}

export default function TopicPerformance({ topics }: TopicPerformanceProps) {
    return (
        <Card className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Topic Performance
            </h3>

            <div className="space-y-5">
                {topics.map((topic) => (
                    <ProgressBar
                        key={topic.topic}
                        value={topic.percentage}
                        label={topic.topic}
                        color={topic.color}
                    />
                ))}
            </div>
        </Card>
    );
}