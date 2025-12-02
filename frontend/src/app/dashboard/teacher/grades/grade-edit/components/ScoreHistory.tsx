import React from 'react';
import { ScoreHistoryT } from './types';


interface ScoreHistoryProps {
  history: ScoreHistoryT[];
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ history }) => {
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
            {history.map((item, index) => (
              <tr
                key={index}
                className={index < history.length - 1 
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreHistory;