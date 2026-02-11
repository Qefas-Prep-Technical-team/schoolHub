interface Props {
  value: 'grid' | 'list';
  onChange: (value: 'grid' | 'list') => void;
}

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
      <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-gray-900 has-[:checked]:shadow-sm has-[:checked]:text-primary text-gray-500 dark:text-gray-400">
        <span className="material-symbols-outlined">grid_view</span>
        <input
          type="radio"
          name="view-toggle"
          value="grid"
          checked={value === 'grid'}
          onChange={() => onChange('grid')}
          className="invisible w-0"
        />
      </label>
      <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-gray-900 has-[:checked]:shadow-sm has-[:checked]:text-primary text-gray-500 dark:text-gray-400">
        <span className="material-symbols-outlined">list</span>
        <input
          type="radio"
          name="view-toggle"
          value="list"
          checked={value === 'list'}
          onChange={() => onChange('list')}
          className="invisible w-0"
        />
      </label>
    </div>
  );
}