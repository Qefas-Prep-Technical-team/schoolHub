/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import {
  Link2, Search, MoreVertical, X,
  Clock, ShieldCheck, Copy, ArrowUpRight, Hash,
  Zap, Globe, Shield, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useLinkRequests, useActiveLinks, useLinkProfile, useRespondToLinkRequest, useRevokeActiveLink, useCreateLinkRequest, useCancelLinkRequest } from '@/lib/api/hooks/useLinks';
import { useRequestToJoinClass } from '@/lib/api/hooks/useClasses';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { ConfirmationModal } from '@/components/reusable/ConfirmationModal';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils/clipboard';
import Pagination from '@/components/ui/Pagination';
import { useEffect } from 'react';

export default function LinkingHub() {
  const [currentPage, setCurrentPage] = useState(1);
  const [mainTab, setMainTab] = useState<'network' | 'classroom'>('network');
  const [subTab, setSubTab] = useState<'active' | 'pending'>('active');

  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests({ page: currentPage, category: mainTab });
  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks({ page: currentPage, category: mainTab });
  const { data: profileResponse, isLoading: isLoadingProfile } = useLinkProfile();

  const requests = requestsData?.items || [];
  const activeLinks = activeLinksData?.items || [];
  
  const pagination = subTab === 'active' ? activeLinksData?.pagination : requestsData?.pagination;
  
  const profile = profileResponse?.data || {};

  const respondMutation = useRespondToLinkRequest();
  const revokeMutation = useRevokeActiveLink();
  const cancelMutation = useCancelLinkRequest();
  const createMutation = useCreateLinkRequest();

  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Reset page when tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [mainTab, subTab]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default'
  });
  const { user } = useAuthStore();

  const isClassLink = (type: string) => type === 'STUDENT_CLASS' || type === 'TEACHER_CLASS';

  // Helper to pick the "other" person or entity from a link or request
  const getPeer = (item: any) => {
    const r = item.approvedFromRequest || item;
    
    // Explicitly check for school relation first if it's an institutional link
    if (item.school) return item.school;
    if (r.targetSchool) return r.targetSchool;
    if (r.requesterSchool) return r.requesterSchool;

    // Collect all personal participants
    const participants = [
      r.targetStudent, r.targetTeacher, r.targetParent, r.approverAdmin,
      r.requesterStudent, r.requesterTeacher, r.requesterParent, r.requesterAdmin
    ].filter(Boolean);

    // Filter out the current user
    const peer = participants.find((p: any) => p.id !== user?.id) || participants[0] || r.class;
    return peer;
  };

  // Normalize Active Links
  const normalizedActiveLinks = activeLinks.map((link: any) => {
    const peer = getPeer(link);
    const isLeft = link.leftEntityId === user?.id;
    const peerCode = isLeft ? link.rightCode : link.leftCode;
    
    let peerName = peer?.name || peer?.fullName || peer?.username || peerCode || "Verified Member";
    let peerEmail = peer?.email || (link.school ? (link.school.email || "School Entity") : "---");
    
    // Classroom specific logic
    if (link.linkType === 'STUDENT_CLASS' || link.linkType === 'TEACHER_CLASS') {
      peerName = link.class?.name || link.class?.classCode || peerName;
      peerEmail = "Classroom Entity";
    }

    const isClass = isClassLink(link.linkType);

    return {
      ...link,
      peerName,
      peerEmail,
      peerImage: peer?.logo || peer?.profileImage || peer?.avatar,
      variant: isClass ? 'classroom' : 'network'
    };
  });

  // Normalize Requests
  const normalizedRequests = requests.map((req: any) => {
    const peer = getPeer(req);
    const isOutgoing = req.requesterId === user?.id;
    const peerCode = isOutgoing ? req.targetCode : req.requesterCode;

    let peerName = peer?.name || peer?.fullName || peer?.username || peerCode || "Verified Member";
    let peerEmail = peer?.email || "---";

    return {
      ...req,
      peerName,
      peerEmail,
      peerImage: peer?.logo || peer?.profileImage || peer?.avatar,
      variant: isClassLink(req.linkType) ? 'classroom' : 'network'
    };
  });

  const filteredActiveLinks = normalizedActiveLinks.filter((link: any) => {
    const matchesTab = link.variant === mainTab;
    const matchesSearch = (link.peerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         link.peerEmail?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const filteredRequests = normalizedRequests.filter((req: any) => {
    if (req.status !== 'PENDING') return false;
    const matchesTab = req.variant === mainTab;
    const matchesSearch = (req.peerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         req.peerEmail?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const networkPendingCount = subTab === 'pending' && mainTab === 'network' ? (requestsData?.pagination?.total || 0) : 0;
  const classroomPendingCount = subTab === 'pending' && mainTab === 'classroom' ? (requestsData?.pagination?.total || 0) : 0;


  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black/95 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Modern Glass Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-pink-600 rounded-lg shadow-blue-200 shadow-lg">
                <Zap size={16} className="text-white fill-current" />
              </div>
              <span className="text-[10px] font-black text-pink-600 tracking-widest uppercase">Network</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Linking Hub
            </h1>
            <p className="text-sm text-slate-500 font-medium">Connect and manage your academic ecosystem.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex-1 md:flex-none h-11 px-5 rounded-xl bg-slate-900 dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-xl font-bold text-sm"
            >
              <Link2 className="mr-2 h-4 w-4" /> New Connection
            </Button>
          </div>
        </header>

        {/* Profile Stats / Code Bento Card - SHRUNK */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 relative overflow-hidden border-none bg-gradient-to-br from-pink-600 to-indigo-700 text-white shadow-2xl shadow-blue-200/50 rounded-[1.5rem]">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider">
                  <Shield size={12} className="mr-1.5" /> Verified Profile
                </div>
                <h2 className="text-xl font-extrabold">Your Linking Code</h2>
                <p className="text-blue-100/70 text-sm max-w-[280px]">Share this code with teachers or parents to link your accounts.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl flex flex-col items-center gap-3 min-w-[180px]">
                <span className="text-3xl font-black tracking-widest leading-none">{profile.linkingCode || "---"}</span>
                <Button
                  onClick={() => copyToClipboard(profile.linkingCode, "Linking code")}
                  variant="secondary"
                  size="sm"
                  className="w-full h-9 bg-white text-pink-600 hover:bg-rose-50 font-black text-[11px] uppercase tracking-widest rounded-lg"
                >
                  <Copy size={14} className="mr-2" /> Copy Code
                </Button>
              </div>
            </CardContent>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </Card>

          <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[1.5rem] p-6 flex flex-col justify-center items-center text-center space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Globe className="text-slate-400 font-bold" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black">{activeLinks.length}</p>
              <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em]">Active Links</p>
            </div>
          </Card>
        </section>

        {/* NEW Tab Structure & Search */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Main Categories */}
              <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setMainTab('network')}
                  className={cn(
                    "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                    mainTab === 'network' ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Network
                </button>
                <button
                  onClick={() => setMainTab('classroom')}
                  className={cn(
                    "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                    mainTab === 'classroom' ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Classroom
                </button>
              </div>

              {/* Sub Tabs (Active/Pending) */}
              <div className="flex gap-2">
                <Button
                  variant={subTab === 'active' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSubTab('active')}
                  className={cn(
                    "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    subTab === 'active' ? (mainTab === 'classroom' ? "bg-purple-600 text-white" : "bg-slate-900 text-white") : "text-slate-400"
                  )}
                >
                  Connected
                </Button>
                <Button
                  variant={subTab === 'pending' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSubTab('pending')}
                  className={cn(
                    "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest relative px-3",
                    subTab === 'pending' ? (mainTab === 'classroom' ? "bg-purple-600 text-white" : "bg-orange-500 text-white") : "text-slate-400"
                  )}
                >
                  Pending
                  {(mainTab === 'network' ? networkPendingCount : classroomPendingCount) > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white text-orange-600 text-[8px] font-black">
                      {mainTab === 'network' ? networkPendingCount : classroomPendingCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder={`Search ${mainTab}...`}
                className="pl-11 h-11 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-pink-500/20 text-xs font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Connection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingActive || isLoadingRequests || isLoadingProfile ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Synchronizing your network...</p>
              </div>
            ) : subTab === 'active' ? (
              filteredActiveLinks.length > 0 ? (
                filteredActiveLinks.map((link: any) => (
                  <ConnectionCard 
                    key={link.id} 
                    link={link} 
                    onRevoke={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Disconnect Entity?',
                        description: 'Are you sure you want to revoke this connection? This action will remove access to shared resources.',
                        variant: 'destructive',
                        onConfirm: () => {
                          revokeMutation.mutate(link.id, {
                            onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
                          });
                        }
                      });
                    }}
                    isRevoking={revokeMutation.isPending && revokeMutation.variables === link.id}
                  />
                ))
              ) : (
                <EmptyState message={`No active ${mainTab} connections found.`} />
              )
            ) : (
              filteredRequests.length > 0 ? (
                filteredRequests.map((req: any) => (
                  <PendingCard 
                    key={req.id} 
                    req={req} 
                    onRespond={(action: any) => respondMutation.mutate({ id: req.id, action })} 
                    onCancel={(id: string) => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Cancel Connection Request?',
                        description: 'Are you sure you want to withdraw this request? You will need to resend it if you change your mind.',
                        variant: 'destructive',
                        onConfirm: () => {
                          cancelMutation.mutate(id, {
                            onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
                          });
                        }
                      });
                    }}
                    userId={user?.id}
                    isResponding={respondMutation.isPending && (respondMutation.variables as any)?.id === req.id}
                    isCancelling={cancelMutation.isPending && cancelMutation.variables === req.id}
                  />
                ))
              ) : (
                <EmptyState message={`No pending ${mainTab} requests.`} />
              )
            )}
          </div>

          {pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        isLoading={revokeMutation.isPending || cancelMutation.isPending}
      />

      <ConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
       <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
         <Shield size={32} className="text-slate-400" />
       </div>
       <p className="text-xs font-black uppercase tracking-widest text-slate-500">{message}</p>
    </div>
  );
}

// --- Sub-components for better organization ---

function ConnectionCard({ link, onRevoke, isRevoking }: any) {
  const isClass = link.variant === 'classroom';

  return (
    <Card className={cn(
      "group border-none bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden border-l-4",
      isClass ? "border-l-purple-500 shadow-purple-100/50" : "border-l-pink-500 shadow-blue-100/50"
    )}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={cn(
               "h-12 w-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform overflow-hidden",
               isClass ? "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800" : "bg-rose-50 dark:bg-pink-900/20 border-blue-100 dark:border-pink-700"
            )}>
              {link.peerImage ? (
                <img src={link.peerImage} alt={link.peerName} className="h-full w-full object-cover" />
              ) : (
                <ShieldCheck size={24} className={isClass ? "text-purple-500" : "text-pink-500"} />
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{link.peerName}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{link.roleDisplay || link.type?.replace('_', ' ')}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical size={18} /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-2 capitalize">
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 font-black p-3 rounded-lg cursor-pointer disabled:opacity-50" 
                onClick={onRevoke}
                disabled={isRevoking}
              >
                {isRevoking ? <Loader2 size={16} className="mr-2 animate-spin" /> : <X size={16} className="mr-2" />}
                Disconnect Entity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Identifier</span>
             <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">{link.peerEmail}</span>
           </div>
           <div className="space-y-1">
             <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Connected Since</span>
             <span className="font-bold text-xs text-slate-900 dark:text-white block">{new Date(link.createdAt).toLocaleDateString()}</span>
           </div>
        </div>

        <div className={cn(
          "flex items-center justify-between p-4 rounded-xl border group/code h-14",
          isClass ? "bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800/50" : "bg-rose-50/50 border-blue-100 dark:bg-pink-900/10 dark:border-pink-800/50"
        )}>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Entity Code</span>
            <span className={cn("font-black tracking-widest text-sm", isClass ? "text-purple-600" : "text-pink-600")}>
               {link.leftEntityId === link.userId ? link.rightCode : link.leftCode}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-800"
            onClick={() => {
              const code = link.leftEntityId === link.userId ? link.rightCode : link.leftCode;
              copyToClipboard(code, "Entity code");
            }}
          >
            <Copy size={14} className="text-slate-400" />
          </Button>
        </div>

        <Button variant="outline" className="w-full h-11 rounded-xl border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all group/btn">
          View Profile <ArrowUpRight size={16} className="ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}

function PendingCard({ req, onRespond, onCancel, userId, isResponding, isCancelling }: any) {
  const isOutgoing = req.requesterId === userId;
  const isClass = req.variant === 'classroom';

  return (
    <Card className={cn(
      "border-none bg-white dark:bg-slate-900 shadow-xl rounded-[1.5rem] relative overflow-hidden transition-all hover:shadow-2xl",
      isClass ? "shadow-purple-100/50" : "shadow-orange-100/50"
    )}>
      <div className={cn(
        "h-1.5 w-full absolute top-0 z-20", 
        isOutgoing ? "bg-slate-300 shadow-sm" : (isClass ? "bg-purple-600 shadow-purple-200" : "bg-orange-500 shadow-orange-200")
      )} />

      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
        <Badge className={cn(
          "border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest rounded-lg",
          isClass ? "bg-purple-600 text-white" : "bg-orange-600 text-white"
        )}>
           {req.linkType?.replace('_', ' ')}
        </Badge>
        <span className="px-2 py-1 rounded-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[8px] font-black tracking-widest border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500">
          {isOutgoing ? 'SENT' : 'INCOMING'}
        </span>
      </div>

      <div className="p-6 space-y-6 pt-10">
        <div className="flex items-center gap-4">
          <div className={cn(
             "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden",
             isClass ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20" : "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
          )}>
            {req.peerImage ? (
              <img src={req.peerImage} alt={req.peerName} className="h-full w-full object-cover" />
            ) : (
              <Clock size={24} />
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{req.peerName}</h4>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isOutgoing ? "Outgoing Connection" : "Incoming Request"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Identifier</span>
             <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">{req.peerEmail}</span>
           </div>
           <div className="space-y-1">
             <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight">Date Requested</span>
             <span className="font-bold text-xs text-slate-900 dark:text-white block">{new Date(req.createdAt).toLocaleDateString()}</span>
           </div>
        </div>

        {req.note && (
          <div className={cn(
            "p-4 rounded-2xl border relative overflow-hidden group/note",
            isClass ? "bg-purple-50/30 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800/50" : "bg-orange-50/30 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/50"
          )}>
             <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50 transition-opacity group-hover/note:opacity-100", isClass ? "bg-purple-300" : "bg-orange-300")} />
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 italic line-clamp-2 leading-relaxed">"{req.note}"</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isOutgoing ? (
            <>
              <Button 
                onClick={() => onRespond('ACCEPT')} 
                disabled={isResponding}
                className={cn(
                  "flex-[3] h-12 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95",
                  isClass ? "bg-purple-600 hover:bg-purple-700 shadow-purple-100" : "bg-orange-500 hover:bg-orange-600 shadow-orange-100"
                )}
              >
                {isResponding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isResponding ? "Processing..." : "Approve"}
              </Button>
              <Button 
                onClick={() => onRespond('REJECT')} 
                variant="outline" 
                disabled={isResponding}
                className="flex-1 h-12 rounded-xl border-slate-100 font-bold uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/20"
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onCancel(req.id)}
              variant="outline"
              disabled={isCancelling}
              className="w-full h-12 rounded-xl border-slate-100 font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-50 hover:text-red-600 hover:border-red-100 dark:border-slate-800 dark:hover:bg-slate-900 transition-all shadow-sm"
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isCancelling ? "Cancelling..." : "Cancel My Request"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ConnectModal({ isOpen, onClose }: any) {
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [linkType, setLinkType] = useState('STUDENT_CLASS');
  const createMutation = useCreateLinkRequest();
  const joinClassMutation = useRequestToJoinClass();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = linkType === 'STUDENT_CLASS' ? code.toUpperCase() : 
                         (linkType === 'SCHOOL_STUDENT' ? code.toLowerCase() : code);
    
    if (linkType === 'STUDENT_CLASS') {
      joinClassMutation.mutate(
        { classCode: formattedCode, note },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(
        { targetCode: formattedCode, linkType: linkType as any, note },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createMutation.isPending || joinClassMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-8 border-none bg-white dark:bg-slate-900">
        <DialogHeader className="text-left space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
            <Link2 size={28} />
          </div>
          <DialogTitle className="text-2xl font-extrabold">Join Community</DialogTitle>
          <DialogDescription className="font-medium">
            Enter a unique code to connect with your school, class, or parents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConnect} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Connection Type</label>
            <Select value={linkType} onValueChange={(val) => {
              setLinkType(val);
              setCode(''); // Clear code when switching types to reset formatting
            }}>
              <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="STUDENT_CLASS">🎓 Student to Class</SelectItem>
                <SelectItem value="SCHOOL_STUDENT">🏫 Student to School</SelectItem>
                <SelectItem value="PARENT_STUDENT">👪 Student to Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Secure Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input
                value={code}
                onChange={(e) => {
                  const val = e.target.value;
                  if (linkType === 'STUDENT_CLASS') setCode(val.toUpperCase());
                  else if (linkType === 'SCHOOL_STUDENT') setCode(val.toLowerCase());
                  else setCode(val);
                }}
                placeholder={linkType === 'STUDENT_CLASS' ? "EX: CLASS-99" : "EX: sch-qef-741"}
                className={cn(
                  "pl-11 h-12 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium text-slate-900 dark:text-white",
                  linkType === 'STUDENT_CLASS' ? "uppercase" : (linkType === 'SCHOOL_STUDENT' ? "lowercase" : "")
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Optional Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a message (optional)..."
              className="w-full h-24 p-4 rounded-xl border-none bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-medium text-sm focus:ring-2 focus:ring-pink-500/20 resize-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-base transition-all shadow-lg shadow-blue-200"
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Request Connection"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

