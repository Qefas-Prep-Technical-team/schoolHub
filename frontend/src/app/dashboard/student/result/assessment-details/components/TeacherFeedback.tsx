import Card from './ui/Card';

interface TeacherFeedbackProps {
  feedback: string;
  title?: string;
}

export default function TeacherFeedback({ feedback, title = 'Teacher Feedback' }: TeacherFeedbackProps) {
  return (
    <Card padding="none">
      <h2 className="border-b border-gray-200 px-6 py-4 text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:border-gray-700/80 dark:text-white">
        {title}
      </h2>
      <div className="p-6">
        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {feedback}
        </p>
      </div>
    </Card>
  );
}