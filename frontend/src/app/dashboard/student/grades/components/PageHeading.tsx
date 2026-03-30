import { GraduationCap } from "lucide-react";

export default function PageHeading() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-text-light-primary dark:text-dark-primary flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          Academic Grades
        </h1>
        <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
          View your official course performance and exam results.
        </p>
      </div>
    </div>
  );
}
