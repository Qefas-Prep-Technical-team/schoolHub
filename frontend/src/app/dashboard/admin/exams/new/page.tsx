import CreateExamForm from './components/CreateExamForm';

export default function CreateExamPage({ searchParams }: { searchParams: { category?: string } }) {
    const category = searchParams.category;
    const typeLabel = category === "CA" ? "CA" : category === "QUIZ" ? "Quiz" : "Exam";

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Create New {typeLabel}
                </h1>
                <p className="text-muted-foreground text-sm">
                    Set up the essential details for your {typeLabel.toLowerCase()} before adding subject papers.
                </p>
            </div>
            
            <CreateExamForm />
        </div>
    );
}
