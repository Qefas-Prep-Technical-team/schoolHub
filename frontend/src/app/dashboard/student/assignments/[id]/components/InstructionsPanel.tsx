import { Assignment } from './types';

interface Props {
  instructions: Assignment['instructions'];
}

export default function InstructionsPanel({ instructions }: Props) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none rounded-lg bg-white dark:bg-slate-900/50 p-6">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Instructions</h4>
      {instructions ? (
        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {instructions}
        </div>
      ) : (
        <p className="text-slate-500 italic">No additional instructions provided.</p>
      )}
    </div>
  );
}