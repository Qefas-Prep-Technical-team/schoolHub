// app/components/Toolbar.jsx
export default function Toolbar() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
        Performance Overview
      </h2>
      <div className="flex gap-2 w-full sm:w-auto">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark gap-2 text-sm font-bold leading-normal tracking-[0.015em] w-full px-4 border border-border-light dark:border-border-dark shadow-sm">
          <span className="truncate">Select Academic Year</span>
          <span className="material-symbols-outlined !text-xl text-text-muted-light dark:text-text-muted-dark">
            expand_more
          </span>
        </button>
        <button className="p-2.5 rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark shadow-sm">
          <span className="material-symbols-outlined !text-xl text-text-muted-light dark:text-text-muted-dark">
            download
          </span>
        </button>
        <button className="p-2.5 rounded-lg bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark shadow-sm">
          <span className="material-symbols-outlined !text-xl text-text-muted-light dark:text-text-muted-dark">
            print
          </span>
        </button>
      </div>
    </div>
  )
}