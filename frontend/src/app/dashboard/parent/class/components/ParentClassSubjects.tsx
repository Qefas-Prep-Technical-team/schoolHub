"use client";

import React from 'react';
import { BookOpen } from 'lucide-react';

interface ParentClassSubjectsProps {
  classSubjects: any[];
}

export default function ParentClassSubjects({ classSubjects }: ParentClassSubjectsProps) {
  if (!classSubjects || classSubjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Subjects Found</h3>
        <p className="text-sm text-slate-500 font-medium">
          There are no subjects assigned to this student's class yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {classSubjects.map((cs) => {
        const subject = cs.subject || cs;
        return (
          <div key={cs.id || subject.id} className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  {subject.code || "N/A"}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {subject.name}
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4">
                {subject.description || "No description provided."}
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-400 mb-1">Assigned Teacher</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {subject.teacher?.name || "Not Assigned"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
