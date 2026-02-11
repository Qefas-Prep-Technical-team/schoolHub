interface TagProps {
  children: string
  variant?: 'primary' | 'secondary'
}

export default function Tag({ children, variant = 'secondary' }: TagProps) {
  const styles = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
  }
  
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}