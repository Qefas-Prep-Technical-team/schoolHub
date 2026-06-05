import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, UserMinus } from 'lucide-react'
import { studentService } from '@/lib/api/services/studentService'
import { toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ExitStudentModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string
    studentName: string
}

export function ExitStudentModal({ isOpen, onClose, studentId, studentName }: ExitStudentModalProps) {
    const queryClient = useQueryClient()
    const [exitType, setExitType] = useState('TRANSFERRED')
    const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0])
    const [exitReason, setExitReason] = useState('')
    const [exitNotes, setExitNotes] = useState('')

    const exitMutation = useMutation({
        mutationFn: async () => {
            return studentService.exitStudent(studentId, {
                exitType,
                exitDate: new Date(exitDate).toISOString(),
                exitReason,
                exitNotes
            })
        },
        onSuccess: () => {
            toast.success(`Student has been marked as ${exitType.toLowerCase()}`)
            queryClient.invalidateQueries({ queryKey: ['student-details', studentId] })
            queryClient.invalidateQueries({ queryKey: ['school-students'] })
            onClose()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to exit student')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!exitType || !exitDate) {
            toast.error("Exit type and date are required")
            return
        }
        exitMutation.mutate()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2rem] p-8">
                <DialogHeader className="mb-6">
                    <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                        <UserMinus size={24} strokeWidth={2} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Exit Student
                    </DialogTitle>
                    <DialogDescription className="text-sm font-bold text-slate-500">
                        Process the departure of {studentName} from the school. This will close their active enrollment and generate a permanent history record.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Exit Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={exitType}
                                onChange={(e) => setExitType(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                                <option value="TRANSFERRED">Transferred</option>
                                <option value="GRADUATED">Graduated</option>
                                <option value="EXPELLED">Expelled</option>
                                <option value="WITHDRAWN">Withdrawn</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Exit Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={exitDate}
                                onChange={(e) => setExitDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Short Reason (Title)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Moved to another state"
                                value={exitReason}
                                onChange={(e) => setExitReason(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Additional Notes
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Optional context or administrative notes..."
                                value={exitNotes}
                                onChange={(e) => setExitNotes(e.target.value)}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={exitMutation.isPending}
                            className="px-6 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-rose-500/20"
                        >
                            {exitMutation.isPending ? (
                                <><Loader2 size={16} className="animate-spin" /> Processing...</>
                            ) : (
                                "Confirm Exit"
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
