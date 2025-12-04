import ClassCard from "./ClassCard";
import { Class } from "./type";

interface ClassGridProps {
    classes: Class[];
    onClassClick: (classId: string) => void;
}

export default function ClassGrid({ classes, onClassClick }: ClassGridProps) {
    if (classes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No classes found matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => (
                <ClassCard
                    key={cls.id}
                    classData={cls}
                    onClick={() => onClassClick(cls.id)}
                />
            ))}
        </div>
    );
}