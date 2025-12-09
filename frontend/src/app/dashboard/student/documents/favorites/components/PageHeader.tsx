interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  children 
}: PageHeaderProps) {
  return (
    <header className="flex-1 min-w-0">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}