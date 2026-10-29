/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

import {
  useLinkRequests,
  usePendingLinkRequests,
  useActiveLinks,
  useLinkProfile,
  useRespondToLinkRequest,
  useCancelLinkRequest,
  useRevokeActiveLink,
  useAcceptAllLinkRequests,
  useBatchLinkRequestAction
} from '@/lib/api/hooks/useLinks';

import { LinkingHeader } from './components/LinkingHeader';
import { LinkingStats } from './components/LinkingStats';
import { LinkingCodeCards } from './components/LinkingCodeCards';
import { LinkingTabs } from './components/LinkingTabs';
import { ActiveLinksGrid } from './components/ActiveLinksGrid';
import { PendingRequestsGrid } from './components/PendingRequestsGrid';
import { ProfilePreviewModal } from './components/ProfilePreviewModal';
import { ConnectModal } from './components/ConnectModal';
import QRCodeModal from './components/QRCodeModal';
import { LinkingSkeleton } from './components/LinkingSkeleton';
import Pagination from '@/components/ui/Pagination';
import { ConfirmationModal } from '@/components/reusable/ConfirmationModal';
import { getMemberDetails, isClassLink } from './components/LinkingUtils';

function LinkingHub() {
  const [currentPage, setCurrentPage] = useState(1);
  const [mainTab, setMainTab] = useState<'network' | 'classroom'>('network');
  const [subTab, setSubTab] = useState<'active' | 'pending' | 'history'>('active');

  const { data: requestsData, isLoading: isLoadingRequests } = useLinkRequests({ 
    page: currentPage, 
    category: mainTab 
  });
  const { data: pendingRequestsData, isLoading: isLoadingPending } = usePendingLinkRequests({
    page: currentPage,
    category: mainTab
  });

  // Independent fetches for persistent badges
  const { data: networkTotalData } = usePendingLinkRequests({ category: 'network', limit: 1 });
  const { data: classroomTotalData } = usePendingLinkRequests({ category: 'classroom', limit: 1 });

  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks({
    page: currentPage,
    category: mainTab
  });
  const { data: profileResponse, isLoading: isLoadingProfile } = useLinkProfile();

  const requests = (requestsData as any)?.items || [];
  const activeLinks = (activeLinksData as any)?.items || [];
  const pendingRequests = (pendingRequestsData as any)?.items || [];
  
  const pagination = subTab === 'active' 
    ? (activeLinksData as any)?.pagination 
    : subTab === 'pending' 
      ? (pendingRequestsData as any)?.pagination 
      : (requestsData as any)?.pagination;

  const profile = profileResponse?.data || {};

  const respondMutation = useRespondToLinkRequest();
  const cancelMutation = useCancelLinkRequest();
  const revokeMutation = useRevokeActiveLink();
  const acceptAllMutation = useAcceptAllLinkRequests();
  const batchMutation = useBatchLinkRequestAction();

  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{item: any, details: any} | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Track every request currently being processed so several can be accepted in parallel
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset page + selection when tabs change
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [mainTab, subTab]);

  // Clear selection on page change
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage]);

  // If accepting items emptied the current page, step back to the last valid page
  React.useEffect(() => {
    const totalPages = pagination?.totalPages ?? 0;
    if (currentPage > 1 && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [pagination?.totalPages, currentPage]);
  
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

  const filteredActiveLinks = useMemo(() => activeLinks.filter((link: any) => {
    // Hide private links that don't directly involve the school as an entity
    const privateTypes = ['PARENT_STUDENT', 'PEER_STUDENT'];
    if (privateTypes.includes(link.linkType)) return false;

    const details = getMemberDetails(link, user?.id);
    const q = searchQuery.toLowerCase();
    return (details.name || '').toLowerCase().includes(q) ||
      (details.email || '').toLowerCase().includes(q);
  }), [activeLinks, searchQuery, user?.id]);

  // Pending tab uses the incoming-pending endpoint so items match its pagination exactly
  const filteredRequests = useMemo(() => pendingRequests.filter((req: any) => {
    if (req.status && req.status !== 'PENDING') return false;
    
    // Hide private requests in admin hub
    const privateTypes = ['PARENT_STUDENT', 'PEER_STUDENT'];
    if (privateTypes.includes(req.linkType)) return false;

    const details = getMemberDetails(req, user?.id);
    const q = searchQuery.toLowerCase();
    return (details.name || '').toLowerCase().includes(q) ||
      (details.email || '').toLowerCase().includes(q);
  }), [pendingRequests, searchQuery, user?.id]);

  const networkPendingCount = (networkTotalData as any)?.pagination?.total || 0;
  const classroomPendingCount = (classroomTotalData as any)?.pagination?.total || 0;
  const categoryPendingTotal = (pendingRequestsData as any)?.pagination?.total ?? filteredRequests.length;

  const handleAcceptAll = () => {
    const category = mainTab === 'classroom' ? 'classroom' : 'network';
    setConfirmModal({
      isOpen: true,
      title: `Accept All ${category === 'classroom' ? 'Classroom' : 'Network'} Requests?`,
      description: `This will approve all ${categoryPendingTotal} pending ${category} request(s) across every page, oldest first. Requests that exceed plan limits will be skipped and reported.`,
      variant: 'default',
      onConfirm: () => {
        acceptAllMutation.mutate(category, {
          onSettled: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            setSelectedIds(new Set());
          }
        });
      }
    });
  };

  const handleRespond = useCallback((id: string, action: 'ACCEPT' | 'REJECT') => {
    setRespondingIds(prev => new Set(prev).add(id));
    respondMutation.mutate({ id, action }, {
      onSettled: () => {
        setRespondingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSelectedIds(prev => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  }, [respondMutation]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback(() => {
    setSelectedIds(prev => {
      const pageIds = filteredRequests.map((r: any) => r.id as string);
      const allSelected = pageIds.length > 0 && pageIds.every((id: string) => prev.has(id));
      return allSelected ? new Set() : new Set(pageIds);
    });
  }, [filteredRequests]);

  const handleBatchAction = (action: 'ACCEPT' | 'REJECT') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const run = () => {
      setRespondingIds(prev => new Set([...prev, ...ids]));
      batchMutation.mutate({ ids, action }, {
        onSettled: () => {
          setRespondingIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.delete(id));
            return next;
          });
          setSelectedIds(new Set());
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    };
    if (action === 'REJECT') {
      setConfirmModal({
        isOpen: true,
        title: `Reject ${ids.length} request(s)?`,
        description: 'The selected requesters will be notified that their request was rejected.',
        variant: 'destructive',
        onConfirm: run,
      });
    } else {
      run();
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const handleCancel = async (id: string) => {
    cancelMutation.mutate(id);
  };

  const handleViewProfile = (item: any, details: any) => {
    setSelectedProfile({ item, details });
    setIsProfileModalOpen(true);
  };

  const handleRevoke = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Disconnect Member?',
      description: 'Are you sure you want to revoke this connection? The member will lose access to school resources.',
      variant: 'destructive',
      onConfirm: () => {
        revokeMutation.mutate(id, {
          onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    });
  };

  const studentUsage = (profile?.usage as any)?.students || 0;
  const studentLimit = (profile?.limits as any)?.students || 0;
  const isLimitReached = studentLimit > 0 && studentUsage >= studentLimit;

  return (
    <div className="p-2 md:p-6 lg:p-8 w-full md:w-[95%] lg:w-[90%] max-w-full lg:max-w-[90%] mx-auto space-y-6 md:space-y-8 min-h-[calc(100vh-4rem)]">
      <LinkingHeader 
        onConnectClick={() => setIsConnectModalOpen(true)} 
        onShowQRCodeClick={() => setIsQRCodeModalOpen(true)}
        isLimitReached={isLimitReached}
      />

      <LinkingStats 
        activeCount={(activeLinksData as any)?.pagination?.total || activeLinks.length}
        pendingCount={(pendingRequestsData as any)?.pagination?.total || pendingRequests.length}
        totalCount={(requestsData as any)?.pagination?.total || requests.length}
        usage={profile?.usage as any}
        limits={profile?.limits as any}
      />

      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />

      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        schoolCode={profile?.schoolCode || (user as any)?.schoolCode || ''}
        schoolName={profile?.schoolAdmins?.[0]?.school?.name || (user as any)?.schoolName || (user as any)?.schools?.[0]?.name || 'Qefas Hub'}
        schoolLogo={profile?.schoolAdmins?.[0]?.school?.logo || (user as any)?.schools?.[0]?.logo || null}
      />

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        isLoading={acceptAllMutation.isPending || revokeMutation.isPending || batchMutation.isPending}
      />

      <LinkingCodeCards 
        personalCode={profile?.linkingCode}
        schoolCode={profile?.schoolCode}
        onCopy={copyToClipboard}
      />

      <div className="space-y-6">
        <LinkingTabs 
          mainTab={mainTab}
          setMainTab={setMainTab}
          subTab={subTab}
          setSubTab={setSubTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          networkPendingCount={networkPendingCount}
          classroomPendingCount={classroomPendingCount}
        />

        {(subTab === 'active' ? isLoadingActive : subTab === 'pending' ? isLoadingPending : isLoadingRequests) ? (
          <LinkingSkeleton count={8} />
        ) : subTab === 'active' ? (
          <ActiveLinksGrid 
            links={filteredActiveLinks}
            mainTab={mainTab}
            currentUserId={user?.id}
            onRevoke={handleRevoke}
            onCopy={copyToClipboard}
            onViewProfile={handleViewProfile}
            revokingId={revokeMutation.isPending ? (revokeMutation.variables as string) : null}
          />
        ) : subTab === 'pending' ? (
          <PendingRequestsGrid 
            requests={filteredRequests}
            mainTab={mainTab}
            currentUserId={user?.id}
            isAcceptAllPending={acceptAllMutation.isPending}
            totalPending={categoryPendingTotal}
            onAcceptAll={handleAcceptAll}
            onRespond={handleRespond}
            onCancel={handleCancel}
            onCopy={copyToClipboard}
            onViewProfile={handleViewProfile}
            respondingIds={respondingIds}
            cancellingId={cancelMutation.isPending ? (cancelMutation.variables as string) : null}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAllOnPage}
            onBatchAction={handleBatchAction}
            isBatchPending={batchMutation.isPending}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-slate-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Activity History</h3>
              <p className="text-slate-500 max-w-xs font-medium">Link activity history for {mainTab} will appear here soon.</p>
            </div>
          </div>
        )}

        {pagination && subTab !== 'history' && pagination.totalPages > 1 && (
          <div className="px-2 pb-4 md:px-4 md:pb-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={setCurrentPage}
              theme="blue"
            />
          </div>
        )}
      </div>

      <ProfilePreviewModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        details={selectedProfile?.details}
        item={selectedProfile?.item}
      />
    </div>
  );
}

export default LinkingHub;

