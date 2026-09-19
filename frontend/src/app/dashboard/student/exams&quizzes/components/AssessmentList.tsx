import { Assessment } from './types';
import AssessmentItem from './AssessmentItem';

interface AssessmentListProps {
    assessments: Assessment[];
    title?: string;
}

export default function AssessmentList({ assessments, title = 'Assessments' }: AssessmentListProps) {
    return (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">#</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Duration</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Questions</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Score</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="p-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {assessments.length > 0 ? (
                            assessments.map((assessment, idx) => (
                                <AssessmentItem key={assessment.id} assessment={assessment} index={idx + 1} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-20 px-4 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                                            <span className="material-symbols-outlined text-3xl">search_off</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Assessments Found</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                            There are currently no {title.toLowerCase()} available for you. Check back later!
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
