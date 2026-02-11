import { Plus } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
    const handleCreateNewClass = () => {
        console.log('Create new class');
        // Open create class modal or navigate
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {title}
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                </p>
            </div>
            <button
                onClick={handleCreateNewClass}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                <span>Add Class</span>
            </button>
        </div>
    );
}