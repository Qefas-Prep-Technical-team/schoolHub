export default function PageHeader() {
    return (
        <header className="mb-8 flex flex-wrap justify-between gap-3">
            <div className="flex flex-col gap-1">
                <p className="text-3xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-gray-50 lg:text-4xl">
                    Upcoming Assessments
                </p>
                <p className="text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
                    Here are your scheduled exams and quizzes.
                </p>
            </div>
        </header>
    );
}