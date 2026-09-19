/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  useLinkRequests,
  useActiveLinks,
  useLinkProfile,
  useRespondToLinkRequest,
  useRevokeActiveLink,
  useCancelLinkRequest
} from '@/lib/api/hooks/useLinks';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { ConfirmationModal } from '@/components/reusable/ConfirmationModal';
import Pagination from '@/components/ui/Pagination';

// Import our newly abstracted components
import { StudentLinkingHeader } from './components/StudentLinkingHeader';
import { StudentLinkingPassport } from './components/StudentLinkingPassport';
import { StudentLinkingTabs } from './components/StudentLinkingTabs';
import { StudentActiveLinksGrid } from './components/StudentActiveLinksGrid';
import { StudentPendingRequestsGrid } from './components/StudentPendingRequestsGrid';
import { StudentConnectModal } from './components/StudentConnectModal';
import StudentQRCodeModal from './components/StudentQRCodeModal';

export default function LinkingHub() {
  const { user } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [mainTab, setMainTab] = useState<'network' | 'classroom'>('network');
  const [subTab, setSubTab] = useState<'active' | 'pending'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
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

  // Queries
  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests({ 
    page: currentPage, 
    category: mainTab,
    status: subTab === 'pending' ? 'PENDING' : undefined
  });
  
  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks({ 
    page: currentPage, 
    category: mainTab 
  });
  
  const { data: profileResponse, isLoading: isLoadingProfile } = useLinkProfile();

  // Badge Counts
  const { data: networkPendingRaw } = useLinkRequests({ status: 'PENDING', category: 'network', limit: 1 });
  const { data: classroomPendingRaw } = useLinkRequests({ status: 'PENDING', category: 'classroom', limit: 1 });
  const { data: networkActiveRaw } = useActiveLinks({ category: 'network', limit: 1 });
  const { data: classroomActiveRaw } = useActiveLinks({ category: 'classroom', limit: 1 });

  // Mutations
  const respondMutation = useRespondToLinkRequest();
  const revokeMutation = useRevokeActiveLink();
  const cancelMutation = useCancelLinkRequest();

  useEffect(() => {
    setCurrentPage(1);
  }, [mainTab, subTab]);

  const profile = profileResponse?.data || {};
  const requests = (requestsData as any)?.items || [];
  const activeLinks = (activeLinksData as any)?.items || [];
  const pagination = subTab === 'active' ? (activeLinksData as any)?.pagination : (requestsData as any)?.pagination;

  const isClassLink = (type: string) => type === 'STUDENT_CLASS' || type === 'TEACHER_CLASS';

  const getPeer = (item: any) => {
    const r = item.approvedFromRequest || item;
    const type = item.linkType || r.linkType;

    const isInstitutional = type?.includes('SCHOOL') || isClassLink(type);
    if (isInstitutional) {
      if (type?.includes('SCHOOL') && (item.school || r.targetSchool || r.requesterSchool)) {
        return item.school || r.targetSchool || r.requesterSchool;
      }
      if (isClassLink(type) && r.class) {
        return r.class;
      }
    }

    const participants = [
      r.targetStudent, r.targetTeacher, r.targetParent, r.approverAdmin,
      r.requesterStudent, r.requesterTeacher, r.requesterParent, r.requesterAdmin,
      r.sender, r.receiver
    ].filter(Boolean);

    return participants.find((p: any) => p.id !== user?.id) || null;
  };

  // Normalization
  const normalizedActiveLinks = activeLinks.map((link: any) => {
    const peer = getPeer(link);
    const isLeft = link.leftEntityId === user?.id;
    const peerCode = isLeft ? link.rightCode : link.leftCode;
    
    let peerName = peer?.name || peer?.fullName || peer?.username || peerCode || "Verified Member";
    let peerEmail = peer?.email || peer?.schoolEmail || (isClassLink(link.linkType) ? "Classroom Entity" : (link.linkType?.includes('SCHOOL') ? "School Entity" : "---"));
    
    if (link.linkType?.includes('SCHOOL') && link.school) {
        peerName = link.school.name || peerName;
        peerEmail = link.school.email || link.school.schoolEmail || "School Entity";
    }

    if (link.linkType === 'STUDENT_CLASS' || link.linkType === 'TEACHER_CLASS') {
      peerName = link.class?.name || link.class?.classCode || peerName;
    }

    let roleDisplay = link.linkType?.replace('_', ' ');
    if (link.linkType === 'SCHOOL_STUDENT') roleDisplay = 'School';
    if (link.linkType === 'PARENT_STUDENT') roleDisplay = 'Parent';
    if (link.linkType === 'STUDENT_CLASS') roleDisplay = 'Classroom';

    return {
      ...link,
      peerName,
      peerEmail,
      peerCode,
      roleDisplay,
      peerImage: peer?.logo || peer?.profileImage || peer?.avatar,
      variant: isClassLink(link.linkType) ? 'classroom' : 'network'
    };
  }).filter((link: any) => link.peerName !== "Verified Member" || link.linkType.includes('CLASS'));

  const normalizedRequests = requests.map((req: any) => {
    const peer = getPeer(req);
    const isOutgoing = req.requesterId === user?.id;
    const peerCode = isOutgoing ? req.targetCode : req.requesterCode;

    let peerName = peer?.name || peer?.fullName || peer?.username || peerCode || "Verified Member";
    let peerEmail = peer?.email || peer?.schoolEmail || (isClassLink(req.linkType) ? "Classroom Entity" : (req.linkType?.includes('SCHOOL') ? "School Entity" : "---"));

    if (req.linkType?.includes('SCHOOL') && (req.targetSchool || req.requesterSchool)) {
      const school = req.targetSchool || req.requesterSchool;
      peerName = school.name || peerName;
      peerEmail = school.email || school.schoolEmail || "School Entity";
    }

    return {
      ...req,
      peerName,
      peerEmail,
      peerImage: peer?.logo || peer?.profileImage || peer?.avatar,
      variant: isClassLink(req.linkType) ? 'classroom' : 'network'
    };
  }).filter((req: any) => req.peerName !== "Verified Member" || req.linkType.includes('CLASS'));

  // Filtering
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

  // Action Handlers
  const handleRevoke = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Disconnect Entity?',
      description: 'Are you sure you want to revoke this connection? This action will remove access to shared resources.',
      variant: 'destructive',
      onConfirm: () => {
        revokeMutation.mutate(id, { onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false })) });
      }
    });
  };

  const handleCancel = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Connection Request?',
      description: 'Are you sure you want to withdraw this request? You will need to resend it if you change your mind.',
      variant: 'destructive',
      onConfirm: () => {
        cancelMutation.mutate(id, { onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false })) });
      }
    });
  };

  const handleRespond = (id: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate({ id, action });
  };

  const networkPendingCount = (networkPendingRaw as any)?.pagination?.total || 0;
  const classroomPendingCount = (classroomPendingRaw as any)?.pagination?.total || 0;
  const networkActiveCount = (networkActiveRaw as any)?.pagination?.total || 0;
  const classroomActiveCount = (classroomActiveRaw as any)?.pagination?.total || 0;
  const totalActiveCount = networkActiveCount + classroomActiveCount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black/95 p-4 md:p-8">
      <div className="w-[95%] max-w-[1600px] mx-auto space-y-8">
        
        <StudentLinkingHeader 
          onShowQRCodeClick={() => setIsQRCodeModalOpen(true)}
          onConnectClick={() => setIsConnectModalOpen(true)}
        />

        <StudentLinkingPassport 
          profile={profile}
          user={user}
          totalActiveCount={totalActiveCount}
          classroomActiveCount={classroomActiveCount}
          networkActiveCount={networkActiveCount}
          onConnectClick={() => setIsConnectModalOpen(true)}
        />

        <div className="space-y-6">
          <StudentLinkingTabs 
            mainTab={mainTab}
            setMainTab={setMainTab}
            subTab={subTab}
            setSubTab={setSubTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            networkPendingCount={networkPendingCount}
            classroomPendingCount={classroomPendingCount}
          />

          {isLoadingActive || isLoadingRequests || isLoadingProfile ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Synchronizing your network...</p>
            </div>
          ) : subTab === 'active' ? (
            <StudentActiveLinksGrid 
              links={filteredActiveLinks}
              mainTab={mainTab}
              onRevoke={handleRevoke}
              revokingId={revokeMutation.variables}
            />
          ) : (
            <StudentPendingRequestsGrid 
              requests={filteredRequests}
              mainTab={mainTab}
              userId={user?.id}
              onRespond={handleRespond}
              onCancel={handleCancel}
              respondingId={(respondMutation.variables as any)?.id}
              cancellingId={cancelMutation.variables}
            />
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

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        isLoading={revokeMutation.isPending || cancelMutation.isPending}
      />

      <StudentConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />

      <StudentQRCodeModal 
        isOpen={isQRCodeModalOpen} 
        onClose={() => setIsQRCodeModalOpen(false)} 
        studentCode={profile?.linkingCode || ''}
        studentName={profile?.name || user?.name}
      />
    </div>
  );
}
