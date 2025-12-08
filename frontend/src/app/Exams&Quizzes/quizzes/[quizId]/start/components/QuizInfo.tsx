import { Card } from './ui/Card';
import { Quiz } from './types';
import { Clock, Users, BookOpen } from 'lucide-react';

interface QuizInfoProps {
    quiz: Quiz;
}

export default function QuizInfo({ quiz }: QuizInfoProps) {
    return (
        <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold">{quiz.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {quiz.description}
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>{quiz.duration} Minutes</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span>{quiz.grade}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span>{quiz.subject}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}