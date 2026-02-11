import type { QuestionListItemT } from "./type";


interface QuestionListItemProps {
    question: QuestionListItemT;
}

const getQuestionIcon = (type: QuestionListItemT['type']): string => {
    switch (type) {
        case 'Multiple Choice': return 'checklist';
        case 'True/False': return 'rule';
        case 'Short Answer': return 'short_text';
        case 'Essay': return 'edit_note';
        default: return 'help';
    }
};

const QuestionListItem: React.FC<QuestionListItemProps> = ({ question }) => {
    return (
        <li
            className={`p-3 rounded-lg flex items-center justify-between ${question.active
                ? 'bg-primary/10 dark:bg-primary/20 border border-primary/50'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer'
                }`}
        >
            <div className="flex items-center gap-3">
                <span
                    className={`material-symbols-outlined ${question.active
                        ? 'text-primary dark:text-primary/80'
                        : 'text-gray-500'
                        }`}
                >
                    {getQuestionIcon(question.type)}
                </span>
                <div>
                    <p
                        className={`text-sm ${question.active
                            ? 'font-semibold text-primary dark:text-white'
                            : 'font-medium text-gray-800 dark:text-gray-200'
                            }`}
                    >
                        {question.title}
                    </p>
                    <p
                        className={`text-xs ${question.active
                            ? 'text-primary/80 dark:text-primary/70'
                            : 'text-gray-500'
                            }`}
                    >
                        {question.type}
                    </p>
                </div>
            </div>
            <p
                className={`text-sm ${question.active
                    ? 'font-bold text-primary dark:text-white'
                    : 'font-medium text-gray-600 dark:text-gray-300'
                    }`}
            >
                {question.marks} M
            </p>
        </li>
    );
};

export default QuestionListItem;