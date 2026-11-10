"use client"

import { useState, useMemo } from 'react'
import ChildrenGrid from './components/ChildrenGrid'
import PageHeading from './components/PageHeading'
import { ParentChildrenExportModal } from './components/ParentChildrenExportModal'
import { ParentChildDirectorySpreadsheetData } from './utils/parentChildrenSpreadsheetExporter'
import { useParentChildren } from '@/lib/api/hooks/useParentChildren'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { getGradeEvaluation } from '@/utils/gradingSystem'

export default function ChildrenPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const { data: children = [] } = useParentChildren()
  const { user } = useAuthStore()

  const parentName = String(user?.name || 'Parent / Guardian')

  const directoryExportData: ParentChildDirectorySpreadsheetData | null = useMemo(() => {
    const list = Array.isArray(children) ? children : []
    const records = list.filter(Boolean).map((c) => {
      const avg = Number(c?.stats?.averageGrade || 0)
      const customGradingSystem = (c as unknown as { school?: { gradingSystem?: unknown[] } })?.school?.gradingSystem
      const evalResult = getGradeEvaluation(avg, customGradingSystem)

      return {
        id: c.id,
        name: c.name || 'Student',
        studentCode: c.studentCode || 'N/A',
        className: c.currentClass ? `${c.currentClass.name} ${c.currentClass.section || ''}` : 'No Class Assigned',
        schoolName: c.school?.name || 'School Portal',
        attendanceRate: c.stats?.attendanceRate || 0,
        averageGrade: avg,
        letterGrade: evalResult.grade,
        standingRemark: evalResult.remark || 'In Progress',
        status: (c.linkStatus === 'ACCEPTED' || c.linkStatus === 'active') ? 'Active' : 'Pending',
      }
    })

    return {
      parentName,
      totalChildren: records.length,
      records,
    }
  }, [children, parentName])

  const primarySchool = (children[0] as unknown as { school?: { id?: string; plan?: string } })?.school

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      <PageHeading
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportClick={() => setIsExportModalOpen(true)}
      />
      <ChildrenGrid viewMode={viewMode} />

      {/* Multi-Format Academic Directory Export Modal */}
      <ParentChildrenExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={directoryExportData}
        schoolProfile={primarySchool}
        schoolId={primarySchool?.id}
      />
    </div>
  )
}
