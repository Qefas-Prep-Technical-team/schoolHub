export default function SchoolProfileLoading() {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-8">
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
        <div className="flex gap-8 px-12">
           <div className="size-40 -mt-20 rounded-[2.5rem] bg-white dark:bg-slate-900 border-8 border-slate-50 dark:border-slate-950 animate-pulse shadow-xl" />
           <div className="flex-1 space-y-4 pt-4">
              <div className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-12">
           <div className="lg:col-span-2 space-y-8">
              <div className="h-64 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
              <div className="h-96 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
           </div>
           <div className="space-y-8">
              <div className="h-80 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
           </div>
        </div>
      </div>
    );
}
