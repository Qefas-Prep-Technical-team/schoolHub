"use client"
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useClasses } from '@/lib/api/hooks/useClasses'
import { useUpsertTimetablePeriod, useDeleteTimetablePeriod } from '@/lib/api/hooks/useAdmin'
import { Loader2, Trash2 } from 'lucide-react'

const scheduleSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  day: z.string().min(1, 'Day is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  room: z.string().optional(),
})

type ScheduleFormValues = z.infer<typeof scheduleSchema>

interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  teacherId: string
  teacherSubjects: { id: string; name: string }[]
  initialData?: any
  schoolId: string
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  teacherId,
  teacherSubjects,
  initialData,
  schoolId
}: AddScheduleModalProps) {
  const { data: classesResponse, isLoading: isLoadingClasses } = useClasses(schoolId)
  const upsertMutation = useUpsertTimetablePeriod(teacherId)
  const deleteMutation = useDeleteTimetablePeriod(teacherId)

  const classes = Array.isArray(classesResponse)
    ? classesResponse
    : classesResponse?.classes || (classesResponse as any)?.data || []

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      id: '',
      classId: '',
      subjectId: '',
      day: '',
      startTime: '',
      endTime: '',
      room: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id || '',
        classId: initialData.classId || '',
        subjectId: initialData.subjectId || '',
        day: initialData.day || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        room: initialData.room || '',
      })
    } else {
      form.reset({
        id: '',
        classId: '',
        subjectId: '',
        day: '',
        startTime: '',
        endTime: '',
        room: '',
      })
    }
  }, [initialData, form, isOpen])

  const onSubmit = async (values: ScheduleFormValues) => {
    await upsertMutation.mutateAsync(values)
    onClose()
  }

  const onDelete = async () => {
    if (initialData?.id) {
      if (confirm('Are you sure you want to delete this period?')) {
        await deleteMutation.mutateAsync(initialData.id)
        onClose()
      }
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Timetable Period' : 'Add Timetable Period'}</DialogTitle>
        </DialogHeader>

        {isLoadingClasses ? (
          <div className="space-y-6 py-4 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            </div>
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teacherSubjects.map((sub: any) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Room 4A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between items-center pt-4">
              {initialData && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                  {initialData ? 'Update Period' : 'Add Period'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
