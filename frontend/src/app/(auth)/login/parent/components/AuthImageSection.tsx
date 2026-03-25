export default function AuthImageSection() {
    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl shadow-xl flex flex-col items-center justify-center">
            <div
                className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover"
                style={{
                    backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGLl7uFQO7lNKElSxWkUilB3Ed1EbLcQoDPYq4etUdgOp-KpySPmcXgJbao5fY6YVR-XRB0pLYSEpjdcTHGHIqxmB9YVf-JUvNjDNdEUnVJmF9B5JVKJlNv_HnbxzJGAAA3EzaXH4-PGQ_j6PG0EXp0y-pTBixkaA63m_7GCOd_0LOUR03kvTVS8z5RXgJWPm5mrnw5sdIV7OSfO7REwSuPX35-Zn2SwLtrh8gF8Njc7TbqYXWHmocdc6EXfJY6EUVG-aI2IpxXXs")',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/90 via-[#0A2540]/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-8 left-6 right-6 z-20 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
                        <span className="material-symbols-outlined text-white">family_restroom</span>
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight">Stay Connected</h3>
                </div>
                <p className="text-white/90 text-sm font-light">
                    "Support every step of their journey with real-time updates."
                </p>
            </div>
        </div>
    );
}
