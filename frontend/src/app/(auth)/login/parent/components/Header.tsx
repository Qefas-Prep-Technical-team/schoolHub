export default function Header() {
    return (
        <header className="absolute top-0 left-0 right-0 z-10 p-6 md:px-10 lg:px-16">
            <div className="flex items-center justify-between whitespace-nowrap">
                <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
                    <div className="size-6 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">SchoolHub</h2>
                </div>
                <div className="flex items-center">
                    <a className="text-sm font-medium text-text-light dark:text-text-dark" href="#">
                        Parent Portal
                    </a>
                </div>
            </div>
        </header>
    );
}
