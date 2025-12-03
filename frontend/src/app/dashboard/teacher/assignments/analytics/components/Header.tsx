import { Home, ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, breadcrumbs, actions }: HeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-4 h-4 text-gray-400" />
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}