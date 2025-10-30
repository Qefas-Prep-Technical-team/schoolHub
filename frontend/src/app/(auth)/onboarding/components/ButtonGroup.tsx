"use client";

export default function ButtonGroup() {
  return (
    <div className="flex w-full flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
      <button className="flex h-12 w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-button-secondary-light text-text-light transition-colors hover:bg-gray-300 dark:bg-button-secondary-dark dark:text-text-dark dark:hover:bg-gray-600 sm:w-auto sm:px-8">
        <span className="truncate text-base font-bold">Back</span>
      </button>
      <button className="flex h-12 w-full min-w-[84px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white transition-colors hover:bg-primary/90 sm:w-auto sm:flex-initial sm:px-8">
        <span className="truncate text-base font-bold">Next</span>
      </button>
    </div>
  );
}
