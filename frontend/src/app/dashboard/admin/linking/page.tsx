/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
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
import { ConnectModal } from './components/ConnectModal';
import { getMemberDetails, isClassLink } from './components/LinkingUtils';

function LinkingHub() {
  const { data: requests = [] } = useLinkRequests();
  const { data: pendingRequests = [] } = usePendingLinkRequests();
  const { data: activeLinks = [] } = useActiveLinks();
  const { data: profileResponse } = useLinkProfile();
  const profile = profileResponse?.data || {};

  const respondMutation = useRespondToLinkRequest();
  const cancelMutation = useCancelLinkRequest();
  const revokeMutation = useRevokeActiveLink();
  const acceptAllMutation = useAcceptAllLinkRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [mainTab, setMainTab] = useState<'network' | 'classroom'>('network');
  const [subTab, setSubTab] = useState<'active' | 'pending' | 'history'>('active');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const { user } = useAuthStore();

  const filteredActiveLinks = activeLinks.filter((link: any) => {
    const isClass = isClassLink(link.linkType || '');
    const details = getMemberDetails(link, user?.id);
    const matchesTab = mainTab === 'classroom' ? isClass : !isClass;
    const matchesSearch = (details.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const filteredRequests = requests.filter((req: any) => {
    if (req.status !== 'PENDING') return false;
    const isClass = isClassLink(req.linkType);
    const details = getMemberDetails(req, user?.id);
    const matchesTab = mainTab === 'classroom' ? isClass : !isClass;
    const matchesSearch = (details.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const networkPendingCount = requests.filter((r: any) => r.status === 'PENDING' && !isClassLink(r.linkType)).length;
  const classroomPendingCount = requests.filter((r: any) => r.status === 'PENDING' && isClassLink(r.linkType)).length;

  const handleAcceptAll = () => {
    if (window.confirm(`Are you sure you want to accept all pending ${mainTab} requests?`)) {
      acceptAllMutation.mutate(mainTab as any);
    }
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

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to disconnect this member?')) return;
    revokeMutation.mutate(id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 dark:bg-transparent min-h-screen">
      <LinkingHeader onConnectClick={() => setIsConnectModalOpen(true)} />

      <LinkingStats 
        activeCount={activeLinks.length}
        pendingCount={pendingRequests.length}
        totalCount={requests.length}
      />

      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
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

        {subTab === 'active' && (
          <ActiveLinksGrid 
            links={filteredActiveLinks}
            mainTab={mainTab}
            currentUserId={user?.id}
            onRevoke={handleRevoke}
            onCopy={copyToClipboard}
          />
        )}

        {subTab === 'pending' && (
          <PendingRequestsGrid 
            requests={filteredRequests}
            mainTab={mainTab}
            currentUserId={user?.id}
            isAcceptAllPending={acceptAllMutation.isPending}
            onAcceptAll={handleAcceptAll}
            onRespond={handleRespond}
            onCancel={handleCancel}
            onCopy={copyToClipboard}
          />
        )}

        {subTab === 'history' && (
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
      </div>
    </div>
  );
}

export default LinkingHub;
