// app/components/PageHeading.tsx
interface PageHeadingProps {
  onAddEntry?: () => void;
}

export default function PageHeading({ onAddEntry }: PageHeadingProps) {
  const handleAddEntry = (): void => {
    if (onAddEntry) {
      onAddEntry();
    } else {
      console.log('Add new behaviour entry');
    }
  };

  return (
    <div className="my-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Eleanor Vance
        </p>
        <p className="text-base font-normal text-gray-500 dark:text-gray-400">
          Behaviour Log
        </p>
      </div>
      <button 
        onClick={handleAddEntry}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        type="button"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        <span>Add New Entry</span>
      </button>
    </div>
  );
}