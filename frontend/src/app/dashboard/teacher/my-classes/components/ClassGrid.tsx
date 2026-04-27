import ClassCard from "./ClassCard";
import { Class } from "./type";

interface ClassGridProps {
    classes: Class[];
    onClassClick: (classId: string) => void;
}

export default function ClassGrid({ classes, onClassClick }: ClassGridProps) {
    if (classes.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Search Result Null</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">No modules match your current registry filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
                <div key={cls.id} className="w-full flex justify-center">
                    <ClassCard
                        classData={cls}
                        onClick={() => onClassClick(cls.id)}
                    />
                </div>
            ))}
        </div>
    );
}
