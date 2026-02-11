/* eslint-disable @typescript-eslint/no-explicit-any */
import QuestionCard from './QuestionCard';

interface QuestionListProps {
    questions: any[];
    onEditQuestion: (questionId: number) => void;
    showAnswers?: boolean;
}

export default function QuestionList({ questions, onEditQuestion, showAnswers }: QuestionListProps) {
    return (
        <div className="flex flex-col gap-4 px-4">
            {questions.map((question) => (
                <QuestionCard
                    key={question.id}
                    question={question}
                    onEdit={onEditQuestion}
                    showAnswers={showAnswers}
                />
            ))}
        </div>
    );
}