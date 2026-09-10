'use client'

import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { apiClient } from '@/lib/api/client'
import { Loader2 } from 'lucide-react'
import SubmissionList from '@/app/dashboard/admin/assignments/[id]/components/SubmissionList'

interface GradeModalProps {
  assignmentId: string | null
  schoolId: string
  isOpen: boolean
  onClose: () => void
}

export function GradeModal({ assignmentId, schoolId, isOpen, onClose }: GradeModalProps) {
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment-detail', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignment/teacher/${assignmentId}`, {
        headers: { 'x-school-id': schoolId }
      })
      return response.data.data
    },
    enabled: !!assignmentId && isOpen && !!schoolId,
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submissions</DialogTitle>
          <DialogDescription>
            Review and grade student submissions for this assignment.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading submissions...</p>
          </div>
        ) : assignment ? (
          <SubmissionList assignment={assignment} schoolId={schoolId} />
        ) : (
          <div className="text-center py-12 text-slate-500">Failed to load assignment details.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
