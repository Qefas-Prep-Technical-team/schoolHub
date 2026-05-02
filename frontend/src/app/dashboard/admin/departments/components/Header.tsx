import { LucideIcon } from "lucide-react"

interface HeaderProps {
  title: string
  description: string
  icon?: LucideIcon
  children?: React.ReactNode
}

export default function Header({ title, description, icon: Icon, children }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  )
}

