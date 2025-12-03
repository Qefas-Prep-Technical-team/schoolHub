interface ExamInfoProps {
  examData: {
    class: string;
    duration: number;
    subject: string;
    totalQuestions: number;
  };
}

export default function ExamInfo({ examData }: ExamInfoProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Class
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {examData.class}
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Duration
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {examData.duration} Minutes
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Subject
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {examData.subject}
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Total Questions
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {examData.totalQuestions}
          </p>
        </div>
      </div>
      
      {/* Preview Mode Notice */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <span className="font-semibold">Preview Mode:</span> This is how the exam will appear to students. 
          Answers are simulated and won&apos;t affect real data.
        </p>
      </div>
    </div>
  );
}