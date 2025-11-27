import Button from './ui/Button'

interface HeaderProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: string
  }
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div className="flex flex-col">
        <h1 className="text-neutral-800 dark:text-neutral-100 text-3xl font-bold leading-tight">
          {title}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-base font-normal leading-normal">
          {description}
        </p>
      </div>
      
      {action && (
        <Button 
          variant="secondary" 
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}