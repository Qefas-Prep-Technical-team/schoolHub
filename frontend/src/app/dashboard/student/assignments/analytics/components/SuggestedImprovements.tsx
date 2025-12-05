import { ImprovementTip } from './types';
import Card from './ui/Card';

interface SuggestedImprovementsProps {
  tips: ImprovementTip[];
}

export default function SuggestedImprovements({ tips }: SuggestedImprovementsProps) {
  return (
    <Card className="sticky top-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">How to Improve</h3>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'wght' 600" }}
          >
            auto_awesome
          </span>
          AI Generated
        </span>
      </div>
      <div className="space-y-4">
        {tips.map((tip) => (
          <div key={tip.id} className="flex items-start gap-4">
            <div className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full ${tip.iconBgColor}`}>
              <span className={`material-symbols-outlined text-base ${tip.iconColor}`}>
                {tip.icon}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{tip.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}