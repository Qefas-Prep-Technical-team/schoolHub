import { RubricItem } from './types';

interface Props {
  rubric: RubricItem[];
  totalPoints: number;
}

export default function RubricPanel({ rubric, totalPoints }: Props) {
  const calculateTotal = () => {
    return rubric.reduce((sum, item) => sum + item.points, 0);
  };

  return (
    <div className="rounded-lg bg-white dark:bg-slate-900/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Grading Rubric</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Total: {calculateTotal()} points
          </p>
        </div>
        <div className="text-lg font-bold text-primary">
          {totalPoints} Points Total
        </div>
      </div>
      
      <div className="space-y-4">
        {rubric.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.category}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {item.points} points
              </span>
            </div>
            
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Criteria:
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {item.criteria}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
            info
          </span>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Grading Information
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your submission will be graded based on this rubric. Each category will be scored independently and then totaled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}