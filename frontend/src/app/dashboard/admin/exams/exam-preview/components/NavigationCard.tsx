interface NavigationCardProps {
    totalQuestions: number;
}

export default function NavigationCard({ totalQuestions }: NavigationCardProps) {
    const renderQuestionNumbers = () => {
        const numbers = [];

        // Show first 5 numbers
        for (let i = 1; i <= Math.min(5, totalQuestions); i++) {
            numbers.push(
                <a
                    key={i}
                    href={`#question-${i}`}
                    className={`flex items-center justify-center rounded-md h-9 w-9 text-sm font-bold ${i === 1
                            ? 'bg-primary/20 text-primary'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    {i}
                </a>
            );
        }

        // Add ellipsis if there are more than 5 questions
        if (totalQuestions > 5) {
            numbers.push(
                <span key="ellipsis" className="flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 h-9 w-9 text-sm font-bold">
                    ...
                </span>
            );

            // Add last question number
            numbers.push(
                <a
                    key={totalQuestions}
                    href={`#question-${totalQuestions}`}
                    className="flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 h-9 w-9 text-sm font-bold"
                >
                    {totalQuestions}
                </a>
            );
        }

        return numbers;
    };

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Quick Navigation</h3>
            <div className="mt-4 grid grid-cols-5 gap-2">
                {renderQuestionNumbers()}
            </div>
        </div>
    );
}