// app/student/classes/[id]/materials/components/SearchAndView.tsx
'use client'

import { Search, List, Grid } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchAndViewProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (mode: 'list' | 'grid') => void
}

export default function SearchAndView({ 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange 
}: SearchAndViewProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search materials by title or teacher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="w-full sm:w-auto">
        <div className="flex h-12 w-full sm:w-64 rounded-lg bg-gray-200/60 dark:bg-gray-800 p-1">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            onClick={() => onViewModeChange('list')}
            className="flex-1 gap-2"
          >
            <List className="h-4 w-4" />
            <span>List View</span>
          </Button>
          
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            onClick={() => onViewModeChange('grid')}
            className="flex-1 gap-2"
          >
            <Grid className="h-4 w-4" />
            <span>Grid View</span>
          </Button>
        </div>
      </div>
    </div>
  )
}