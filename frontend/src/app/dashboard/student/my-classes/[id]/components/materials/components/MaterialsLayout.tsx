// app/student/classes/[id]/materials/components/MaterialsLayout.tsx
'use client'

import { useState } from 'react'
import { ClassMaterials } from './materialsData'
import Breadcrumbs from './Breadcrumbs'
import PageHeader from './PageHeader'
import FoldersSidebar from './FoldersSidebar'
import SearchAndView from './SearchAndView'
import MaterialsList from './MaterialsList'


interface MaterialsLayoutProps {
  classMaterials: ClassMaterials
}

export default function MaterialsLayout({ classMaterials }: MaterialsLayoutProps) {
  const [selectedFolder, setSelectedFolder] = useState('All Materials')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const filteredMaterials = classMaterials.materials.filter(material => {
    // Folder filter
    if (selectedFolder !== 'All Materials' && material.folder !== selectedFolder) {
      return false
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        material.title.toLowerCase().includes(query) ||
        material.teacher.toLowerCase().includes(query) ||
        material.type.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumbs className={classMaterials.className} />
      <PageHeader 
        title="Study Materials"
        subtitle={classMaterials.description}
      />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <FoldersSidebar 
          folders={classMaterials.folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
        />
        
        <div className="flex-1">
          <SearchAndView 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          <div className="mt-6">
            <MaterialsList 
              materials={filteredMaterials}
              viewMode={viewMode}
              emptyMessage={
                selectedFolder !== 'All Materials' 
                  ? `No materials found in "${selectedFolder}"`
                  : "No materials found"
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}