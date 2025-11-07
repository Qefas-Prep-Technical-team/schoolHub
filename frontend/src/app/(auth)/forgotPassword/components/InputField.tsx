interface InputFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
  return (
    <label className="flex flex-col w-full">
      <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
        {label}
      </p>
      <input
        type="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input flex w-full rounded-lg h-12 px-4 text-base font-normal leading-normal border-none focus:outline-0 focus:ring-2 focus:ring-primary/50 bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark"
      />
    </label>
  );
}
