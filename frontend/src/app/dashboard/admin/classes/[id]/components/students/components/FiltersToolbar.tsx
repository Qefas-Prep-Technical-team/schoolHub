import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { FilterOptions } from './types';

interface FiltersToolbarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const FiltersToolbar: React.FC<FiltersToolbarProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, gender: e.target.value as FilterOptions['gender'] });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [FilterOptions['sortBy'], FilterOptions['sortOrder']];
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
      {/* Search */}
      <label className="flex flex-col min-w-40 h-12 w-full col-span-1 lg:col-span-2">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
          <div className="text-gray-500 dark:text-gray-400 flex border-gray-300 dark:border-gray-600 border bg-white dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by name or ID..."
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
          />
        </div>
      </label>

      {/* Gender Filter */}
      <div className="relative h-12">
        <select
          value={filters.gender}
          onChange={handleGenderChange}
          className="form-select w-full h-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary appearance-none pl-4 pr-10"
        >
          <option value="all">Gender: All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
      </div>

      {/* Sort Filter */}
      <div className="relative h-12">
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={handleSortChange}
          className="form-select w-full h-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary appearance-none pl-4 pr-10"
        >
          <option value="name-asc">Sort by: Name A-Z</option>
          <option value="name-desc">Sort by: Name Z-A</option>
          <option value="performance-desc">Best Performing</option>
          <option value="performance-asc">Lowest Performing</option>
          <option value="attendance-desc">Highest Attendance</option>
          <option value="attendance-asc">Lowest Attendance</option>
          <option value="score-desc">Highest Score</option>
          <option value="score-asc">Lowest Score</option>
        </select>
        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default FiltersToolbar;