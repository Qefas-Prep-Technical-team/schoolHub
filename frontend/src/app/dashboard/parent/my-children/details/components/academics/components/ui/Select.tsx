import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  icon?: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            w-full pl-10 pr-8 py-2.5 rounded-xl bg-surface-light dark:bg-surface-dark 
            border border-border-light dark:border-border-dark text-sm font-medium 
            focus:ring-primary focus:border-primary appearance-none cursor-pointer
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark pointer-events-none text-[20px]">
          arrow_drop_down
        </span>
      </div>
    )
  }
)

Select.displayName = 'Select'