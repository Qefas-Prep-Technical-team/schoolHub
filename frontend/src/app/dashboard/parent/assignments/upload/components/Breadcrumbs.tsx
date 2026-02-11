interface BreadcrumbsProps {
  assignmentId: string
}

export default function Breadcrumbs({ assignmentId }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap gap-2 py-4 text-sm">
      <a href="/dashboard" className="text-text-sec-light dark:text-text-sec-dark hover:text-primary transition-colors">
        Dashboard
      </a>
      <span className="text-text-sec-light dark:text-text-sec-dark">/</span>
      <a href="/assignments" className="text-text-sec-light dark:text-text-sec-dark hover:text-primary transition-colors">
        Assignments
      </a>
      <span className="text-text-sec-light dark:text-text-sec-dark">/</span>
      <span className="text-text-main-light dark:text-text-main-dark font-medium">
        Science Fair Project
      </span>
    </nav>
  )
}