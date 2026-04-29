export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 p-8 flex justify-center z-50">
      <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-950 shadow-lg shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 p-1.5">
          <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
          Qefas <span className="text-indigo-600">Hub</span>
        </h2>
      </div>
    </header>
  );
}
