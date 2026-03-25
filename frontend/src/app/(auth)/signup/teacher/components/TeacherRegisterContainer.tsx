"use client";

import TeacherRegisterForm from "./TeacherRegisterForm";

export default function TeacherRegisterContainer() {
  return (
    <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
      <div className="mb-6">
        <p className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-slate-800 dark:text-white">
          Join SchoolHub as a Teacher
        </p>
        <p className="mt-2 text-lg font-normal leading-normal text-slate-500 dark:text-slate-400">
          Manage your classes independently or under your school’s portal.
        </p>
      </div>
      <TeacherRegisterForm />
    </div>
  );
}
