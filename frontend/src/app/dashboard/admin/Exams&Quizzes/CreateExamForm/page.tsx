import CreateExamForm from './components/CreateExamForm';
import Button from './components/ui/Button';

const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Exams', href: '/exams' },
    { label: 'Create New Exam' },
];

export default function CreateExam() {
    return (

        <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                    Create New Exam
                </h1>

                <div className="flex items-center gap-3">
                    <Button variant="secondary">
                        Save as Draft
                    </Button>
                    <Button>
                        Publish Exam
                    </Button>
                </div>
            </div>
            <CreateExamForm />
        </div>
    );
}