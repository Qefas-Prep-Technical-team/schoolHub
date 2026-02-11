interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: Props) {
  return (
    <label className="flex flex-col min-w-40 h-12 w-full">
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
        <div className="text-gray-500 dark:text-gray-400 flex border-none bg-white dark:bg-gray-900/60 items-center justify-center pl-4 rounded-l-lg border-r-0">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 focus:border-primary h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 pl-2 text-base font-normal leading-normal"
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}