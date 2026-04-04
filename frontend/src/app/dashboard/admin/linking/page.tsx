/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
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
  useAcceptAllLinkRequests
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
  const { data: activeLinksData, isLoading: isLoadingActive } = useActiveLinks({
    page: currentPage,
    category: mainTab
  });
  const { data: profileResponse, isLoading: isLoadingProfile } = useLinkProfile();

  const requests = requestsData?.items || [];
  const activeLinks = activeLinksData?.items || [];
  const pendingRequests = pendingRequestsData?.items || [];
  
  const pagination = subTab === 'active' 
    ? activeLinksData?.pagination 
    : subTab === 'pending' 
      ? pendingRequestsData?.pagination 
      : requestsData?.pagination;

  const profile = profileResponse?.data || {};

  const respondMutation = useRespondToLinkRequest();
  const cancelMutation = useCancelLinkRequest();
  const revokeMutation = useRevokeActiveLink();
  const acceptAllMutation = useAcceptAllLinkRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{item: any, details: any} | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Reset page when tabs change
  React.useEffect(() => {
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

  const filteredActiveLinks = activeLinks.filter((link: any) => {
    const details = getMemberDetails(link, user?.id);
    const matchesSearch = (details.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const filteredRequests = requests.filter((req: any) => {
    if (req.status !== 'PENDING') return false;
    const details = getMemberDetails(req, user?.id);
    const matchesSearch = (details.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const networkPendingCount = subTab === 'pending' && mainTab === 'network' ? (pendingRequestsData?.pagination?.total || 0) : 0;
  const classroomPendingCount = subTab === 'pending' && mainTab === 'classroom' ? (pendingRequestsData?.pagination?.total || 0) : 0;
  // Note: These counts might be stale if we're not on the right tab. 
  // For a better UX, we might need a separate "stats" hook or fetch counts independently.
  // But for now, let's just use what we have.

  const handleAcceptAll = () => {
    const category = mainTab === 'classroom' ? 'classroom' : 'network';
    setConfirmModal({
      isOpen: true,
      title: `Accept All ${category === 'classroom' ? 'Classroom' : 'Network'} Requests?`,
      description: `This will automatically approve all pending ${category} link requests. This action cannot be undone.`,
      variant: 'default',
      onConfirm: () => {
        acceptAllMutation.mutate(category, {
          onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    });
  };

  const handleRespond = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate({ id, action });
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 dark:bg-transparent min-h-screen">
      <LinkingHeader 
        onConnectClick={() => setIsConnectModalOpen(true)} 
        onShowQRCodeClick={() => setIsQRCodeModalOpen(true)}
      />

      <LinkingStats 
        activeCount={activeLinks.length}
        pendingCount={pendingRequests.length}
        totalCount={requests.length}
      />

      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />

      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        schoolCode={profile?.schoolCode || ''}
      />

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        isLoading={acceptAllMutation.isPending || revokeMutation.isPending}
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

        {isLoadingActive || isLoadingRequests ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border-2 border-dashed border-gray-100 dark:border-gray-700">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Fetching {subTab} {mainTab} connections...</p>
          </div>
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
            onAcceptAll={handleAcceptAll}
            onRespond={handleRespond}
            onCancel={handleCancel}
            onCopy={copyToClipboard}
            onViewProfile={handleViewProfile}
            respondingId={respondMutation.isPending ? (respondMutation.variables as any)?.id : null}
            cancellingId={cancelMutation.isPending ? (cancelMutation.variables as string) : null}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="text-blue-500" size={28} />
              </div>
              <h3 className="text-xl font-black mb-2">Activity History</h3>
              <p className="text-gray-500 max-w-xs font-medium">Link activity history for {mainTab} will appear here soon.</p>
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
