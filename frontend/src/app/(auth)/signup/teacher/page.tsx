"use client";

import TeacherRegisterContainer from "./components/TeacherRegisterContainer";
import TeacherRegisterImage from "./components/TeacherRegisterImage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TeacherRegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col gap-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mt-8 mb-4 w-[95vw] lg:w-[75vw] max-w-[1000px] flex justify-start">
          <Link href="/signup" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Options
          </Link>
        </div>
        <div className="w-[95vw] lg:w-[75vw] max-w-[1000px] mx-auto bg-white dark:bg-gray-900 md:rounded-[2rem] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[450px]">
            <TeacherRegisterContainer />
            <TeacherRegisterImage />
          </div>
        </div>
      </main>
    </div>
  );
}
