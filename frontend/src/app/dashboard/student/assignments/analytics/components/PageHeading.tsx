import Button from './ui/Button';
import { ChevronDown } from 'lucide-react';

export default function PageHeading() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
        Assignment Analytics
      </h1>
      <Button>
        <span className="truncate">This Semester</span>
        <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
      </Button>
    </div>
  );
}