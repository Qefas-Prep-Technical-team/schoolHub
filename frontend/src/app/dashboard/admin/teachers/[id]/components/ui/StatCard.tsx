interface StatCardProps {
  icon: string
  value: string
  label: string
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20">
        <span className="material-symbols-outlined text-primary text-3xl">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {value}
        </p>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {label}
        </p>
      </div>
    </div>
  )
}