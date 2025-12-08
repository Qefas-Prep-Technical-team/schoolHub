

export default function PageHeader() {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
          Performance Analytics
        </h1>
        <p className="text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
          Welcome back, Alex!
        </p>
      </div>
    </header>
  );
}