"use client";

export default function TeacherRegisterDivider() {
  return (
    <div className="relative pt-2">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">
          Or
        </span>
      </div>
    </div>
  );
}
