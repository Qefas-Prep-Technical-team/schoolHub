interface GradeDistributionProps {
    distribution: Array<{
        grade: string;
        percentage: number;
        color: string;
        hoverColor: string;
    }>;
    overallAverage: string;
    improvement: string;
}

export default function GradeDistribution({
    distribution,
    overallAverage,
    improvement
}: GradeDistributionProps) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">
                    Grade Distribution: Class 7A, Mathematics
                </p>
                <div className="flex gap-1 items-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                        Overall Average:
                    </p>
                    <p className="text-gray-900 dark:text-white text-sm font-bold leading-normal">
                        {overallAverage}
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium leading-normal ml-1 flex items-center gap-1">
                        <span>↑</span>
                        {improvement}
                    </p>
                </div>
            </div>

            <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
                {distribution.map((item, index) => (
                    <div key={index} className="flex flex-col w-full h-full items-center justify-end">
                        <div
                            className={`w-full rounded-t-md transition-colors ${item.color} ${item.hoverColor}`}
                            style={{ height: `${item.percentage}%` }}
                        />
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-[0.015em] pt-2">
                            {item.grade}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}