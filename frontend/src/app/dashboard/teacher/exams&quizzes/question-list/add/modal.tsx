'use client';

import AddQuestionPage from "../../add-question/components/AddQuestionPage";


export default function AddQuestionModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-[500px] max-w-full">
        <AddQuestionPage />
      </div>
    </div>
  );
}
