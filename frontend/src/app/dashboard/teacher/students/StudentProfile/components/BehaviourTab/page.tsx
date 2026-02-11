'use client';

import { useState } from 'react';

const BehaviourTabStandalone: React.FC = () => {
  const [behaviourScore] = useState({
    score: 85,
    feedback: "Excellent conduct this term. Keep up the great work!"
  });

  const [positiveNotes] = useState([
    { id: 1, category: 'Leadership', date: 'Oct 26, 2023', icon: 'thumb_up' },
    { id: 2, category: 'Helping Others', date: 'Oct 15, 2023', icon: 'volunteer_activism' },
    { id: 3, category: 'Task Completion', date: 'Sep 30, 2023', icon: 'done' }
  ]);

  const [timelineNotes] = useState([
    {
      id: 1,
      type: 'positive',
      category: 'Leadership',
      date: 'Oct 26, 2023',
      description: "Samantha took the initiative to organize her group's project, ensuring everyone had a role and stayed on task. Her leadership was commendable.",
      icon: 'thumb_up'
    },
    {
      id: 2,
      type: 'negative',
      category: 'Class Disruption',
      date: 'Oct 20, 2023',
      description: "Talking with a classmate during the math lecture after being asked to stop. A brief conversation was held after class.",
      icon: 'thumb_down'
    },
    {
      id: 3,
      type: 'positive',
      category: 'Helping Others',
      date: 'Oct 15, 2023',
      description: "Noticed a new student was struggling to find their way and walked them to the library. Showed great empathy and kindness.",
      icon: 'volunteer_activism'
    },
    {
      id: 4,
      type: 'neutral',
      category: 'Punctuality',
      date: 'Sep 25, 2023',
      description: "Arrived 5 minutes late to class due to a music lesson running over. Provided a note from the music teacher.",
      icon: 'schedule'
    }
  ]);

  const handleAddReport = () => {
    console.log('Add behaviour report clicked');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNoteStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return { bg: 'bg-green-100 dark:bg-green-900/50', iconColor: 'text-green-600 dark:text-green-400' };
      case 'negative':
        return { bg: 'bg-red-100 dark:bg-red-900/50', iconColor: 'text-red-600 dark:text-red-400' };
      default:
        return { bg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400' };
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 mt-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-slate-900 dark:text-slate-50 text-4xl font-bold leading-tight tracking-tight">
            Samantha Miller
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            Grade 5, Class 5B
          </p>
        </div>
        <div className="flex items-center justify-end">
          <button 
            className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-primary/90"
            onClick={handleAddReport}
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span className="truncate">Add Behaviour Report</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Behaviour Score Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-slate-900 dark:text-slate-50 text-base font-medium leading-normal">
                Behaviour Score
              </p>
              <p className={`${getScoreColor(behaviourScore.score)} text-2xl font-bold`}>
                {behaviourScore.score}
              </p>
            </div>
            <div className="w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div 
                className={`h-2 rounded-full ${getProgressColor(behaviourScore.score)}`} 
                style={{ width: `${behaviourScore.score}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {behaviourScore.feedback}
            </p>
          </div>

          {/* Positive Notes */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-slate-900 dark:text-slate-50 text-base font-medium leading-normal">
              Positive Notes
            </h3>
            <div className="flex flex-col gap-4">
              {positiveNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                    <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">
                      {note.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {note.category}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {note.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="text-slate-900 dark:text-slate-50 text-base font-medium leading-normal">
            Behaviour Timeline
          </h3>
          <div className="flex flex-col">
            {timelineNotes.map((note, index) => {
              const styles = getNoteStyles(note.type);
              return (
                <div 
                  key={note.id}
                  className={`relative flex items-start gap-4 border-l border-slate-200 pl-8 ${
                    index === timelineNotes.length - 1 ? '' : 'pb-8'
                  } dark:border-slate-700`}
                >
                  <div className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                    styles.bg
                  } ring-8 ring-white dark:ring-slate-900`}>
                    <span className={`material-symbols-outlined text-lg ${styles.iconColor}`}>
                      {note.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {note.category}
                      <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                        {note.date}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {note.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviourTabStandalone;