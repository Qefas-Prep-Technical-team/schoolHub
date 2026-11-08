import { useMemo } from 'react';
import { useSignaturesByUserIds, useActiveSignature } from '@/lib/api/hooks/useSignature';
import { useSchoolAdmins } from '@/lib/api/hooks/useAdmin';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export interface GradeEndorsementSignatures {
  primarySignatory: {
    title: string;
    name: string;
    signatureUrl?: string;
    isImage: boolean;
  };
  secondarySignatory: {
    title: string;
    name: string;
    signatureUrl?: string;
    isImage: boolean;
  };
}

/**
 * Hook to resolve institutional administrator signatures for assessment grade reports.
 * Prioritizes: Principal -> School Owner/Proprietor -> Registrar -> Authorized Administrator
 */
export function useGradeEndorsementSignatures(
  schoolId: string,
  schoolProfile?: any,
  teacherName?: string,
  teacherSignatureUrl?: string
): GradeEndorsementSignatures {
  const { user } = useAuthStore();
  const currentAdminUserId = user?.id || (user as any)?.userId || 'admin-system';

  const { data: schoolAdminsResponse } = useSchoolAdmins(schoolId);
  const schoolAdmins: any[] = useMemo(() => {
    const list: any[] = schoolAdminsResponse?.data || [];
    const profileAdmins = schoolProfile?.admins;
    if (Array.isArray(profileAdmins)) {
      profileAdmins.forEach((sa: any) => {
        const adminObj = sa.admin;
        const uid = String(sa.adminId || adminObj?.id || sa.id || '');
        if (uid && !list.some((a) => a.id === uid)) {
          list.push({
            id: uid,
            name: String(adminObj?.name || sa.name || 'School Administrator'),
            adminRole: String(sa.role || adminObj?.role || ''),
          });
        }
      });
    }
    return list;
  }, [schoolAdminsResponse, schoolProfile]);

  const candidateIds = useMemo(() => {
    const ids = new Set<string>(['admin-system', currentAdminUserId]);
    schoolAdmins.forEach((a) => {
      if (a.id) ids.add(String(a.id));
    });
    return Array.from(ids);
  }, [schoolAdmins, currentAdminUserId]);

  const { data: signaturesMap = {} } = useSignaturesByUserIds(candidateIds);
  const { data: currentAuthSignature } = useActiveSignature(currentAdminUserId);
  const { data: systemAdminSignature } = useActiveSignature('admin-system');

  return useMemo(() => {
    const getSigForId = (id?: string) => {
      if (!id) return null;
      const sig = signaturesMap[id];
      if (sig && (sig.signedUrl || (sig as any).dataUrl) && sig.isActive !== false) {
        return sig;
      }
      if (id === currentAdminUserId && currentAuthSignature?.signedUrl) {
        return currentAuthSignature;
      }
      if (id === 'admin-system' && systemAdminSignature?.signedUrl) {
        return systemAdminSignature;
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

    const getAnyAvailableSignature = () => {
      if (currentAuthSignature?.signedUrl) return currentAuthSignature;
      if (systemAdminSignature?.signedUrl) return systemAdminSignature;
      for (const sig of Object.values(signaturesMap)) {
        if (sig && (sig.signedUrl || (sig as any).dataUrl) && sig.isActive !== false) {
          return sig;
        }
      }
      if (typeof window !== 'undefined') {
        try {
          const activeDirect = localStorage.getItem('schoolhub_signature_active');
          if (activeDirect) {
            const parsed = JSON.parse(activeDirect);
            if (parsed?.signedUrl) return parsed;
          }
          const sysDirect = localStorage.getItem('schoolhub_signature_admin-system');
          if (sysDirect) {
            const parsed = JSON.parse(sysDirect);
            if (parsed?.signedUrl) return parsed;
          }
        } catch {}
      }
      return null;
    };

    const isPrincipal = (r: string) => r === 'PRINCIPAL' || (r.includes('PRINCIPAL') && !r.includes('VICE'));
    const isVP = (r: string) => r === 'VICE_PRINCIPAL' || r.includes('VICE');
    const isOwner = (r: string) => r === 'SCHOOL_OWNER' || r.includes('OWNER') || r.includes('PROPRIETOR');
    const isRegistrar = (r: string) => r === 'REGISTRAR' || r.includes('REGISTRAR');

    const principals = schoolAdmins.filter((a) => isPrincipal(String(a.adminRole || a.role || '').toUpperCase()));
    const vps = schoolAdmins.filter((a) => isVP(String(a.adminRole || a.role || '').toUpperCase()));
    const owners = schoolAdmins.filter((a) => isOwner(String(a.adminRole || a.role || '').toUpperCase()));
    const registrars = schoolAdmins.filter((a) => isRegistrar(String(a.adminRole || a.role || '').toUpperCase()));

    // Find Head of Institution with an uploaded/drawn digital signature
    const headWithSig = principals.find((a) => !!getSigForId(a.id)) ||
      vps.find((a) => !!getSigForId(a.id)) ||
      owners.find((a) => !!getSigForId(a.id));

    const headAdmin = headWithSig || principals[0] || vps[0] || owners[0] || {
      id: currentAdminUserId,
      name: schoolProfile?.principalName || user?.name || 'Head of Institution',
      adminRole: 'PRINCIPAL'
    };

    const headRoleUpper = String(headAdmin.adminRole || '').toUpperCase();
    const headTitle = isPrincipal(headRoleUpper)
      ? 'Principal / Head of Institution'
      : isVP(headRoleUpper)
      ? 'Vice Principal (Academic)'
      : isOwner(headRoleUpper)
      ? 'Proprietor / School Director'
      : 'Principal / Head of Institution';

    const chosenHeadSig = getSigForId(headAdmin.id) || getAnyAvailableSignature();
    const headSigUrl = chosenHeadSig?.signedUrl || schoolProfile?.primarySignature || schoolProfile?.signatureUrl;
    const isHeadImg = Boolean(
      headSigUrl &&
      (headSigUrl.startsWith('data:') || headSigUrl.startsWith('blob:') || headSigUrl.startsWith('http') || headSigUrl.startsWith('/'))
    );

    // Secondary signatory: Registrar or Class Teacher
    const regWithSig = registrars.find((a) => !!getSigForId(a.id));
    const registrarAdmin = regWithSig || registrars[0];

    let secondaryTitle = 'Class Teacher';
    let secondaryName = teacherName || 'Subject Teacher';
    let secondarySigUrl = teacherSignatureUrl;

    if (registrarAdmin && !teacherName) {
      secondaryTitle = 'Registrar / Academic Office';
      secondaryName = registrarAdmin.name;
      const regSig = getSigForId(registrarAdmin.id);
      secondarySigUrl = regSig?.signedUrl;
    }

    const isSecondaryImg = Boolean(
      secondarySigUrl &&
      (secondarySigUrl.startsWith('data:') || secondarySigUrl.startsWith('blob:') || secondarySigUrl.startsWith('http') || secondarySigUrl.startsWith('/'))
    );

    return {
      primarySignatory: {
        title: headTitle,
        name: headAdmin.name,
        signatureUrl: headSigUrl,
        isImage: isHeadImg,
      },
      secondarySignatory: {
        title: secondaryTitle,
        name: secondaryName,
        signatureUrl: secondarySigUrl,
        isImage: isSecondaryImg,
      },
    };
  }, [schoolAdmins, signaturesMap, currentAuthSignature, systemAdminSignature, schoolProfile, currentAdminUserId, teacherName, teacherSignatureUrl, user]);
}

