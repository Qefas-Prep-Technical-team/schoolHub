interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  rows?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  rows = 4
}) => {
  const inputClass = "flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:border-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 text-base font-normal leading-normal";

  return (
    <div className={`flex flex-col ${className}`}>
      <label 
        htmlFor={id}
        className="text-slate-900 dark:text-white text-sm font-medium leading-normal pb-2"
      >
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          className={`${inputClass} resize-y`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`${inputClass} h-12`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default FormInput;