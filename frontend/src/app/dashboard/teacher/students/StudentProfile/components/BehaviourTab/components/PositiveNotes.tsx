import { PositiveNote } from "./type";


interface PositiveNotesProps {
  notes: PositiveNote[];
}

const PositiveNotes: React.FC<PositiveNotesProps> = ({ notes }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-slate-900 dark:text-slate-50 text-base font-medium leading-normal">
        Positive Notes
      </h3>
      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <div key={note.id} className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">
                {note.icon}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {note.category}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {note.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositiveNotes;