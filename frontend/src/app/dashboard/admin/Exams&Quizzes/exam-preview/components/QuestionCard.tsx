import { Edit } from 'lucide-react';
import Badge from './ui/Badge';

interface QuestionCardProps {
    question: {
        number: number;
        type: 'multiple_choice' | 'true_false' | 'essay';
        question: string;
        options?: string[];
        correctAnswer?: string;
        marks: number;
        difficulty: 'easy' | 'medium' | 'hard';
        topic: string;
    };
    onEdit: (questionId: number) => void;
    showAnswers?: boolean;
}

export default function QuestionCard({ question, onEdit, showAnswers = false }: QuestionCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return { bg: 'bg-primary/20', text: 'text-primary' };
            case 'medium':
                return { bg: 'bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400' };
            case 'hard':
                return { bg: 'bg-red-500/20', text: 'text-red-600 dark:text-red-400' };
            default:
                return { bg: 'bg-gray-200', text: 'text-gray-700' };
        }
    };

    const difficultyColor = getDifficultyColor(question.difficulty);

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'Multiple Choice';
            case 'true_false':
                return 'True/False';
            case 'essay':
                return 'Essay';
            default:
                return type;
        }
    };

    const isCorrectAnswer = (option: string, index: number) => {
        if (!showAnswers) return false;

        if (question.type === 'multiple_choice') {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            return optionLetter === question.correctAnswer;
        }

        if (question.type === 'true_false') {
            return option === question.correctAnswer;
        }

        return false;
    };

    return (
        <div id={`question-${question.number}`} className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Question {question.number} - {getQuestionTypeLabel(question.type)}
                    </p>
                    <p className="mt-1 text-base text-gray-800 dark:text-gray-200">
                        {question.question}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {question.marks} Marks
                    </span>
                    <button
                        onClick={() => onEdit(question.number)}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                    >
                        <Edit size={20} />
                    </button>
                </div>
            </div>

            {question.options && question.options.length > 0 && (
                <div className={`grid gap-3 text-sm ${question.type === 'true_false' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                    {question.options.map((option, index) => {
                        const isCorrect = isCorrectAnswer(option, index);
                        const optionLetter = question.type === 'multiple_choice'
                            ? `${String.fromCharCode(65 + index)}.`
                            : '';

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-3 rounded-lg border p-3 ${isCorrect
                                    ? 'border-green-500/50 bg-green-500/10 dark:border-green-400/50 dark:bg-green-400/10'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <span className="font-bold">{optionLetter}</span>
                                <span>{option}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {question.type === 'essay' && (
                <div className="mt-2 text-gray-400 dark:text-gray-500 italic p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    Essay answer placeholder...
                </div>
            )}

            <div className="flex gap-2 mt-2">
                <Badge className={`${difficultyColor.bg} ${difficultyColor.text}`}>
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </Badge>
                <Badge variant="secondary">
                    {question.topic}
                </Badge>
            </div>
        </div>
    );
}