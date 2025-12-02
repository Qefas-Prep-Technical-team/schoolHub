import React from 'react';

interface TeacherFeedbackProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  notifyParent: boolean;
  onNotifyParentChange: (notify: boolean) => void;
}

const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({
  comment,
  onCommentChange,
  notifyParent,
  onNotifyParentChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-base font-bold text-slate-800 dark:text-slate-200" htmlFor="comment">
          Comments / Teacher Feedback
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add optional feedback for the student or parent."
          rows={4}
          className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary p-3 resize-none"
        />
      </div>
      
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifyParent}
              onChange={(e) => onNotifyParentChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Notify parent about updated score
          </label>
        </div>
      </div>
    </div>
  );
};

export default TeacherFeedback;