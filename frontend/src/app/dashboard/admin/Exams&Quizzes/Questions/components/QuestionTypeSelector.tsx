import { QuestionType } from "./type";


interface QuestionTypeSelectorProps {
    questionType: QuestionType;
    onQuestionTypeChange: (type: QuestionType) => void;
}

const questionTypes: QuestionType[] = ['Multiple Choice', 'True/False', 'Short Answer', 'Essay'];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
    questionType,
    onQuestionTypeChange,
}) => {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type
            </p>
            <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900/50 p-1">
                {questionTypes.map((type) => (
                    <label
                        key={type}
                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 ${questionType === type
                                ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white'
                                : 'text-gray-500 dark:text-gray-400'
                            } text-sm font-medium leading-normal transition-colors`}
                    >
                        <span className="truncate">{type}</span>
                        <input
                            className="sr-only"
                            name="question-type"
                            type="radio"
                            value={type}
                            checked={questionType === type}
                            onChange={() => onQuestionTypeChange(type)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionTypeSelector;