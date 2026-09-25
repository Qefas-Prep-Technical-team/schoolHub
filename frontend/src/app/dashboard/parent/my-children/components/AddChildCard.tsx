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
import { usePublicPlatformSettings } from '@/lib/api/hooks/usePlatformGovernance'

interface AddChildCardProps {
  childrenCount: number
}

export default function AddChildCard({ childrenCount }: AddChildCardProps) {
  const { user } = useAuthStore()
  const [studentCode, setStudentCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const toast = useToast()

  const { data: settings } = usePublicPlatformSettings()
  const isSubscriptionEnforced = settings?.sub_enforced_parents !== "false"

  const { data: billingData } = useUserBilling(user?.id || '', { limit: 1 })
  const subscription = billingData?.data?.subscription

  const plan = subscription?.plan?.toUpperCase() || user?.plan?.toUpperCase() || 'FREE'
  const isTrial = subscription?.isTrialActive === true || plan.includes('TRIAL')

  const planLimits: Record<string, number> = {
    'FREE': 1,
    'ESSENTIAL': 3,
    'BASIC': 3,
    'PREMIUM': 10,
    'PRO': 100,
    'TRIAL': 3,
  }

  const limit = !isSubscriptionEnforced ? Infinity : (planLimits[plan] || 1)
  const isLimitReached = childrenCount >= limit

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
              toast.info("Premium Feature: Upgrade your plan to link more students.")
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-[20px] border-2 border-dashed p-8 h-full min-h-[300px] transition-all relative overflow-hidden group cursor-pointer",
            isLimitReached
              ? "border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/5 cursor-default"
              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-400 dark:hover:border-orange-500/50 hover:shadow-md"
          )}
        >
          {isLimitReached && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 text-[10px] font-bold uppercase px-3 py-1 rounded-md">
                <Gem size={12} />
                Premium
              </div>
            </div>
          )}

          <div className={cn(
            "size-16 rounded-full flex items-center justify-center transition-colors",
            isLimitReached
              ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
              : "bg-white dark:bg-slate-700 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 dark:group-hover:bg-orange-500/20 shadow-sm"
          )}>
            {isLimitReached ? (
              <Lock size={24} />
            ) : (
              <UserPlus size={24} />
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className={cn(
              "text-lg font-bold",
              isLimitReached ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors"
            )}>
              {isLimitReached ? "Limit Reached" : "Link Student"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px] mx-auto">
              {isLimitReached
                ? `Current tier (${isTrial ? 'Free Trial' : plan}) is restricted to ${limit} student${limit === 1 ? '' : 's'}.`
                : "Authorize a new student terminal by entering their code."
              }
            </p>
          </div>

          {isLimitReached ? (
            <Button
              className="mt-2 h-10 px-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-all"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = '/dashboard/parent/billing'
              }}
            >
              Upgrade Plan
            </Button>
          ) : null}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] p-0 border-none bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden shadow-xl">
        <DialogHeader className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
              <UserPlus size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Link Student</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">Initiate student synchronization</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="studentCode" className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">
                Student Access Code
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <Input
                  id="studentCode"
                  placeholder="e.g. STU-2024-001"
                  className="h-12 pl-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkChild()}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Authorization requires student or admin validation.
            </p>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
            <DialogClose asChild>
              <Button variant="ghost" className="h-11 rounded-xl text-slate-500 font-semibold px-6 hover:bg-slate-100 dark:hover:bg-slate-800">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleLinkChild}
              disabled={isSubmitting || !studentCode.trim()}
              className="h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 min-w-[140px]"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying</>
              ) : (
                "Link Student"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
