'use client';

import { useState } from 'react';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <label className="flex flex-col min-w-40 h-11 w-full">
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
        <div className="text-gray-500 dark:text-gray-400 flex bg-gray-100 dark:bg-gray-800 items-center justify-center pl-3.5 rounded-l-lg">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-gray-100 dark:bg-gray-800 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-sm font-normal"
          placeholder="Search by name, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </label>
  );
};

export default SearchBar;