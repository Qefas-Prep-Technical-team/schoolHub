// app/student/classes/[id]/materials/components/PageHeader.tsx
interface PageHeaderProps {
  title: string
  subtitle: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
        {subtitle}
      </p>
    </div>
  )
}