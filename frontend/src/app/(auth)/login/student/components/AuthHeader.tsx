export default function AuthHeader() {
    return (
        <header className="flex flex-col gap-3 lg:hidden">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined !text-2xl">school</span>
                </div>
                <span className="text-xl font-bold text-primary dark:text-white">SchoolHub</span>
            </div>
        </header>
    );
}
