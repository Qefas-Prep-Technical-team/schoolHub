import { SubjectInfo } from './types';
import TermSelector from './ui/TermSelector';

interface PageHeaderProps {
  subject: SubjectInfo;
  terms: Array<{ id: string; label: string; active?: boolean }>;
  onTermChange?: (term: { id: string; label: string }) => void;
}

export default function PageHeader({ subject, terms, onTermChange }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black leading-tight tracking-tighter text-text-light dark:text-text-dark md:text-4xl">
          {subject.title}
        </h1>
        <p className="text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
          Teacher: {subject.teacher}
        </p>
      </div>
      
      <TermSelector terms={terms} onTermChange={onTermChange} />
    </div>
  );
}