import { RubricItem } from './types';
import { Award, Info } from 'lucide-react';

interface Props {
  rubric: RubricItem[];
  totalPoints: number;
}

export default function RubricPanel({ rubric, totalPoints }: Props) {
  const calculateTotal = () => {
    return rubric.reduce((sum, item) => sum + item.points, 0);
  };

  if (!rubric || rubric.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900/40">
        <Award className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No grading rubric specified</p>
        <p className="text-xs text-slate-400 mt-1">This assignment will be assessed directly according to total points ({totalPoints} pts).</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
              Grading Rubric
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Rubric Weight: <span className="font-bold text-slate-800 dark:text-slate-200">{calculateTotal()} pts</span>
            </p>
          </div>
        </div>
        <div className="inline-flex self-start sm:self-auto items-center px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-bold text-xs">
          {totalPoints} Points Total
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {rubric.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50/40 dark:bg-slate-800/20 hover:border-pink-300 dark:hover:border-pink-800/60 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 pr-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {item.category}
                </h4>
                {item.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 inline-flex items-center rounded-lg bg-pink-100/80 dark:bg-pink-950/60 px-2.5 py-1 text-xs font-bold text-pink-700 dark:text-pink-300">
                {item.points} pts
              </span>
            </div>
            
            {item.criteria && (
              <div className="mt-2.5 p-2.5 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1.5">Evaluation Criteria:</span>
                <span className="text-slate-600 dark:text-slate-400">{item.criteria}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-5 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-pink-600 dark:text-pink-400 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">Grading Information:</span> Each category above will be scored independently based on criteria guidelines and calculated into your overall score.
          </div>
        </div>
      </div>
    </div>
  );
}