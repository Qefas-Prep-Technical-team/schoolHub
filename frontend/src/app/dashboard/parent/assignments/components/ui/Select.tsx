import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  icon?: React.ReactNode
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, icon, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            w-full appearance-none bg-white dark:bg-surface-dark 
            border border-slate-300 dark:border-slate-700 
            text-slate-900 dark:text-white rounded-xl py-3 pl-11 pr-10 
            focus:ring-primary focus:border-primary font-medium cursor-pointer shadow-sm
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
          expand_more
        </span>
      </div>
    )
  }
)

Select.displayName = 'Select'