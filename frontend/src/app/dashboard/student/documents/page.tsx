'use client';

import { useState, useMemo } from 'react';
import Breadcrumbs from './components/Breadcrumbs';
import FilterChips from './components/FilterChips';
import SearchBar from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import DocumentsGrid from './components/DocumentsGrid';
import { 
  mockUser, 
  navItems, 
  filterChips as initialFilters, 
  sortOptions, 
  documents as initialDocuments 
} from './components/data';
import { Document, FilterChip } from './components/types';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [filters, setFilters] = useState<FilterChip[]>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter documents based on active filter
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case 'date_asc':
          return a.uploadDate.getTime() - b.uploadDate.getTime();
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, activeFilter, searchQuery, sortBy]);

  // Handle filter change
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setFilters(filters.map(filter => ({
      ...filter,
      active: filter.id === filterId
    })));
  };

  // Handle favorite toggle
  const handleFavorite = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, isFavorited: !doc.isFavorited } : doc
    ));
  };

  // Handle view action
  const handleView = (id: string) => {
    console.log('View document:', id);
    // Implement view logic
  };

  // Handle download action
  const handleDownload = (id: string) => {
    console.log('Download document:', id);
    // Implement download logic
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Documents' },
  ];

  return (
    <div className="relative flex min-h-screen w-full">
      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />
          
          {/* Page Heading */}
<div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
      Documents
    </h1>
    <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
      Manage all your school-related files in one place.
    </p>
  </div>

  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
    <Link href="/dashboard/student/documents/favorites">
    
    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
    </Link>
  </button>
</div>

          {/* Filter Chips */}
          <FilterChips
            chips={filters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />

          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <SearchBar
              placeholder="Search documents..."
              onSearch={handleSearch}
              className="flex-grow"
            />
            <SortDropdown
              options={sortOptions}
              selectedOption={sortBy}
              onSortChange={setSortBy}
              className="w-full sm:w-48"
            />
          </div>

          {/* Documents Grid */}
          <DocumentsGrid
            documents={filteredDocuments}
            onFavorite={handleFavorite}
            onView={handleView}
            onDownload={handleDownload}
          />

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}