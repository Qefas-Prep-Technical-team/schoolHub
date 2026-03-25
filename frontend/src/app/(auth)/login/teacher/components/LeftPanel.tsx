export default function LeftPanel() {
    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl shadow-xl flex flex-col items-center justify-center">
            <div
                className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2069&auto=format&fit=crop")',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/90 via-[#0A2540]/40 to-[#0A2540]/10 z-10 pointer-events-none" />
            <div className="absolute bottom-8 left-6 right-6 z-20 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
                        <span className="material-symbols-outlined text-white">menu_book</span>
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight">Inspire Minds</h3>
                </div>
                <p className="text-white/90 text-sm font-light">
                    "Empower your classroom with the tools and insights to shape the future."
                </p>
            </div>
        </div>
    );
}
