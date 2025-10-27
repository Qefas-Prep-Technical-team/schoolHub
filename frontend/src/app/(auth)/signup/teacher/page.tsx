"use client";

import TeacherRegisterContainer from "./components/TeacherRegisterContainer";
import TeacherRegisterImage from "./components/TeacherRegisterImage";

export default function TeacherRegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-lg">
        <TeacherRegisterContainer />
        <TeacherRegisterImage />
      </div>
    </div>
  );
}
