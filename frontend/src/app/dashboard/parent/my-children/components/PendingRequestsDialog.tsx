'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { linkService, LinkRequest } from '@/lib/api/services/linkService'
import { useToast } from '@/lib/hooks/useToast'
import { Loader2, XCircle, Clock, Users, UserPlus, ShieldCheck } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PendingRequestsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function PendingRequestsDialog({ isOpen, onOpenChange }: PendingRequestsDialogProps) {
  const [requests, setRequests] = useState<LinkRequest[]>([])
  const [activeLinks, setActiveLinks] = useState<LinkRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState<string | null>(null)
  const toast = useToast()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [pendingData, activeData] = await Promise.all([
        linkService.getPendingLinkRequests({ category: 'network' }),
        linkService.getActiveLinks({ category: 'network' })
      ])
      setRequests(pendingData.items || [])
      setActiveLinks(activeData.items || [])
    } catch (error) {
      console.error('Failed to fetch link data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const handleCancel = async (id: string, isActive: boolean = false) => {
    try {
      setIsCancelling(id)
      if (isActive) {
        await linkService.revokeActiveLink(id)
        toast.success.show("Connection revoked successfully")
        setActiveLinks(prev => prev.filter(r => r.id !== id))
      } else {
        await linkService.cancelLinkRequest(id)
        toast.success.show("Request cancelled successfully")
        setRequests(prev => prev.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Failed to update request:', error)
      toast.error.show("Failed to update request")
    } finally {
      setIsCancelling(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2.5rem]">
        <div className="bg-slate-900 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
              <Users className="w-6 h-6 text-orange-500" />
              Link Requests
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Manage student connections and pending linking requests.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
              <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md">
                <Clock className="w-4 h-4 mr-2" />
                Pending ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Active ({activeLinks.length})
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[300px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <TabsContent value="pending" className="mt-0 space-y-3">
                {isLoading ? (
                  <LoadingState />
                ) : requests.length === 0 ? (
                  <EmptyState icon={<UserPlus />} title="No pending requests" description="Sent linking requests will appear here until accepted." />
                ) : (
                  requests.map((request) => (
                    <RequestItem
                      key={request.id}
                      request={request}
                      onCancel={() => handleCancel(request.id)}
                      isCancelling={isCancelling === request.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-0 space-y-3">
                {isLoading ? (
                  <LoadingState />
                ) : activeLinks.length === 0 ? (
                  <EmptyState icon={<Users />} title="No active links" description="Your linked students will appear here." />
                ) : (
                  activeLinks.map((link) => (
                    <RequestItem
                      key={link.id}
                      request={link}
                      onCancel={() => handleCancel(link.id, true)}
                      isCancelling={isCancelling === link.id}
                      isActive
                    />
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-8 font-bold border-2"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getDisplayName(request: LinkRequest): string {
  const target = (request.targetAdmin || request.targetTeacher || request.targetStudent || request.targetParent || request.targetSchool) as any;
  const requester = (request.requesterAdmin || request.requesterTeacher || request.requesterStudent || request.requesterParent || request.requesterSchool) as any;

  // If we have a target name, it's usually what we want to show for sent requests
  // If we have a requester name, it's what we want to show for received requests
  const name = target?.name || target?.fullName || requester?.name || requester?.fullName || request.targetCode || 'Unknown';
  return String(name);
}

function RequestItem({ request, onCancel, isCancelling, isActive = false }: {
  request: LinkRequest,
  onCancel: () => void,
  isCancelling: boolean,
  isActive?: boolean
}) {
  const displayName = getDisplayName(request);

  return (
    <div className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          {displayName}
          {isActive && <span className="bg-green-500/10 text-green-500 text-[8px] px-2 py-0.5 rounded-full uppercase font-black">Connected</span>}
        </span>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          {isActive ? 'Active since: ' : 'Initiated: '}
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isCancelling}
        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
      >
        {isCancelling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest">
            <XCircle className="w-4 h-4" />
            {isActive ? 'Revoke' : 'Cancel'}
          </div>
        )}
      </Button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <div className="absolute inset-0 blur-xl bg-orange-500/20 rounded-full animate-pulse" />
      </div>
      <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Synchronizing links...</p>
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
      <div className="size-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg text-slate-400">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
      </div>
      <div>
        <p className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-tight">{title}</p>
        <p className="text-slate-500 text-xs font-medium mt-1 max-w-[240px] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
