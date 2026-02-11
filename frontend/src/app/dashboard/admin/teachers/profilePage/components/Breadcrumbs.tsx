interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <a 
              className="text-base font-medium leading-normal text-[#6C757D] hover:text-primary" 
              href={item.href}
            >
              {item.label}
            </a>
          ) : (
            <span className={`text-base font-medium leading-normal ${
              item.active ? 'text-[#343A40] dark:text-gray-200' : 'text-[#6C757D]'
            }`}>
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-base font-medium leading-normal text-[#6C757D]">/</span>
          )}
        </div>
      ))}
    </div>
  )
}