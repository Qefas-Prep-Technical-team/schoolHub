'use client';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false 
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex flex-grow flex-col">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </span>
        )}
      </span>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-700 dark:peer-focus:ring-primary/80 rtl:peer-checked:after:-translate-x-full"></div>
      </label>
    </div>
  );
}