export default function Header() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 p-6 md:p-10 lg:p-12">
            <div className="flex items-center justify-between whitespace-nowrap max-w-[1400px] mx-auto">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 p-1.5 transition-transform hover:rotate-3 duration-300">
                        <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
                        Qefas <span className="text-indigo-600">Hub</span>
                    </h2>
                </div>
                <div className="flex items-center">
                    <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-sm">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                            Parent Portal
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
