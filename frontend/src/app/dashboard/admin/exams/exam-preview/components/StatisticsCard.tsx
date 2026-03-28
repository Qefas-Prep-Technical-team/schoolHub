interface StatisticsCardProps {
    statistics: {
        totalQuestions: number;
        multipleChoice: number;
        trueFalse: number;
        essayQuestions: number;
        totalPoints: number;
        estimatedTime: number;
    };
}

export default function StatisticsCard({ statistics }: StatisticsCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Exam Statistics</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                    <span>Total Questions</span>
                    <span className="font-medium text-gray-900 dark:text-white">{statistics.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                    <span>Multiple Choice</span>
                    <span className="font-medium text-gray-900 dark:text-white">{statistics.multipleChoice}</span>
                </div>
                <div className="flex justify-between">
                    <span>True/False</span>
                    <span className="font-medium text-gray-900 dark:text-white">{statistics.trueFalse}</span>
                </div>
                <div className="flex justify-between">
                    <span>Essay Questions</span>
                    <span className="font-medium text-gray-900 dark:text-white">{statistics.essayQuestions}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between">
                    <span>Total Points</span>
                    <span className="font-medium text-gray-900 dark:text-white">{statistics.totalPoints}</span>
                </div>
                <div className="flex justify-between">
                    <span>Estimated Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">{statistics.estimatedTime} mins</span>
                </div>
            </div>
        </div>
    );
}