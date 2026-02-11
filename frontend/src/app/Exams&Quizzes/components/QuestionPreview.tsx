interface QuestionPreviewProps {
    question: {
        number: number;
        text: string;
        options: string[];
    };
}

export default function QuestionPreview({ question }: QuestionPreviewProps) {
    return (
        <div className="p-4 sm:p-6 bg-card-background dark:bg-background-dark/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
                Question Format Preview
            </h3>

            <div className="space-y-4 filter blur-sm select-none pointer-events-none">
                <p className="text-primary-text dark:text-white font-medium">
                    {question.number}. {question.text}
                </p>

                <div className="space-y-2 pl-4">
                    {question.options.map((option, index) => (
                        <label key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed">
                            <input
                                className="form-radio text-gray-400"
                                disabled
                                name="sample-q1"
                                type="radio"
                            />
                            <span className="text-secondary-text">{option}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}