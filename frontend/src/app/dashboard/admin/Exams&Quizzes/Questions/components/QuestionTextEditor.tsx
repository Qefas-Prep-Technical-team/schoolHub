interface QuestionTextEditorProps {
    questionText: string;
    onQuestionTextChange: (text: string) => void;
}

const toolbarButtons = [
    'format_bold',
    'format_italic',
    'format_list_bulleted',
    'format_list_numbered',
    'image',
    'functions'
];

const QuestionTextEditor: React.FC<QuestionTextEditorProps> = ({
    questionText,
    onQuestionTextChange,
}) => {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question
            </p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                <div className="p-2 flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {toolbarButtons.map((icon) => (
                        <button
                            key={icon}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                            <span className="material-symbols-outlined">{icon}</span>
                        </button>
                    ))}
                </div>
                <textarea
                    className="w-full min-h-36 resize-y p-4 border-0 focus:ring-0 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                    placeholder="Type your question here... e.g., 'What is the powerhouse of the cell?'"
                    value={questionText}
                    onChange={(e) => onQuestionTextChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default QuestionTextEditor;