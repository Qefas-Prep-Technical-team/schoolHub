interface StudentExamHeaderProps {
    title: string;
    breadcrumbs: Array<{
        label: string;
        href?: string;
    }>;
}

export default function StudentExamHeader({ title, breadcrumbs }: StudentExamHeaderProps) {
    return (
        <>
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 px-4">
                {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {item.href ? (
                            <a
                                href={item.href}
                                className="text-secondary-text dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary-action"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <span className="text-primary-text dark:text-white text-sm font-medium leading-normal">
                                {item.label}
                            </span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                            <span className="text-secondary-text dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 px-4">
                <h1 className="text-primary-text dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                    {title}
                </h1>
            </div>
        </>
    );
}