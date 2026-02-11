import { RubricItem } from './types';
import Card from './ui/Card';

interface RubricBreakdownProps {
  items: RubricItem[];
  title?: string;
}

export default function RubricBreakdown({ items, title = 'Rubric Breakdown' }: RubricBreakdownProps) {
  return (
    <Card padding="none">
      <h2 className="border-b border-gray-200 px-6 py-4 text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:border-gray-700/80 dark:text-white">
        {title}
      </h2>
      <div className="flow-root">
        <div className="divide-y divide-gray-200 dark:divide-gray-700/80">
          {items.map((item) => (
            <div key={item.category} className="flex items-center justify-between gap-4 p-6">
              <p className="text-gray-700 dark:text-gray-300">{item.category}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{item.score}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}