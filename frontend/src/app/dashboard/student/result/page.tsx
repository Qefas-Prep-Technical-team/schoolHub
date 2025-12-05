'use client';

import { useState } from 'react';
import PageHeading from './components/PageHeading';
import StatsCards from './components/StatsCards';
import Filters from './components/Filters';
import SubjectTable from './components/SubjectTable';
import {
  stats,
  termOptions,
  examTypeOptions,
  subjectOptions,
  subjects,
} from './components/data';

export default function Home() {
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredSubjects(subjects);
      return;
    }

    const filtered = subjects.filter(subject =>
      subject.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  return (
    <div className="relative flex min-h-screen w-full">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <PageHeading />
          <StatsCards stats={stats} />
          <Filters
            termOptions={termOptions}
            examTypeOptions={examTypeOptions}
            subjectOptions={subjectOptions}
            onSearch={handleSearch}
          />
          <SubjectTable subjects={filteredSubjects} />
        </div>
      </main>
    </div>
  );
}