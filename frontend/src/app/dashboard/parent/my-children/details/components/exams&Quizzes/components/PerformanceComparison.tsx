export default function PerformanceComparison() {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-bold uppercase tracking-wider text-text-sec-light dark:text-text-sec-dark">
        Performance Comparison
      </h4>
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span>Alex Smith</span>
            <span className="text-primary font-bold">92%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-background-light dark:bg-background-dark overflow-hidden">
            <div className="h-full w-[92%] rounded-full bg-primary"></div>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm font-medium text-text-sec-light dark:text-text-sec-dark">
            <span>Class Average</span>
            <span>85%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-background-light dark:bg-background-dark overflow-hidden">
            <div className="h-full w-[85%] rounded-full bg-text-sec-light/30 dark:bg-text-sec-dark/30"></div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-text-sec-light dark:text-text-sec-dark">
        <span className="material-symbols-outlined align-middle text-[18px] text-primary">verified</span>
        Alex scored in the top <span className="font-bold text-text-main-light dark:text-text-main-dark">10%</span> of the class.
      </p>
    </div>
  )
}