export default function AuthIllustration() {
    return (
        <div className="relative hidden h-full w-full items-center justify-center bg-gradient-to-br from-[#43C6AC] to-[#191654] p-10 lg:flex lg:w-1/2">
            <div className="z-10 flex flex-col items-start gap-8 text-white max-w-md">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                        <span className="material-symbols-outlined !text-3xl text-white">school</span>
                    </div>
                    <span className="text-2xl font-bold">SchoolHub</span>
                </div>

                <div className="flex flex-col gap-4">
                    <h1 className="text-5xl font-black leading-tight tracking-tighter">
                        Learn Smarter. Achieve More.
                    </h1>
                    <p className="text-lg text-white/80">
                        Welcome back to SchoolHub, your personal gateway to a world of knowledge.
                    </p>
                </div>

                <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-contain"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLcQChhL3gejqAiPXKhMX-b3UJyxciIyPKgnqlmfmRdARnXvXbzhijTQVUg8ANpi_irDNBBAhIcco_6NosQl3P7j94y9EWIg8f1GFHvOmyG7Vfkzb7FZUtOnD1BrTpv2oPhi-OsDbqHqKVkz7-R-dAgVjC-Ue0eUXvSf1zUKFxosoCfFvVGnL6S_9I6WogQU3LQGwRFaSQkvosRTVDF_pAOO8IXh7-YGiGx9z96jXv6fukDQiHnrVOUALWaFjqhXHrZB5zwIBJMDM')",
                    }}
                ></div>
            </div>
        </div>
    );
}
