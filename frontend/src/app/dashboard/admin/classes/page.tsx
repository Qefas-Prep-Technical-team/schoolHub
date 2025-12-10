'use client';

import { useState, useMemo, useEffect } from 'react';

import StatsCard from './components/StatsCard';
import SearchBar from './components/SearchBar';
import FilterChip from './components/FilterChip';
import ClassGrid from './components/ClassGrid';
import { Button } from './components/ui/Button';
import {
  adminUser,
  navItems,
  statCards,
  filterChips,
  classData,
} from './components/data';

export default function ClassesOverviewPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    grade: 'all',
    classArm: 'all',
    homeroomTeacher: 'all',
    sessionTerm: 'all',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter classes based on search and filters
  const filteredClasses = useMemo(() => {
    return classData.filter((classItem) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          classItem.name.toLowerCase().includes(query) ||
          classItem.teacher.name.toLowerCase().includes(query) ||
          classItem.grade.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Grade filter
      if (filters.grade !== 'all' && filters.grade !== classItem.grade) {
        return false;
      }

      // Class arm filter
      if (filters.classArm !== 'all' && filters.classArm !== classItem.section) {
        return false;
      }

      // Teacher filter
      if (filters.homeroomTeacher !== 'all' && 
          filters.homeroomTeacher !== classItem.teacher.name) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters, classData]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter selection
  const handleFilterSelect = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  // Handle class actions
  const handleViewClass = (classId: string) => {
    console.log('View class:', classId);
    // Navigate to class details
  };

  const handleEditClass = (classId: string) => {
    console.log('Edit class:', classId);
    // Open edit modal
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      console.log('Delete class:', classId);
      // Implement delete logic
    }
  };

  const handleCreateClass = () => {
    console.log('Create new class');
    // Open create class modal
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      grade: 'all',
      classArm: 'all',
      homeroomTeacher: 'all',
      sessionTerm: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed md:relative z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            
              
              <div className="flex items-center gap-3">
                <Button link="/dashboard/admin/classes/create" onClick={handleCreateClass}>
                  Create New Class
                </Button>
                
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <span className="sr-only">Toggle menu</span>
                  <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400 mb-1"></div>
                  <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400 mb-1"></div>
                  <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400"></div>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <StatsCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  changeType={stat.changeType}
                />
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              {/* Search Bar */}
              <SearchBar
                placeholder="Search by class, teacher, grade..."
                onSearch={handleSearch}
                className="flex-grow"
              />

              {/* Filter Chips */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filterChips.map((chip) => (
                  <FilterChip
                    key={chip.id}
                    label={chip.label}
                    value={filters[chip.id] || 'all'}
                    options={chip.options || []}
                    onSelect={(value) => handleFilterSelect(chip.id, value)}
                  />
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || Object.values(filters).some(v => v !== 'all')) && (
              <div className="flex items-center justify-between mb-6 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Active filters:
                  </span>
                  
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs">
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {Object.entries(filters)
                    .filter(([_, value]) => value !== 'all')
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {key}: {value}
                        <button
                          onClick={() => handleFilterSelect(key, 'all')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
                
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Class Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  All Classes ({filteredClasses.length})
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredClasses.length} of {classData.length} classes
                </div>
              </div>
              
              <ClassGrid
                classes={filteredClasses}
                onViewClass={handleViewClass}
                onEditClass={handleEditClass}
                onDeleteClass={handleDeleteClass}
                onCreateClass={handleCreateClass}
              />
            </div>

            {/* Summary Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Summary Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Classes with Complete Timetable</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredClasses.filter(c => c.timetableStatus === 'complete').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Students per Class</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredClasses.length > 0 
                      ? Math.round(filteredClasses.reduce((sum, c) => sum + c.studentCount, 0) / filteredClasses.length)
                      : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredClasses.reduce((sum, c) => sum + c.studentCount, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredClasses.length > 0 
                      ? Math.round(filteredClasses.reduce((sum, c) => sum + c.subjectCount, 0) / filteredClasses.length)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}