/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useLinkRequests,
  useActiveLinks,
  useLinkProfile,
  useRespondToLinkRequest,
  useCancelLinkRequest,
  useRevokeActiveLink
} from '@/lib/api/hooks/useLinks';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { TeacherPagination } from '@/app/dashboard/teacher/components/TeacherPagination';

import { TeacherLinkingHeader } from './components/TeacherLinkingHeader';
import { TeacherLinkingCodeCards } from './components/TeacherLinkingCodeCards';
import TeacherQRCodeModal from './components/TeacherQRCodeModal';
import { TeacherLinkingStats } from './components/TeacherLinkingStats';
import { TeacherLinkingTabs } from './components/TeacherLinkingTabs';
import { TeacherActiveLinksGrid } from './components/TeacherActiveLinksGrid';
import { TeacherPendingRequestsGrid } from './components/TeacherPendingRequestsGrid';
import { TeacherConnectModal } from './components/TeacherConnectModal';

function LinkingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black p-5 animate-pulse shadow-sm h-[200px] flex flex-col items-center justify-between"
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-900" />
            <div className="space-y-2 flex flex-col items-center w-full">
              <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-900 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-900 rounded" />
            </div>
          </div>
          <div className="h-6 w-full bg-slate-200 dark:bg-zinc-900 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

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
    { enabled: true }
  );
  
  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests(
    { page: isPersonal ? (mainTab === 'network' ? instPage : classPage) : currentPage, category: isPersonal ? mainTab : undefined },
    { enabled: true }
  );

  // Independent fetches for persistent badges (counts)
  const { data: networkTotalData } = useLinkRequests({ category: 'network', status: 'PENDING', limit: 1 }, { enabled: isPersonal });
  const { data: classroomTotalData } = useLinkRequests({ category: 'classroom', status: 'PENDING', limit: 1 }, { enabled: isPersonal });

  const { data: profileResponse } = useLinkProfile();
  const profile = (profileResponse?.data || {}) as any;

  const currentSchool = schools.find(s => s.id === selectedSchoolId);
  const activeSchoolCode = currentSchool?.linkingCode || currentSchool?.schoolCode || profile?.schoolCode;

  const respondMutation = useRespondToLinkRequest();
  const cancelMutation = useCancelLinkRequest();
  const revokeMutation = useRevokeActiveLink();

  const getPeer = (item: any) => {
    const r = item.approvedFromRequest || item;
    const participants = [
      r.targetStudent, r.targetTeacher, r.targetParent, r.targetSchool, r.approverAdmin,
      r.requesterStudent, r.requesterTeacher, r.requesterParent, r.requesterSchool, r.requesterAdmin,
      item.school, item.class
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
    } as const;
  }) as any[];

  // Normalized Data
  const activeLinks = normalizeList((activeLinksData as any)?.items || []);
  const requests = normalizeList((requestsData as any)?.items || []);
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

  const filteredActiveLinks = activeLinks.filter((link: any) => 
    link.peerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    link.peerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPendingRequests = pendingRequests.filter((req: any) => 
    req.peerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.peerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-5 sm:space-y-8 min-h-screen bg-slate-50/50 dark:bg-black font-sans">
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

      <TeacherLinkingStats 
        activeCount={activeLinks.length}
        pendingCount={pendingRequests.length}
        workspaceName={(isPersonal ? 'Personal Hub' : (currentSchool?.name || 'School')) as string}
        isLoadingActive={isLoadingActive}
        isLoadingPending={isLoadingRequests}
        isPersonal={isPersonal}
      />

      <TeacherConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <TeacherLinkingCodeCards 
        personalCode={profile?.linkingCode}
        schoolCode={activeSchoolCode}
        onCopy={copyToClipboard}
        isPersonal={isPersonal}
      />

      <div className="bg-white dark:bg-emerald-950/20 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-emerald-800/40 p-4 sm:p-6 shadow-sm space-y-5">
        <TeacherLinkingTabs 
          isPersonal={isPersonal}
          mainTab={mainTab}
          setMainTab={setMainTab}
          subTab={subTab}
          setSubTab={setSubTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          networkPendingCount={networkPendingCount}
          classroomPendingCount={classroomPendingCount}
          activeCount={activeLinks.length}
          pendingCount={pendingRequests.length}
          isLoadingActive={isLoadingActive}
          isLoadingRequests={isLoadingRequests}
        />

        {isLoadingActive || isLoadingRequests ? (
          <LinkingSkeleton count={8} />
        ) : subTab === 'active' ? (
          <TeacherActiveLinksGrid 
            links={filteredActiveLinks}
            mainTab={mainTab}
            isPersonal={isPersonal}
            currentUserId={user?.id}
            onRevoke={handleRevoke}
            onCopy={copyToClipboard}
          />
        ) : (
          <TeacherPendingRequestsGrid 
            requests={filteredPendingRequests}
            mainTab={mainTab}
            isPersonal={isPersonal}
            currentUserId={user?.id}
            onRespond={handleRespond}
            onCancel={handleCancel}
            onCopy={copyToClipboard}
          />
        )}

        {currentPagination && (
          <TeacherPagination
            currentPage={isPersonal ? (mainTab === 'network' ? instPage : classPage) : currentPage}
            totalPages={currentPagination.totalPages}
            totalItems={currentPagination.total}
            itemsPerPage={currentPagination.limit}
            onPageChange={isPersonal ? (mainTab === 'network' ? setInstPage : setClassPage) : setCurrentPage}
            itemName={subTab === 'active' ? 'connections' : 'requests'}
          />
        )}
      </div>
    </div>
  );
}

export default LinkingHub;
