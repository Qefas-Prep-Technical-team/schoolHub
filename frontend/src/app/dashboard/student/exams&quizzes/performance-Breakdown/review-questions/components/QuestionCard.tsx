import { Question } from './types';
import Card from './ui/Card';
import StatusBadge from './ui/StatusBadge';
import AnswerBox from './ui/AnswerBox';

interface QuestionCardProps {
    question: Question;
    className?: string;
}

export default function QuestionCard({ question, className = '' }: QuestionCardProps) {
    const getAnswerBoxVariant = (status: Question['status']): 'user' | 'correct' | 'explanation' => {
        switch (status) {
            case 'correct':
                return 'user';
            case 'wrong':
                return 'user';
            case 'partially-correct':
                return 'user';
            default:
                return 'user';
        }
    };

    return (
        <Card className={className}>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-lg font-bold leading-tight tracking-tight text-[#0e0e1b] dark:text-white">
                        Question {question.number}
                    </p>
                    <StatusBadge status={question.status} />
                </div>

                {/* Question */}
                <p className="text-base font-normal leading-relaxed text-[#505095] dark:text-gray-300">
                    {question.question}
                </p>

                {/* Answers Section */}
                <div className="space-y-4">
                    {/* User's Answer */}
                    <AnswerBox
                        title="Your Answer:"
                        answer={question.userAnswer}
                        variant={getAnswerBoxVariant(question.status)}
                    />

                    {/* Correct Answer */}
                    <AnswerBox
                        title="Correct Answer:"
                        answer={question.correctAnswer}
                        variant="correct"
                    />

                    {/* Explanation */}
                    <div className="rounded-lg border border-gray-200/80 p-4 dark:border-gray-700/80">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Explanation
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {question.explanation}
                        </p>
                        {question.points !== undefined && question.maxPoints !== undefined && (
                            <div className="mt-3 flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Score:
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {question.points} / {question.maxPoints}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}