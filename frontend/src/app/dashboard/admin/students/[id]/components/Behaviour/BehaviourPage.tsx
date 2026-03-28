// app/page.tsx

import { StudentProfile } from "@/lib/api/services/studentService";
import PageHeading from './PageHeading';

import StatsCards from './StatsCards';
import Filters from './Filters';
import Timeline from './Timeline';

export default function BehaviourPage({ student }: { student: StudentProfile }) {
  return (
    <main className="w-full flex-1 animate-in fade-in duration-500">
      <div className="mx-auto max-w-5xl">
        <PageHeading />
        <div className="py-8 space-y-8">
          <StatsCards />
          <Filters />
          <Timeline />
        </div>
      </div>
    </main>
  );
}