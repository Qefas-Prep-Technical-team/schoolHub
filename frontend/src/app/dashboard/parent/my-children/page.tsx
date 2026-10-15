"use client"

import { useState } from 'react'
import ChildrenGrid from './components/ChildrenGrid'
import PageHeading from './components/PageHeading'

export default function ChildrenPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      <PageHeading viewMode={viewMode} onViewModeChange={setViewMode} />
      <ChildrenGrid viewMode={viewMode} />
    </div>
  )
}
