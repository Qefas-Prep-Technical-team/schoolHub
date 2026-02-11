import { InputHTMLAttributes } from 'react'
import Icon from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
}

export default function Input({ icon, className = '', ...props }: InputProps) {
  const paddingClass = icon ? 'pl-12' : 'pl-4'
  
  return (
    <div className="relative flex w-full items-stretch">
      {icon && (
        <Icon 
          name={icon} 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400" 
        />
      )}
      <input
        className={`
          flex w-full min-w-0 flex-1 resize-none overflow-hidden 
          rounded-lg text-neutral-800 dark:text-neutral-100 
          focus:outline-0 focus:ring-2 focus:ring-primary 
          border-none bg-neutral-200 dark:bg-neutral-800/50 
          h-12 placeholder:text-neutral-600 dark:placeholder:text-neutral-400 
          ${paddingClass} pr-4 text-base font-normal leading-normal 
          ${className}
        `}
        {...props}
      />
    </div>
  )
}