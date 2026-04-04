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
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';

function LinkingHub() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests({ page: currentPage });
  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks({ page: currentPage });
  const { data: profileResponse, isLoading: isLoadingProfile } = useLinkProfile();

  const requests = requestsData?.items || [];
  const activeLinks = activeLinksData?.items || [];
  
  const pagination = activeTab === 'all' ? activeLinksData?.pagination : requestsData?.pagination;
  
  const profile = profileResponse?.data || {};
  const { user } = useAuthStore();

  const respondMutation = useRespondToLinkRequest();
  const cancelMutation = useCancelLinkRequest();
  const revokeMutation = useRevokeActiveLink();

  const loading = isLoadingRequests || isLoadingActive || isLoadingProfile;

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleRespond = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate({ id, action });
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const getPeer = (item: any) => {
    const r = item.approvedFromRequest || item;
    const participants = [
      r.targetStudent, r.targetTeacher, r.targetParent, r.targetSchool, r.approverAdmin,
      r.requesterStudent, r.requesterTeacher, r.requesterParent, r.requesterSchool, r.requesterAdmin
    ].filter(Boolean);

    return participants.find((p: any) => p.id !== user?.id);
  };

  const normalizedActiveLinks = activeLinks.map((link: any) => {
    const peer = getPeer(link);
    return {
      ...link,
      peerName: peer?.name || peer?.email || 'Linked Member',
      peerEmail: peer?.email || '',
      peerImage: peer?.profileImage || peer?.logo || peer?.avatar,
      peerCode: peer?.studentCode || peer?.teacherCode || peer?.parentCode || (link.leftEntityId === user?.id ? link.rightCode : link.leftCode)
    };
  });

  const normalizedRequests = requests.map((req: any) => {
    const peer = getPeer(req);
    return {
      ...req,
      peerName: peer?.name || peer?.email || 'Request Member',
      peerEmail: peer?.email || '',
      peerImage: peer?.profileImage || peer?.logo || peer?.avatar,
      peerCode: req.requesterId === user?.id ? req.targetCode : req.requesterCode
    };
  });

  const pendingRequests = normalizedRequests.filter((r: any) => r.status === 'PENDING');

  const handleCancel = async (id: string) => {
    cancelMutation.mutate(id);
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to disconnect this member?')) return;
    revokeMutation.mutate(id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 dark:bg-transparent min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            Linking Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            Manage your connections with students and parents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={() => setIsConnectModalOpen(true)}
            className="h-14 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            <Link2 className="mr-2 h-5 w-5" /> Connect with Code
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
            <UserPlus className="mr-2 h-5 w-5" /> Invite Member
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-500/5 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck size={20} />
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none">Active</Badge>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{activeLinks.length}</p>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Active Connections</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-orange-500/5 dark:bg-orange-500/10 border-orange-100 dark:border-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2 text-orange-600 dark:text-orange-400">
              <Clock size={20} />
              <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none shadow-none">Pending</Badge>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{pendingRequests.length}</p>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Pending Requests</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-purple-500/5 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2 text-purple-600 dark:text-purple-400">
              <Mail size={20} />
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none shadow-none">Total</Badge>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{requests.length}</p>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Total Linked</p>
          </CardContent>
        </Card>
      </div>

      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      {/* Linking Code Section */}
      {profile && (
        <Card className="rounded-[2rem] border-none shadow-lg bg-gradient-to-br from-primary/10 via-white to-white dark:from-primary/20 dark:via-gray-800 dark:to-gray-800 border border-primary/10 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="text-primary" size={28} />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-0.5">Teacher Code</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Share this with students or class admins.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl border-2 border-primary/20 shadow-inner flex flex-col items-center justify-center min-w-[150px] group-hover:border-primary transition-colors duration-500">
                <span className="text-2xl font-black tracking-widest text-primary transition-all duration-500">
                  {profile.linkingCode || '...'}
                </span>
              </div>

              <Button
                onClick={() => copyToClipboard(profile.linkingCode)}
                className="h-12 px-6 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Area */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl h-14 border border-gray-100 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-6 rounded-xl font-bold transition-all",
                activeTab === 'all' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Active Connections
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-6 rounded-xl font-bold transition-all relative",
                activeTab === 'pending' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] flex items-center justify-center font-black animate-bounce shadow-md">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative group max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" size={18} />
            <Input
              placeholder="Search by name or email..."
              className="pl-12 h-14 rounded-2xl border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm font-medium focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {activeTab === 'all' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLinks.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Link2 className="text-gray-300 dark:text-gray-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No active connections</h3>
                  <p className="text-gray-500 max-w-sm mx-auto font-medium">Your connections will appear here once link requests are accepted.</p>
                </div>
              ) : (
                normalizedActiveLinks.map((link: any) => (
                  <Card key={link.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all overflow-hidden border border-gray-100 dark:border-gray-800">
                          {link.peerImage ? (
                            <img src={link.peerImage} alt={link.peerName} className="h-full w-full object-cover" />
                          ) : (
                            <UserPlus size={24} />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-black">{link.peerName}</CardTitle>
                          <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">{link?.type?.replace('_', ' ')}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical size={20} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="p-3 font-semibold rounded-lg"><Info className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem className="p-3 font-semibold rounded-lg text-red-500 cursor-pointer" onClick={() => handleRevoke(link.id)}><X className="mr-2 h-4 w-4" /> Disconnect</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold">Email</span>
                        <span className="font-bold text-gray-900 dark:text-white">{link.peerEmail}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold">Connected Since</span>
                        <span className="font-bold text-gray-900 dark:text-white">{new Date(link.createdAt).toDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50 group/code">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Member Code</span>
                          <span className="font-black text-primary tracking-widest">{link.peerCode}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(link.peerCode)}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <Button variant="ghost" className="w-full justify-between h-12 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-primary/10 hover:text-primary transition-all font-bold">
                        <span>Check Profile</span>
                        <ExternalLink size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 font-bold">No pending link requests found.</p>
                </div>
              ) : (
                pendingRequests.map((req: any) => (
                  <Card key={req.id} className="rounded-[2.5rem] overflow-hidden border-2 border-orange-100 dark:border-orange-500/20 shadow-lg shadow-orange-500/5">
                    <CardHeader className="p-6">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-orange-500 text-white border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest">{req.linkType.replace('_', ' ')}</Badge>
                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-orange-50 dark:border-orange-900/20">
                          {req.peerImage ? (
                            <img src={req.peerImage} alt={req.peerName} className="h-full w-full object-cover" />
                          ) : (
                            <Clock size={20} className="text-orange-500" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-black">{req.peerName}</CardTitle>
                          <CardDescription className="font-bold text-gray-500 truncate">{req.peerEmail}</CardDescription>
                        </div>
                      </div>

                      {req.note && (
                        <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 italic">{req.note}</p>
                        </div>
                      )}
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <Hash size={12} className="text-gray-400" />
                        <span className="text-xs font-black text-primary tracking-widest">{req.peerCode}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="flex gap-3">
                        {req.requesterId !== user?.id && (
                          <Button
                            onClick={() => handleRespond(req.id, 'ACCEPT')}
                            className="flex-1 h-12 rounded-2xl bg-primary text-white font-black shadow-md shadow-primary/20 hover:scale-[1.03] transition-all"
                          >
                            <Check size={20} className="mr-2" /> Approve
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (req.requesterId === user?.id) {
                              handleCancel(req.id);
                            } else {
                              handleRespond(req.id, 'REJECT');
                            }
                          }}
                          variant="outline"
                          className="flex-1 h-12 rounded-2xl border-red-200 text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-950/20 hover:scale-[1.03] transition-all"
                        >
                          <X size={20} className="mr-2" /> {req.requesterId === user?.id ? 'Cancel' : 'Decline'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

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
  );
}

// --- Components ---

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
