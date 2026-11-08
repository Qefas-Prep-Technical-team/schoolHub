"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSignaturesByUserIds, useActiveSignature } from '@/lib/api/hooks/useSignature';
import { adminService } from '@/lib/api/services/adminService';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export interface ConnectedSignatory {
  title: string;
  name: string;
  role: string;
  signatureUrl?: string;
  isImage: boolean;
  userId?: string;
  isFallback: boolean;
}

export interface ConnectedSchoolSignatures {
  isLoading: boolean;
  isError: boolean;
  schoolId?: string;
  headOfSchool: ConnectedSignatory;
  secondarySignatory: ConnectedSignatory;
  availableSignatories: ConnectedSignatory[];
}

/**
 * Universal hook to fetch official leadership signatures (Principal, Owner/Proprietor, Registrar)
 * strictly for the connected school tenant.
 *
 * Hierarchy rule:
 * 1. Principal / Head of Institution
 * 2. School Owner / Proprietor / Director
 * 3. Registrar / Academic Office
 * 4. Vice Principal (Academic)
 */
export function useConnectedSchoolSignature(
  schoolId?: string,
  schoolProfile?: {
    name?: string;
    principalName?: string;
    primarySignature?: string;
    signatureUrl?: string;
    admins?: Array<{
      id?: string;
      adminId?: string;
      role?: string;
      admin?: { id?: string; name?: string; role?: string };
    }>;
  },
  teacherContext?: {
    name?: string;
    signatureUrl?: string;
  }
): ConnectedSchoolSignatures {
  const { user } = useAuthStore();
  const currentUserId = user?.id || (user as { userId?: string })?.userId || '';

  // 1. Fetch team members strictly for the connected school
  const {
    data: teamResponse,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
  } = useQuery({
    queryKey: ['admin', 'team', schoolId],
    queryFn: () => adminService.getSchoolAdmins(schoolId!),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5, // 5 min per rules
    retry: 1,
  });

  // 2. Synthesize admins list strictly from connected school data
  const schoolAdmins = useMemo(() => {
    const list: Array<{ id: string; name: string; role: string }> = [];
    const teamData = teamResponse?.data;
    if (Array.isArray(teamData)) {
      teamData.forEach((adminItem: { id?: string; name?: string; role?: string; adminRole?: string }) => {
        const uid = String(adminItem.id || '');
        if (uid) {
          list.push({
            id: uid,
            name: String(adminItem.name || 'School Administrator'),
            role: String(adminItem.role || adminItem.adminRole || 'ADMIN'),
          });
        }
      });
    }

    if (Array.isArray(schoolProfile?.admins)) {
      schoolProfile.admins.forEach((sa) => {
        const adminObj = sa.admin;
        const uid = String(sa.adminId || adminObj?.id || sa.id || '');
        if (uid && !list.some((a) => a.id === uid)) {
          list.push({
            id: uid,
            name: String(adminObj?.name || 'School Administrator'),
            role: String(sa.role || adminObj?.role || 'ADMIN'),
          });
        }
      });
    }

    return list;
  }, [teamResponse, schoolProfile]);

  // 3. Batch candidate IDs for active digital signatures
  const candidateIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUserId) ids.add(currentUserId);
    ids.add('admin-system');
    schoolAdmins.forEach((a) => {
      if (a.id) ids.add(String(a.id));
    });
    return Array.from(ids);
  }, [schoolAdmins, currentUserId]);

  const { data: signaturesMap = {}, isLoading: isLoadingSigs } = useSignaturesByUserIds(candidateIds);
  const { data: currentAuthSig } = useActiveSignature(currentUserId);
  const { data: sysAdminSig } = useActiveSignature('admin-system');

  return useMemo(() => {
    const getSigForId = (id?: string) => {
      if (!id) return null;
      const sig = signaturesMap[id];
      if (sig && (sig.signedUrl || (sig as { dataUrl?: string }).dataUrl) && sig.isActive !== false) {
        return sig;
      }
      if (id === currentUserId && currentAuthSig?.signedUrl) {
        return currentAuthSig;
      }
      if (id === 'admin-system' && sysAdminSig?.signedUrl) {
        return sysAdminSig;
      }
      if (typeof window !== 'undefined') {
        try {
          const direct = localStorage.getItem(`schoolhub_signature_${id}`);
          if (direct) {
            const parsed = JSON.parse(direct);
            if (parsed && (parsed.signedUrl || parsed.dataUrl)) return parsed;
          }
        } catch {}
      }
      return null;
    };

    const getAnyConnectedSignature = () => {
      for (const admin of schoolAdmins) {
        const found = getSigForId(admin.id);
        if (found) return found;
      }
      if (currentAuthSig?.signedUrl) return currentAuthSig;
      if (sysAdminSig?.signedUrl) return sysAdminSig;
      return null;
    };

    const isPrincipalRole = (r: string) => r === 'PRINCIPAL' || (r.includes('PRINCIPAL') && !r.includes('VICE'));
    const isVpRole = (r: string) => r === 'VICE_PRINCIPAL' || r.includes('VICE');
    const isOwnerRole = (r: string) => r === 'SCHOOL_OWNER' || r.includes('OWNER') || r.includes('PROPRIETOR');
    const isRegistrarRole = (r: string) => r === 'REGISTRAR' || r.includes('REGISTRAR');

    const principals = schoolAdmins.filter((a) => isPrincipalRole(a.role.toUpperCase()));
    const owners = schoolAdmins.filter((a) => isOwnerRole(a.role.toUpperCase()));
    const registrars = schoolAdmins.filter((a) => isRegistrarRole(a.role.toUpperCase()));
    const vps = schoolAdmins.filter((a) => isVpRole(a.role.toUpperCase()));

    // 1. Resolve Primary Signatory (Principal -> Owner -> Registrar -> VP)
    const headWithSig =
      principals.find((a) => !!getSigForId(a.id)) ||
      owners.find((a) => !!getSigForId(a.id)) ||
      registrars.find((a) => !!getSigForId(a.id)) ||
      vps.find((a) => !!getSigForId(a.id));

    const headAdmin = headWithSig || principals[0] || owners[0] || registrars[0] || vps[0] || {
      id: currentUserId || 'head-system',
      name: schoolProfile?.principalName || user?.name || 'Head of Institution',
      role: 'PRINCIPAL',
    };

    const headRoleUpper = headAdmin.role.toUpperCase();
    const headTitle = isPrincipalRole(headRoleUpper)
      ? 'Principal / Head of Institution'
      : isOwnerRole(headRoleUpper)
      ? 'Proprietor / School Director'
      : isRegistrarRole(headRoleUpper)
      ? 'Registrar / Academic Office'
      : isVpRole(headRoleUpper)
      ? 'Vice Principal (Academic)'
      : 'Principal / Head of Institution';

    const chosenHeadSig = getSigForId(headAdmin.id) || getAnyConnectedSignature();
    const headSigUrl = chosenHeadSig?.signedUrl || schoolProfile?.primarySignature || schoolProfile?.signatureUrl;
    const isHeadImg = Boolean(
      headSigUrl &&
      (headSigUrl.startsWith('data:') || headSigUrl.startsWith('blob:') || headSigUrl.startsWith('http') || headSigUrl.startsWith('/'))
    );

    const headSignatory: ConnectedSignatory = {
      title: headTitle,
      name: headAdmin.name,
      role: headAdmin.role,
      signatureUrl: headSigUrl,
      isImage: isHeadImg,
      userId: headAdmin.id,
      isFallback: !chosenHeadSig,
    };

    // 2. Resolve Secondary Signatory (Teacher context or Registrar)
    const regWithSig = registrars.find((a) => !!getSigForId(a.id));
    const registrarAdmin = regWithSig || registrars[0];

    let secondaryTitle = 'Class Teacher';
    let secondaryName = teacherContext?.name || 'Subject Teacher';
    let secondarySigUrl = teacherContext?.signatureUrl;
    let secondaryUserId: string | undefined;

    if (registrarAdmin && !teacherContext?.name) {
      secondaryTitle = 'Registrar / Academic Office';
      secondaryName = registrarAdmin.name;
      secondaryUserId = registrarAdmin.id;
      const regSig = getSigForId(registrarAdmin.id);
      secondarySigUrl = regSig?.signedUrl;
    }

    const isSecondaryImg = Boolean(
      secondarySigUrl &&
      (secondarySigUrl.startsWith('data:') || secondarySigUrl.startsWith('blob:') || secondarySigUrl.startsWith('http') || secondarySigUrl.startsWith('/'))
    );

    const secondarySignatory: ConnectedSignatory = {
      title: secondaryTitle,
      name: secondaryName,
      role: registrarAdmin?.role || 'TEACHER',
      signatureUrl: secondarySigUrl,
      isImage: isSecondaryImg,
      userId: secondaryUserId,
      isFallback: !secondarySigUrl,
    };

    // 3. Assemble list of all available signatories in the school
    const availableSignatories: ConnectedSignatory[] = schoolAdmins.map((admin) => {
      const sig = getSigForId(admin.id);
      const rUpper = admin.role.toUpperCase();
      const title = isPrincipalRole(rUpper)
        ? 'Principal / Head of Institution'
        : isOwnerRole(rUpper)
        ? 'Proprietor / School Director'
        : isRegistrarRole(rUpper)
        ? 'Registrar / Academic Office'
        : isVpRole(rUpper)
        ? 'Vice Principal (Academic)'
        : 'School Administrator';

      return {
        title,
        name: admin.name,
        role: admin.role,
        signatureUrl: sig?.signedUrl,
        isImage: Boolean(sig?.signedUrl),
        userId: admin.id,
        isFallback: !sig,
      };
    });

    return {
      isLoading: isLoadingTeam || isLoadingSigs,
      isError: isErrorTeam,
      schoolId,
      headOfSchool: headSignatory,
      secondarySignatory,
      availableSignatories,
    };
  }, [
    schoolAdmins,
    signaturesMap,
    currentAuthSig,
    sysAdminSig,
    schoolProfile,
    currentUserId,
    teacherContext,
    user,
    isLoadingTeam,
    isLoadingSigs,
    isErrorTeam,
    schoolId,
  ]);
}

