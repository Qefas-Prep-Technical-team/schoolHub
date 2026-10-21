import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateExamForm from './components/CreateExamForm';

export default async function CreateExamPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const params = await searchParams;
    const category = params?.category;
    const typeLabel = category === "CA" ? "CA" : category === "QUIZ" ? "Quiz" : "Exam";

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-6">
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/admin/exams"
                        className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm shrink-0"
                        title="Back to assessments"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Create New {typeLabel}
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Set up essential details for your {typeLabel.toLowerCase()} before adding subject papers.
                        </p>
                    </div>
                </div>
            </div>
            
            <CreateExamForm />
        </div>
    );
}
