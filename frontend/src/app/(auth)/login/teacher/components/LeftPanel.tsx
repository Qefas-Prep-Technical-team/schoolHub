export default function LeftPanel() {
    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div
                className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover scale-110"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2069&auto=format&fit=crop")',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-indigo-500/10 z-10 pointer-events-none" />
            
            <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/20 shadow-xl shadow-emerald-500/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[8px] font-black text-emerald-300 uppercase tracking-[0.2em]">Faculty Node Active</span>
                </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl glass-effect">
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
                        <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
                    </div>
                    <h3 className="text-white font-black text-2xl tracking-tighter leading-tight">Inspire Minds</h3>
                </div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest leading-loose">
                    &ldquo;Empowering educators with real-time academic intelligence.&rdquo;
                </p>
            </div>
        </div>
    );
}
