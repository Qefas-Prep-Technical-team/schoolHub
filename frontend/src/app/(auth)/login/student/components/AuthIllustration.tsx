export default function AuthIllustration() {
    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-indigo-500/10 z-10 pointer-events-none" />
            
            <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/20 shadow-xl shadow-indigo-500/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em]">Learning Node Active</span>
                </div>
            </div>

            <div className="z-20 flex flex-col items-start gap-12 text-white w-full relative">
                <div className="flex flex-col gap-6">
                    <h1 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tighter">
                        Learn Smarter.<br />
                        <span className="text-indigo-400">Achieve More.</span>
                    </h1>
                    <p className="text-xs lg:text-sm text-white/50 font-semibold uppercase tracking-[0.2em] leading-loose max-w-sm">
                        Access your digital learning ecosystem powered by Qefas Core Engine.
                    </p>
                </div>

                <div
                    className="w-full bg-center bg-no-repeat aspect-[16/10] bg-contain drop-shadow-2xl opacity-90 scale-110"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLcQChhL3gejqAiPXKhMX-b3UJyxciIyPKgnqlmfmRdARnXvXbzhijTQVUg8ANpi_irDNBBAhIcco_6NosQl3P7j94y9EWIg8f1GFHvOmyG7Vfkzb7FZUtOnD1BrTpv2oPhi-OsDbqHqKVkz7-R-dAgVjC-Ue0eUXvSf1zUKFxosoCfFvVGnL6S_9I6WogQU3LQGwRFaSQkvosRTVDF_pAOO8IXh7-YGiGx9z96jXv6fukDQiHnrVOUALWaFjqhXHrZB5zwIBJMDM')",
                    }}
                ></div>
            </div>

            <div className="absolute bottom-10 left-10 right-10 h-2 bg-white/5 rounded-full overflow-hidden z-20">
                <div className="h-full bg-indigo-500/50 w-1/3 rounded-full"></div>
            </div>
        </div>
    );
}
