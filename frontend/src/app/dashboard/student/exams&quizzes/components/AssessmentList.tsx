import { Assessment } from './types';
import AssessmentItem from './AssessmentItem';

interface AssessmentListProps {
    assessments: Assessment[];
    title?: string;
}

export default function AssessmentList({ assessments, title = 'Assessments' }: AssessmentListProps) {
    console.log('assessments', assessments);
    return (
        <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.length > 0 ? (
                    assessments.map((assessment) => (
                        <AssessmentItem key={assessment.id} assessment={assessment} />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                            <span className="material-symbols-outlined text-3xl">search_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">No Assessments Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs">
                            There are currently no {title.toLowerCase()} available for you. Check back later!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
