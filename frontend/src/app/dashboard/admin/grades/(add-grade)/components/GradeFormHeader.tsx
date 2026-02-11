import { X } from 'lucide-react';
import Button from './ui/Button';


interface GradeFormHeaderProps {
    title: string;
    onClose: () => void;
}

export default function GradeFormHeader({ title, onClose }: GradeFormHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
            </h1>
            <Button
                variant="icon"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300"
            >
                <X size={20} />
            </Button>
        </div>
    );
}