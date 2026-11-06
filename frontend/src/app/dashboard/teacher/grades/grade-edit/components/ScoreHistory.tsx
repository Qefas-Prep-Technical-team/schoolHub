import React, { useMemo, Fragment } from 'react';
import { ScoreHistoryT } from './types';
import { groupByDate } from '@/app/dashboard/teacher/utils/dateSectioning';

interface ScoreHistoryProps {
  history: ScoreHistoryT[];
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ history }) => {
  const groupedHistory = useMemo(() => {
    return groupByDate(history, (item) => item.updatedAt);
  }, [history]);

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 lg:sticky lg:top-28">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Score History
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review of recent changes.
        </p>
      </div>
      <div className="p-4">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 pr-2 font-semibold text-slate-600 dark:text-slate-300">
                Component
              </th>
              <th className="py-2 px-2 font-semibold text-slate-600 dark:text-slate-300 text-right">
                Old Score
              </th>
              <th className="py-2 pl-2 font-semibold text-slate-600 dark:text-slate-300 text-right">
                New Score
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedHistory.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-y border-slate-200/70 dark:border-slate-700/70">
                  <td colSpan={3} className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </div>
                  </td>
                </tr>
                {group.items.map((item, index) => (
                  <tr
                    key={`${group.label}-${index}`}
                    className={
                      index < group.items.length - 1
                        ? 'border-b border-slate-200 dark:border-slate-700'
                        : ''
                    }
                  >
                    <td className="py-3 pr-2 text-slate-700 dark:text-slate-300">
                      {item.component}
                    </td>
                    <td className="py-3 px-2 text-slate-500 dark:text-slate-400 text-right">
                      {item.oldScore}
                    </td>
                    <td className="py-3 pl-2 text-primary dark:text-primary-400 font-bold text-right">
                      {item.newScore}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreHistory;
