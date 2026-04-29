export default function AuthHeader() {
    return (
        <header className="flex flex-col gap-3 lg:hidden mb-10">
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm w-fit">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-md shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 p-1">
                    <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
                    Qefas <span className="text-indigo-600">Hub</span>
                </span>
            </div>
        </header>
    );
}
