"use client";

import TeacherRegisterForm from "./TeacherRegisterForm";

export default function TeacherRegisterContainer() {
  return (
    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
      <div className="mb-6">
        <p className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-800 dark:text-white">
          Join SchoolHub as a Teacher
        </p>
        <p className="mt-2 text-base font-normal leading-normal text-slate-500 dark:text-slate-400">
          Manage your classes independently or under your school’s portal.
        </p>
      </div>
      <TeacherRegisterForm />
    </div>
  );
}
