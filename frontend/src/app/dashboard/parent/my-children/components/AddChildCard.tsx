'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { linkService } from '@/lib/api/services/linkService'
import { useToast } from '@/lib/hooks/useToast'

export default function AddChildCard() {
  const [studentCode, setStudentCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const toast = useToast()

  const handleLinkChild = async () => {
    if (!studentCode.trim()) {
      toast.error.validation("Please enter a student code")
      return
    }

    try {
      setIsSubmitting(true)
      await linkService.createLinkRequest({
        targetCode: studentCode.trim(),
        linkType: 'PARENT_STUDENT',
        note: 'Linking child to parent account'
      })
      
      toast.success.show("Link request sent successfully. Once the student or admin accepts, you'll see them here.")
      setIsOpen(false)
      setStudentCode('')
    } catch (error: any) {
      console.error('Link request failed:', error)
      toast.error.show(error.response?.data?.message || "Make sure the student code is correct and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent p-6 min-h-[300px] hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary">
              person_add
            </span>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Link Another Child
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[200px]">
              Have another child enrolled? enter their student code to link.
            </p>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link a Child</DialogTitle>
          <DialogDescription>
            Enter your child's unique student code (e.g., STU-2024-XXXX) to send a linking request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="studentCode" className="text-sm font-medium">
              Student Code
            </label>
            <Input
              id="studentCode"
              placeholder="e.g. STU-2024-001"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkChild()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLinkChild} 
            disabled={isSubmitting || !studentCode.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
