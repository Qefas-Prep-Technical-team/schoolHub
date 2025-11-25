export default function Header() {
    return (
        <header className="absolute top-0 left-0 z-10 w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <p className="text-xl font-bold text-text-light dark:text-text-dark">SchoolHub</p>
            </div>
        </header>
    );
}
