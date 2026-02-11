import { QuestionOption } from "./type";


interface OptionItemProps {
    option: QuestionOption;
    onRemove: () => void;
    onTextChange: (text: string) => void;
    onSetCorrect: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({
    option,
    onRemove,
    onTextChange,
    onSetCorrect,
}) => {
    return (
        <div className="flex items-center gap-3">
            <input
                className="form-radio h-5 w-5 text-primary focus:ring-primary/50 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                name="correct-answer"
                type="radio"
                checked={option.correct}
                onChange={onSetCorrect}
            />
            <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {option.letter}
                </span>
                <input
                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 pl-8 focus:ring-primary/50 focus:border-primary"
                    placeholder={`Enter option ${option.letter}`}
                    type="text"
                    value={option.text}
                    onChange={(e) => onTextChange(e.target.value)}
                />
            </div>
            <button
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onRemove}
            >
                <span className="material-symbols-outlined">delete</span>
            </button>
        </div>
    );
};

export default OptionItem;