// app/page.tsx

import PageHeading from './PageHeading';

import StatsCards from './StatsCards';
import Filters from './Filters';
import Timeline from './Timeline';

export default function BehaviourPage() {
  return (
    <main className="w-full flex-1 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <PageHeading />
        <div className="py-8">
          <StatsCards />
          <Filters />
          <Timeline />
        </div>
      </div>
    </main>
  );
}