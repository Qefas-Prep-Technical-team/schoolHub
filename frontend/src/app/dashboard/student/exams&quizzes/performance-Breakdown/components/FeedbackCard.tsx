import { Feedback } from './types';
import Card from './ui/Card';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface FeedbackCardProps {
    feedback: Feedback;
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
    return (
        <Card className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Teacher&apo;s Feedback
            </h3>

            <div className="space-y-4">
                {/* General Comments */}
                <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        General Comments
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {feedback.general}
                    </p>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Suggested Areas to Study */}
                <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        Suggested Areas to Study
                    </h4>
                    <ul className="mt-2 list-none space-y-2">
                        {feedback.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                                {index === 0 ? (
                                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
                                ) : (
                                    <Lightbulb className="mt-0.5 h-4 w-4 text-yellow-500" />
                                )}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {suggestion}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
    );
}