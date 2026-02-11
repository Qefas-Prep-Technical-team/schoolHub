// src/components/Dashboard/AttemptHistory.tsx
import React from 'react';
import { AttemptHistoryT } from './types';
import Badge from './ui/Badge';

const AttemptHistory: React.FC = () => {
  const attempts: AttemptHistoryT[] = [
    { 
      attempt: 2, 
      score: '85 / 100', 
      date: 'October 26, 2023', 
      isBestScore: true 
    },
    { 
      attempt: 1, 
      score: '70 / 100', 
      date: 'October 24, 2023' 
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Attempt History
      </h3>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
              <tr>
                <th className="p-4 font-semibold">Attempt</th>
                <th className="p-4 font-semibold">Score</th>
                <th className="p-4 font-semibold">Date Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
              {attempts.map((attempt) => (
                <tr key={attempt.attempt}>
                  <td className="p-4">{attempt.attempt}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span>{attempt.score}</span>
                      {attempt.isBestScore && (
                        <Badge variant="success">Best Score</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{attempt.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttemptHistory;