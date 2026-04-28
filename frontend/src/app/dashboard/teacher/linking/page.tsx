/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Link2,
  Search,
  Plus,
  UserPlus,
  MoreVertical,
  Check,
  X,
  Clock,
  ShieldCheck,
  Mail,
  Copy,
  ExternalLink,
  Info,
  Hash,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { linkService, LinkRequest, LinkType } from '@/lib/api/services/linkService';
import {
  useLinkRequests,
  useActiveLinks,
  useLinkProfile,
  useRespondToLinkRequest,
  useCancelLinkRequest,
  useRevokeActiveLink,
  useCreateLinkRequest
} from '@/lib/api/hooks/useLinks';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { Skeleton } from "@/components/ui/skeleton";

import { TeacherLinkingHeader } from './components/TeacherLinkingHeader';
import { TeacherLinkingCodeCards } from './components/TeacherLinkingCodeCards';
import TeacherQRCodeModal from './components/TeacherQRCodeModal';

function LinkingHub() {
  const { user } = useAuthStore();
  const { selectedSchoolId, schools } = useDashboardStore();
  const isPersonal = selectedSchoolId === user?.id;

  // -- State for School Mode (Global) --
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // -- State for Personal Mode --
  const [mainTab, setMainTab] = useState<'network' | 'classroom'>('network');
  const [subTab, setSubTab] = useState<'active' | 'pending'>('active');
  const [instPage, setInstPage] = useState(1);
  const [classPage, setClassPage] = useState(1);

  // -- Modal State --
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

  // -- Hooks: Personal Mode (Centralized) --
  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks(
    { page: isPersonal ? (mainTab === 'network' ? instPage : classPage) : currentPage, category: isPersonal ? mainTab : undefined },
    { enabled: isPersonal || !isPersonal } // Always enabled for current context essentially
  );
  
  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests(
    { page: isPersonal ? (mainTab === 'network' ? instPage : classPage) : currentPage, category: isPersonal ? mainTab : undefined },
    { enabled: isPersonal || !isPersonal }
  );

  // Independent fetches for persistent badges (counts)
  const { data: networkTotalData } = useLinkRequests({ category: 'network', status: 'PENDING', limit: 1 }, { enabled: isPersonal });
  const { data: classroomTotalData } = useLinkRequests({ category: 'classroom', status: 'PENDING', limit: 1 }, { enabled: isPersonal });

  const { data: profileResponse, isLoading: isLoadingProfile } = useLinkProfile();
  const profile = profileResponse?.data || {};

  const currentSchool = schools.find(s => s.id === selectedSchoolId);
  const activeSchoolCode = currentSchool?.linkingCode || currentSchool?.schoolCode || profile?.schoolCode;

  const respondMutation = useRespondToLinkRequest();
  const cancelMutation = useCancelLinkRequest();
  const revokeMutation = useRevokeActiveLink();

  const getPeer = (item: any) => {
    const r = item.approvedFromRequest || item;
    const participants = [
      r.targetStudent, r.targetTeacher, r.targetParent, r.targetSchool, r.approverAdmin,
      r.requesterStudent, r.requesterTeacher, r.requesterParent, r.requesterSchool, r.requesterAdmin
    ].filter(Boolean);

    return participants.find((p: any) => p.id !== user?.id);
  };

  const normalizeList = (list: any[]) => (list || []).map((item: any) => {
    const peer = getPeer(item);
    return {
      ...item,
      peerName: peer?.name || peer?.email || 'Linked Member',
      peerEmail: peer?.email || '',
      peerImage: peer?.profileImage || peer?.logo || peer?.avatar,
      peerCode: item.studentCode || item.teacherCode || item.parentCode || 
                (item.leftEntityId === user?.id ? item.rightCode : item.leftCode) || 
                (item.requesterId === user?.id ? item.targetCode : item.requesterCode)
    };
  });

  // Normalized Data
  const activeLinks = normalizeList((activeLinksData as any)?.items);
  const requests = normalizeList((requestsData as any)?.items);
  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  const networkPendingCount = (networkTotalData as any)?.pagination?.total || 0;
  const classroomPendingCount = (classroomTotalData as any)?.pagination?.total || 0;

  const currentPagination = subTab === 'active' 
    ? (activeLinksData as any)?.pagination 
    : (requestsData as any)?.pagination;

  const handleRespond = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate({ id, action });
  };

  const handleCancel = async (id: string) => {
    cancelMutation.mutate(id);
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to disconnect this member?')) return;
    revokeMutation.mutate(id);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 bg-gray-50/30 dark:bg-transparent min-h-screen">
      <TeacherLinkingHeader 
        onConnectClick={() => setIsConnectModalOpen(true)}
        onShowQRCodeClick={() => setIsQRCodeModalOpen(true)}
      />

      <TeacherQRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        linkingCode={profile?.linkingCode}
        schoolCode={activeSchoolCode}
        isPersonal={isPersonal}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-500/5 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/20 hover:scale-[1.01] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 text-blue-600 dark:text-blue-400">
              <ShieldCheck size={24} />
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none font-bold text-[10px]">Active</Badge>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {isLoadingActive ? <Skeleton className="h-9 w-12" /> : activeLinks.length}
            </div>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[0.10em]">
              {isPersonal ? 'Current Tab Active' : 'School Connections'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-orange-500/5 dark:bg-orange-500/10 border-orange-100 dark:border-orange-900/20 hover:scale-[1.01] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 text-orange-600 dark:text-orange-400">
              <Clock size={24} />
              <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none shadow-none font-bold text-[10px]">Waiting</Badge>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
               {isLoadingRequests ? <Skeleton className="h-9 w-12" /> : pendingRequests.length}
            </div>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[0.10em]">Current Tab Pending</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-purple-500/5 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/20 hover:scale-[1.01] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 text-purple-600 dark:text-purple-400">
              <Mail size={24} />
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none shadow-none font-bold text-[10px]">Context</Badge>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white truncate">
               {isPersonal ? 'Personal Hub' : (currentSchool?.name || 'School')}
            </p>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[0.10em]">Active Workspace</p>
          </CardContent>
        </Card>
      </div>

      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <TeacherLinkingCodeCards 
        personalCode={profile?.linkingCode}
        schoolCode={activeSchoolCode}
        onCopy={copyToClipboard}
        isPersonal={isPersonal}
      />

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-gray-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Category Toggle (Personal Mode Only) */}
            {isPersonal && (
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                <button
                  onClick={() => setMainTab('network')}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    mainTab === 'network' ? "bg-white dark:bg-gray-800 shadow-sm text-primary" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Network
                </button>
                <button
                  onClick={() => setMainTab('classroom')}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    mainTab === 'classroom' ? "bg-white dark:bg-gray-800 shadow-sm text-purple-600" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Classroom
                </button>
              </div>
            )}

            {/* Status Toggle */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
              <button
                onClick={() => setSubTab('active')}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  subTab === 'active' ? "bg-white dark:bg-gray-800 shadow-sm text-primary" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Connected ({isLoadingActive ? '...' : activeLinks.length})
              </button>
              <button
                onClick={() => setSubTab('pending')}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative",
                  subTab === 'pending' ? "bg-white dark:bg-gray-800 shadow-sm text-orange-500" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Pending ({isLoadingRequests ? '...' : pendingRequests.length})
                {(isPersonal ? (mainTab === 'network' ? networkPendingCount : classroomPendingCount) : pendingRequests.length) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[8px] flex items-center justify-center font-black shadow-sm">
                   {isPersonal ? (mainTab === 'network' ? networkPendingCount : classroomPendingCount) : pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" size={16} />
            <Input
              placeholder="Search links..."
              className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 shadow-none font-medium focus:ring-primary/20 transition-all text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoadingActive || isLoadingRequests ? (
              <LinkingSkeleton count={8} />
            ) : subTab === 'active' ? (
              activeLinks.length === 0 ? (
                <EmptyState message={`No active ${isPersonal ? mainTab : ''} connections found.`} />
              ) : (
                activeLinks
                  .filter((link: any) => 
                    link.peerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    link.peerEmail.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((link: any) => (
                    <MemberCard key={link.id} link={link} onRevoke={handleRevoke} onCopy={copyToClipboard} />
                  ))
              )
            ) : (
              pendingRequests.length === 0 ? (
                <EmptyState message={`No pending ${isPersonal ? mainTab : ''} requests found.`} />
              ) : (
                pendingRequests
                  .filter((req: any) => 
                    req.peerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    req.peerEmail.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((req: any) => (
                    <RequestCard key={req.id} req={req} user={user} onRespond={handleRespond} onCancel={handleCancel} />
                  ))
              )
            )}
          </div>

          {currentPagination && (
            <Pagination
              currentPage={isPersonal ? (mainTab === 'network' ? instPage : classPage) : currentPage}
              totalPages={currentPagination.totalPages}
              totalItems={currentPagination.total}
              itemsPerPage={currentPagination.limit}
              onPageChange={isPersonal ? (mainTab === 'network' ? setInstPage : setClassPage) : setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Components ---

function LinkingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-2xl overflow-hidden border-none shadow-sm h-[180px]">
          <CardHeader className="p-4 flex flex-row items-center gap-3">
             <Skeleton className="w-10 h-10 rounded-xl" />
             <div className="space-y-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-3 w-16" />
             </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-10 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-16 text-center bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Link2 className="text-gray-300 dark:text-gray-600" size={28} />
      </div>
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{message}</h3>
    </div>
  );
}

function MemberCard({ link, onRevoke, onCopy }: any) {
  return (
    <Card className="rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-lg transition-all group border-gray-100 dark:border-gray-800">
      <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all overflow-hidden border border-gray-100 dark:border-gray-800">
            {link.peerImage ? (
              <img src={link.peerImage} alt={link.peerName} className="h-full w-full object-cover" />
            ) : (
              <UserPlus size={20} />
            )}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-black truncate max-w-[100px]">{link.peerName}</CardTitle>
            <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-primary truncate">{link.linkType.replace('_', ' ')}</CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical size={16} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="p-2 text-xs font-semibold rounded-lg"><Info className="mr-2 h-3.5 w-3.5" /> Details</DropdownMenuItem>
            <DropdownMenuItem className="p-2 text-xs font-semibold rounded-lg text-red-500 cursor-pointer" onClick={() => onRevoke(link.id)}><X className="mr-2 h-3.5 w-3.5" /> Disconnect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 font-bold">Email</span>
          <span className="font-bold text-gray-900 dark:text-white truncate max-w-[110px]">{link.peerEmail}</span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50 group/code">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Code</span>
            <span className="font-black text-primary tracking-widest text-xs">{link.peerCode}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity" onClick={() => onCopy(link.peerCode)}>
            <Copy size={12} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestCard({ req, user, onRespond, onCancel }: any) {
  return (
    <Card className="rounded-2xl overflow-hidden border border-orange-100 dark:border-orange-500/20 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <Badge className="bg-orange-500 text-white border-none px-2 py-0.5 font-black uppercase text-[8px] tracking-widest">{req.linkType.split('_')[1] || req.linkType}</Badge>
          <span className="text-[8px] text-gray-400 font-bold flex items-center gap-1"><Clock size={10} /> {new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden border border-orange-50 dark:border-orange-900/20">
            {req.peerImage ? <img src={req.peerImage} alt={req.peerName} className="h-full w-full object-cover" /> : <Clock size={18} className="text-orange-500" />}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-black truncate">{req.peerName}</CardTitle>
            <CardDescription className="text-[10px] font-bold text-gray-500 truncate">{req.peerEmail}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex gap-2">
          {req.requesterId !== user?.id && (
            <Button onClick={() => onRespond(req.id, 'ACCEPT')} className="flex-1 h-9 rounded-xl bg-primary text-white font-black text-xs shadow hover:scale-[1.02] transition-all">
              <Check size={14} className="mr-1" /> Approve
            </Button>
          )}
          <Button 
            onClick={() => req.requesterId === user?.id ? onCancel(req.id) : onRespond(req.id, 'REJECT')} 
            variant="outline" 
            className="flex-1 h-9 rounded-xl border-red-100 text-red-500 font-black text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:scale-[1.02] transition-all"
          >
            <X size={14} className="mr-1" /> {req.requesterId === user?.id ? 'Cancel' : 'Reject'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


function ConnectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('SCHOOL_TEACHER');
  const [note, setNote] = useState('');

  const createMutation = useCreateLinkRequest();
  const loading = createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a linking code');
      return;
    }

    createMutation.mutate(
      { targetCode: code.trim(), linkType, note: note.trim() },
      {
        onSuccess: () => {
          onClose();
          setCode('');
          setNote('');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-none overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />

        <DialogHeader className="relative z-10 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Link2 className="text-primary" size={32} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight line-height-1">Connect with Code</DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500 mt-2">
            Enter a linking code to establish a secure connection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Connection Type</label>
            <Select value={linkType} onValueChange={(val: any) => setLinkType(val)}>
              <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 focus:ring-primary focus:border-primary transition-all">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                <SelectItem value="TEACHER_CLASS" className="rounded-xl h-12">👨‍🏫 Teacher to Class</SelectItem>
                <SelectItem value="SCHOOL_TEACHER" className="rounded-xl h-12">🏫 Link to School</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Linking Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ABC-123-XYZ"
                className="h-14 pl-12 rounded-2xl border-2 border-gray-100 bg-gray-50/50 font-black tracking-widest placeholder:tracking-normal placeholder:font-medium focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Note (Optional)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Linking to my primary account"
              className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 font-medium focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-14 px-6 rounded-2xl font-black text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-14 flex-1 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LinkingHub;
