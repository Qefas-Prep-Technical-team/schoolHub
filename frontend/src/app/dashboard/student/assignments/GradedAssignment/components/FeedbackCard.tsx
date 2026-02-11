import { Download, FileText } from 'lucide-react';

interface FeedbackCardProps {
  feedback: string;
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
        <h3 className="mb-4 text-xl font-bold text-[#333333] dark:text-white">Teacher &apo;s Feedback</h3>
        <div className="prose prose-gray max-w-none text-[#333333] dark:text-gray-300">
          {feedback.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <FileText className="h-12 w-12 text-primary" />
        <p className="text-center font-medium text-[#333333] dark:text-gray-200">
          Annotated Essay File
        </p>
        <button className="mt-2 flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90">
          <Download className="h-4 w-4" />
          View Feedback File
        </button>
      </div>
    </div>
  );
}