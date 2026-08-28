import SchoolCard from "./components/SchoolCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SchoolPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col gap-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mt-8 mb-4 w-[95vw] lg:w-[75vw] max-w-[1000px] flex justify-start">
          <Link href="/signup" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Options
          </Link>
        </div>
        <div className="w-[95vw] lg:w-[75vw] max-w-[1000px]">
          <SchoolCard />
        </div>
      </main>
    </div>
  );
}
