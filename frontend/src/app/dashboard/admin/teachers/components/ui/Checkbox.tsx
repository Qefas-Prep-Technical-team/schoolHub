import { InputHTMLAttributes } from 'react'

export default function Checkbox({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={`form-checkbox rounded border-neutral-400 dark:border-neutral-600 bg-transparent text-primary focus:ring-primary/50 ${className}`}
      {...props}
    />
  )
}