'use client';

import { ExamEvent } from './types';

interface UpcomingPanelProps {
  exams: ExamEvent[];
}

export default function UpcomingPanel({ exams }: UpcomingPanelProps) {
  return (
    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Next Up</h3>
          <a className="text-primary text-sm font-medium hover:underline" href="#">
            View All
          </a>
        </div>
        
        <div className="flex flex-col gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="group flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`${exam.colorClass.bg} ${exam.colorClass.text} p-2 rounded-lg`}>
                  <span className="material-symbols-outlined text-xl">{exam.icon}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600">
                  {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">{exam.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{exam.subject}</p>
              
              {exam.time && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {exam.time}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Motivational Quote Section */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 aspect-video rounded-lg mb-3 opacity-80 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary/60 dark:text-primary/40">
              lightbulb
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            &apos;Success is the sum of small efforts, repeated day in and day out.&apos;
          </p>
        </div>
      </div>
    </div>
  );
}