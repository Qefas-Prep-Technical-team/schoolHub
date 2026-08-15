export default function AuthImageSection() {
    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div
                className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover scale-110"
                style={{
                    backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGLl7uFQO7lNKElSxWkUilB3Ed1EbLcQoDPYq4etUdgOp-KpySPmcXgJbao5fY6YVR-XRB0pLYSEpjdcTHGHIqxmB9YVf-JUvNjDNdEUnVJmF9B5JVKJlNv_HnbxzJGAAA3EzaXH4-PGQ_j6PG0EXp0y-pTBixkaA63m_7GCOd_0LOUR03kvTVS8z5RXgJWPm5mrnw5sdIV7OSfO7REwSuPX35-Zn2SwLtrh8gF8Njc7TbqYXWHmocdc6EXfJY6EUVG-aI2IpxXXs")',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-indigo-500/10 z-10 pointer-events-none" />
            


            <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl glass-effect">
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
                        <span className="material-symbols-outlined text-white text-2xl">family_restroom</span>
                    </div>
                    <h3 className="text-white font-black text-2xl tracking-tighter leading-tight">Stay Connected</h3>
                </div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest leading-loose">
                    &ldquo;Support every step of their journey with real-time academic intelligence.&rdquo;
                </p>
            </div>
        </div>
    );
}
