'use client';

import { useState } from 'react';
import { FilterOption, Pagination, StudentGrade } from './types';
import GradesHeader from './GradesHeader';
import PageHeader from './PageHeader';
import Filters from './Filters';
import GradesTable from './GradesTable';

const GradesOverview: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const [grades] = useState<StudentGrade[]>([
    {
      id: 1,
      name: 'Olivia Chen',
      studentId: 'S-2041',
      caScore: '18/20',
      assignmentScore: '45/50',
      examScore: '88/100',
      totalScore: '151',
      grade: 'A',
      status: 'Graded'
    },
    {
      id: 2,
      name: 'Ben Carter',
      studentId: 'S-2042',
      caScore: '15/20',
      assignmentScore: '40/50',
      examScore: '75/100',
      totalScore: '130',
      grade: 'B',
      status: 'Graded'
    },
    {
      id: 3,
      name: 'Aisha Khan',
      studentId: 'S-2043',
      caScore: '19/20',
      assignmentScore: '48/50',
      examScore: '92/100',
      totalScore: '159',
      grade: 'A',
      status: 'Graded'
    },
    {
      id: 4,
      name: 'Liam Rodriguez',
      studentId: 'S-2044',
      caScore: '12/20',
      assignmentScore: '35/50',
      examScore: '60/100',
      totalScore: '107',
      grade: 'C',
      status: 'Graded'
    },
    {
      id: 5,
      name: 'Sophia Miller',
      studentId: 'S-2045',
      caScore: '-',
      assignmentScore: '-',
      examScore: '-',
      totalScore: '-',
      grade: '-',
      status: 'Pending'
    }
  ]);

  const filters: FilterOption[] = [
    { label: 'Term: Fall 2024', value: 'fall2024', icon: 'expand_more' },
    { label: 'Class: Grade 10-A', value: 'grade10a', icon: 'expand_more' },
    { label: 'Subject: Mathematics', value: 'mathematics', icon: 'expand_more' }
  ];

  const pagination: Pagination = {
    currentPage,
    totalPages: 5,
    totalItems: 25,
    itemsPerPage: 5
  };

  const handleAddGrade = () => {
    console.log('Add new grade');
    // Open add grade modal or navigate to add grade page
  };

  const handleFilterSelect = (filter: FilterOption) => {
    console.log('Selected filter:', filter);
    // Implement filter logic
  };

  const handleFilter = () => {
    console.log('Open advanced filter');
  };

  const handleSort = () => {
    console.log('Open sort options');
  };

  const handleExport = () => {
    console.log('Export to CSV');
  };

  const handleEditGrade = (gradeId: number) => {
    console.log('Edit grade:', gradeId);
    // Open edit modal or navigate to edit page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real app, fetch data for the new page
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <GradesHeader onAddGrade={handleAddGrade} />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="layout-content-container flex flex-col max-w-7xl mx-auto flex-1">
          <PageHeader onAddGrade={handleAddGrade} />
          
          <Filters 
            filters={filters}
            onFilterSelect={handleFilterSelect}
          />
          
          <GradesTable
            grades={grades}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilter={handleFilter}
            onSort={handleSort}
            onExport={handleExport}
            onEditGrade={handleEditGrade}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default GradesOverview;