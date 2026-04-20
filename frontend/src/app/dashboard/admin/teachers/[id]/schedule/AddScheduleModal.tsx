"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Button from '../components/ui/Button'
import { useClasses } from '@/lib/api/hooks/useClasses'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'react-toastify'
import { subjectService } from '../../../subjects/services/subjectService'

const scheduleSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  day: z.string().min(1, 'Day is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  room: z.string().optional()
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  teacherId: string
  schoolId: string
  onSuccess: () => void
}

export default function AddScheduleModal({ isOpen, onClose, teacherId, schoolId, onSuccess }: AddScheduleModalProps) {
  const { data: classes } = useClasses(schoolId)
  
  const { data: subjects } = useQuery({
    queryKey: ['available-subjects', schoolId],
    queryFn: () => subjectService.getSubjects(schoolId)
  })

  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      day: 'Monday'
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true)
    try {
      await apiClient.post(`/admin/teachers/${teacherId}/timetable`, data)
      toast.success('Schedule period added successfully')
      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add schedule period')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#191e2a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Schedule Period</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-4">
            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
              <select 
                {...register('classId')}
                className="w-full bg-gray-50 dark:bg-[#0e121b] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Class</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select 
                {...register('subjectId')}
                className="w-full bg-gray-50 dark:bg-[#0e121b] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Subject</option>
                {subjects?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId.message}</p>}
            </div>

            {/* Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
              <select 
                {...register('day')}
                className="w-full bg-gray-50 dark:bg-[#0e121b] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input 
                  type="time"
                  {...register('startTime')}
                  className="w-full bg-gray-50 dark:bg-[#0e121b] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                <input 
                  type="time"
                  {...register('endTime')}
                  className="w-full bg-gray-50 dark:bg-[#0e121b] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
              </div>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room (Optional)</label>
              <input 
                type="text"
                {...register('room')}
                placeholder="e.g. Lab 1"
                className="w-full bg-gray-50 dark:bg-[#0e121b] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" type="submit" loading={isSubmitting}>
              Add Period
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
