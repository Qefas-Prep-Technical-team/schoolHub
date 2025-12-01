'use client';

import { useState } from 'react';
import Header from './Header';
import ControlsBar from './ControlsBar';
import StudentGrid from './StudentGrid';
import Pagination from './Pagination';


const StudentPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const totalItems = 42;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark">
      <div className="relative flex min-h-screen w-full flex-row">
        
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <Header />
            <ControlsBar />
            <StudentGrid />
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPage;