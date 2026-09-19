"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { subjectService, SchemeOfWork } from "../services/subjectService"
import { toast } from "react-toastify"
import { Sparkles, Loader2 } from "lucide-react"

interface CurriculumModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subjectId: string
  nextWeekNumber: number
}

const CurriculumModal: React.FC<CurriculumModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subjectId,
  nextWeekNumber
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<SchemeOfWork>>({
    week: nextWeekNumber,
    topic: "",
    objectives: "",
    resources: "",
    term: 1
  })

  // Reset form when opened with new nextWeekNumber
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        week: nextWeekNumber,
        topic: "",
        objectives: "",
        resources: "",
        term: 1
      })
    }
  }, [isOpen, nextWeekNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.topic?.trim()) {
      toast.error("Topic is required");
      return;
    }

    setIsSaving(true)
    try {
      await subjectService.syncScheme(subjectId, [formData])
      toast.success("Curriculum added successfully!")
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to save curriculum", error)
      toast.error(error.response?.data?.message || "Failed to save curriculum")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 flex flex-col">
        <DialogHeader className="p-8 border-b dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 flex-shrink-0">
          <DialogTitle className="text-2xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-xl"><Sparkles className="h-6 w-6 text-white" /></div>
             Add Curriculum Week
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Week Number</Label>
                <Input 
                  type="number"
                  min="1"
                  required
                  value={formData.week}
                  onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) || 1 })}
                  className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Term (Optional)</Label>
                <Input 
                  type="number"
                  min="1"
                  max="3"
                  value={formData.term || ""}
                  onChange={(e) => setFormData({ ...formData, term: parseInt(e.target.value) || 1 })}
                  className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Topic / Title</Label>
              <Input 
                required
                placeholder="e.g. Introduction to Algebra"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Objectives (Optional)</Label>
              <Textarea 
                placeholder="What should students learn this week?"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="min-h-[100px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Resources & Materials (Optional)</Label>
              <Textarea 
                placeholder="List textbooks, links, or materials needed"
                value={formData.resources}
                onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                className="min-h-[100px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <div className="flex gap-3 w-full sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl h-12 px-8 font-bold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Curriculum"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CurriculumModal
