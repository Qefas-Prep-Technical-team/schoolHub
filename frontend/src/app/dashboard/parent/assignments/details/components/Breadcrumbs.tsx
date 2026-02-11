interface BreadcrumbsProps {
  assignmentId: string
}

export default function Breadcrumbs({ assignmentId }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <a
        href="/dashboard"
        className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium transition-colors"
      >
        Dashboard
      </a>
      <span className="material-symbols-outlined text-slate-400 text-base">
        chevron_right
      </span>
      <a
        href="/assignments"
        className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium transition-colors"
      >
        Assignments
      </a>
      <span className="material-symbols-outlined text-slate-400 text-base">
        chevron_right
      </span>
      <span className="text-slate-900 dark:text-white font-semibold">
        History Essay
      </span>
    </div>
  )
}