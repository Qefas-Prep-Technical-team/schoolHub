import { ArrowLeft, Download } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="mb-8">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <a className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary" href="#">
          Dashboard
        </a>
        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
        <a className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary" href="#">
          Assignments
        </a>
        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Biology Final Project Analytics
        </span>
      </div>

      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Assignment Analytics
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">Biology 101 Final Project</p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-200/80 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-300/80 dark:hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate">Return to Assignment</span>
          </button>
          
          <button className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            <span className="truncate">Export Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}