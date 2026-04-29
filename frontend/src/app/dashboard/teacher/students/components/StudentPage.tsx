'use client';

import { useState } from 'react';
import Header from './Header';
import ControlsBar from './ControlsBar';
import StudentGrid from './StudentGrid';
import Pagination from './Pagination';


const StudentPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Reset to first page on search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark">
      <div className="relative flex min-h-screen w-full flex-row">
        
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <Header />
            <ControlsBar 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
            <StudentGrid 
              page={currentPage}
              searchQuery={searchQuery}
              limit={itemsPerPage}
              onDataLoaded={(total: number) => setTotalItems(total)}
            />
            
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
