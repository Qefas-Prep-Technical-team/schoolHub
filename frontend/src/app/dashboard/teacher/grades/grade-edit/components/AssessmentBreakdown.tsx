import React from 'react';

import ScoreInput from './ScoreInput';
import { AssessmentScore } from './types';

interface AssessmentBreakdownProps {
  scores: AssessmentScore[];
  onScoreChange: (component: AssessmentScore['component'], value: number) => void;
  gradeSummary: {
    totalScore: number;
    totalMaxScore: number;
    finalGrade: string;
    performance: string;
  };
}

const AssessmentBreakdown: React.FC<AssessmentBreakdownProps> = ({
  scores,
  onScoreChange,
  gradeSummary,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Assessment Breakdown
        </h3>
      </div>
      <div className="p-4">
        {/* Score Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {scores.map((score) => (
            <ScoreInput
              key={score.component}
              label={score.label}
              maxScore={score.maxScore}
              value={score.score}
              onChange={(value) => onScoreChange(score.component, value)}
            />
          ))}
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Total Score
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {gradeSummary.totalScore}{' '}
              <span className="text-base font-medium text-slate-400">
                / {gradeSummary.totalMaxScore}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Final Grade
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {gradeSummary.finalGrade}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Performance
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 w-fit">
              {gradeSummary.performance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBreakdown;