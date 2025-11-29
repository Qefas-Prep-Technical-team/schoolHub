
import OptionItem from "./OptionItem";
import { QuestionOption } from "./type";


interface AnswerOptionsProps {
    options: QuestionOption[];
    onAddOption: () => void;
    onRemoveOption: (id: number) => void;
    onUpdateOptionText: (id: number, text: string) => void;
    onSetCorrectAnswer: (id: number) => void;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
    options,
    onAddOption,
    onRemoveOption,
    onUpdateOptionText,
    onSetCorrectAnswer,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Answer Options
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Provide the possible answers and select the correct one.
            </p>
            <div className="space-y-4">
                {options.map((option) => (
                    <OptionItem
                        key={option.id}
                        option={option}
                        onRemove={() => onRemoveOption(option.id)}
                        onTextChange={(text) => onUpdateOptionText(option.id, text)}
                        onSetCorrect={() => onSetCorrectAnswer(option.id)}
                    />
                ))}
            </div>
            <button
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                onClick={onAddOption}
            >
                <span className="material-symbols-outlined">add_circle</span>
                Add Option
            </button>
        </div>
    );
};

export default AnswerOptions;