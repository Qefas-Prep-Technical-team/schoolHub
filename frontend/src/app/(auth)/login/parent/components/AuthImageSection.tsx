export default function AuthImageSection() {
    return (
        <div className="hidden lg:flex flex-col items-center justify-center gap-8 p-12 bg-secondary-accent dark:bg-secondary-accent-dark">
            <div
                className="w-full max-w-md bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                style={{
                    backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGLl7uFQO7lNKElSxWkUilB3Ed1EbLcQoDPYq4etUdgOp-KpySPmcXgJbao5fY6YVR-XRB0pLYSEpjdcTHGHIqxmB9YVf-JUvNjDNdEUnVJmF9B5JVKJlNv_HnbxzJGAAA3EzaXH4-PGQ_j6PG0EXp0y-pTBixkaA63m_7GCOd_0LOUR03kvTVS8z5RXgJWPm5mrnw5sdIV7OSfO7REwSuPX35-Zn2SwLtrh8gF8Njc7TbqYXWHmocdc6EXfJY6EUVG-aI2IpxXXs")',
                }}
            />
            <div className="text-center">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark">
                    Stay Connected. Support Every Step.
                </h1>
            </div>
        </div>
    );
}
