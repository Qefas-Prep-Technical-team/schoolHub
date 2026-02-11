import { ClassOption } from "./type";


interface ClassSelectorProps {
  classes: ClassOption[];
  onClassToggle: (classId: number) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ classes, onClassToggle }) => {
  const selectedClasses = classes.filter(cls => cls.selected);

  return (
    <>
      <select 
        className="form-multiselect flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:border-primary p-3 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-normal leading-normal"
        multiple
        size={3}
      >
        {classes.map((cls) => (
          <option 
            key={cls.id} 
            value={cls.id}
            selected={cls.selected}
          >
            {cls.name}
          </option>
        ))}
      </select>

      {selectedClasses.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3">
          {selectedClasses.map((cls) => (
            <span 
              key={cls.id}
              className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-2.5 py-1 rounded-full"
            >
              {cls.name}
              <button 
                onClick={() => onClassToggle(cls.id)}
                className="hover:text-primary/80"
              >
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default ClassSelector;