export default function PageHeading() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-text-light-primary dark:text-dark-primary">
        Results Overview
      </h1>
      {/* Add date range selector or other controls here if needed */}
    </div>
  );
}