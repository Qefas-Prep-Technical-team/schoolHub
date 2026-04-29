export default function PreviewImage() {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-indigo-500/10 z-10 pointer-events-none" />
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover scale-105"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80\u0026w=2070\u0026auto=format\u0026fit=crop")',
        }}
        data-alt="Abstract dashboard illustration"
      />
      <div className="absolute top-8 left-8 z-20">
         <div className="flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/20 shadow-xl shadow-indigo-500/10">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
            <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em]">Admin Node Online</span>
         </div>
      </div>
      <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl glass-effect">
        <h3 className="text-white font-black text-2xl tracking-tighter mb-2 leading-tight">Empowering Governance</h3>
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest leading-loose">
          Secure infrastructure provided by Qefas Core Engine 01.
        </p>
      </div>
    </div>
  );
}
