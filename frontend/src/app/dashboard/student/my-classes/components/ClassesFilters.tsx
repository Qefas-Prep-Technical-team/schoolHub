// app/student/classes/components/ClassesFilters.tsx
'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function ClassesFilters() {
  const [searchQuery, setSearchQuery] = useState('')

  const filterOptions = [
    { label: 'All Subjects', value: 'all' },
    { label: 'All Teachers', value: 'teachers' },
    { label: 'All Progress', value: 'progress' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-grow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search for a class..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto">
        {filterOptions.map((option) => (
          <Button 
            key={option.value} 
            variant="outline" 
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {option.label}
            <span className="material-symbols-outlined text-lg text-gray-600 dark:text-gray-400">
              expand_more
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}