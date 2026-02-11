interface BatchGradeHeaderProps {
    title: string;
    description: string;
}

export default function BatchGradeHeader({ title, description }: BatchGradeHeaderProps) {
    return (
        <div className="flex flex-wrap justify-between gap-4">
            <div className="flex min-w-72 flex-col gap-2">
                <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                    {title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                    {description}
                </p>
            </div>
        </div>
    );
}