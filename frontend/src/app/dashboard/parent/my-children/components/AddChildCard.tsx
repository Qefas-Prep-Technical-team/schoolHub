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
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { linkService } from '@/lib/api/services/linkService'
import { useToast } from '@/lib/hooks/useToast'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { Gem, Lock, UserPlus, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useUserBilling } from '@/lib/api/hooks/useSchool'

interface AddChildCardProps {
  childrenCount: number
}

export default function AddChildCard({ childrenCount }: AddChildCardProps) {
  const { user } = useAuthStore()
  const [studentCode, setStudentCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const toast = useToast()

  // Fetch real-time billing data to get the accurate plan and limit
  const { data: billingData } = useUserBilling(user?.id || '', { limit: 1 })
  const subscription = billingData?.data?.subscription

  const plan = subscription?.plan?.toUpperCase() || user?.plan?.toUpperCase() || 'FREE'
  const isTrial = subscription?.isTrialActive === true || plan.includes('TRIAL')

  // Define limits based on plan
  const planLimits: Record<string, number> = {
    'FREE': 1,
    'ESSENTIAL': 3,
    'BASIC': 3,
    'PREMIUM': 10,
    'PRO': 100, // Representing unlimited
    'TRIAL': 3,
  }

  const limit = planLimits[plan] || 1
  const isLimitReached = childrenCount >= limit

  console.log('AddChildCard Debug:', { plan, isTrial, limit, childrenCount, isLimitReached });

  const handleLinkChild = async () => {
    if (isLimitReached) {
      toast.error.show("Plan limit reached. Please upgrade to link more children.")
      return
    }

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
    <Dialog open={isOpen} onOpenChange={(open) => !isLimitReached && setIsOpen(open)}>
      <DialogTrigger asChild>
        <div
          onClick={(e) => {
            if (isLimitReached) {
              e.preventDefault()
              e.stopPropagation()
              toast.info("Premium Feature: Upgrade your plan to link more student nodes.")
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-6 rounded-[3rem] border-4 border-dashed p-10 min-h-[400px] transition-all relative overflow-hidden group animate-in fade-in zoom-in-95 duration-1000",
            isLimitReached
              ? "border-orange-500/20 bg-orange-500/[0.02] cursor-default shadow-inner"
              : "border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 hover:border-orange-600/50 hover:shadow-orange-600/10 cursor-pointer shadow-2xl"
          )}
        >
          {isLimitReached && (
            <div className="absolute top-8 right-8">
              <div className="flex items-center gap-2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl animate-pulse">
                <Gem size={12} />
                Premium Node
              </div>
            </div>
          )}

          <div className={cn(
            "size-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-xl",
            isLimitReached
              ? "bg-orange-600/10 text-orange-600 border-2 border-orange-600/20"
              : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-12 group-hover:scale-110"
          )}>
            {isLimitReached ? (
              <Lock size={32} />
            ) : (
              <UserPlus size={32} />
            )}
          </div>

          <div className="text-center space-y-3">
            <h3 className={cn(
              "text-2xl font-black uppercase tracking-tight",
              isLimitReached ? "text-orange-600" : "text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors"
            )}>
              {isLimitReached ? "Limit Reached" : "Link Node"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-[240px]">
              {isLimitReached
                ? `Current tier (${isTrial ? 'Free Trial' : plan}) is restricted to ${limit} student ${limit === 1 ? 'node' : 'nodes'}.`
                : "Authorize a new student terminal by entering their unique identity code."
              }
            </p>
          </div>

          {isLimitReached ? (
            <Button
              className="mt-4 h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = '/dashboard/parent/billing'
              }}
            >
              Upgrade Protocol
            </Button>
          ) : (
            <div className="mt-4 p-3 rounded-full bg-orange-600/10 text-orange-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
              <ChevronRight size={20} />
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-0 border-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl">
        <DialogHeader className="p-10 pb-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-600/20">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Link Terminal</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initiate student node synchronization</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-10">
          <div className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="studentCode" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Student Access Code
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <Input
                  id="studentCode"
                  placeholder="e.g. STU-2024-001"
                  className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkChild()}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
              Authorization requires student or admin validation
            </p>
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-16 flex-1 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                Abort
              </Button>
            </DialogClose>
            <Button
              onClick={handleLinkChild}
              disabled={isSubmitting || !studentCode.trim()}
              className="h-16 flex-[2] rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95 group"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Syncing</span>
              ) : (
                <span className="flex items-center gap-2">Establish Link <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
