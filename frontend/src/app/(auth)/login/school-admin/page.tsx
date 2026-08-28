"use client";
import LoginCard from "./components/LoginCard";
import PreviewImage from "./components/PreviewImage";
import Footer from "./components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col gap-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mt-8 mb-4 w-[95vw] lg:w-[65vw] max-w-[1000px] flex justify-start">
          <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Portals
          </Link>
        </div>
        <div className="w-[95vw] lg:w-[65vw] max-w-[1000px] bg-white dark:bg-slate-900 md:rounded-[2rem] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[450px] animate-in fade-in zoom-in-95 duration-700">
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <LoginCard />
          </div>
          <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-slate-50 dark:bg-slate-950 p-3 lg:p-6 border-l border-slate-100 dark:border-slate-800">
            <PreviewImage />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
