import { apiClient } from '@/lib/api/client';
import { signatureService } from '@/lib/api/services/signatureService';

export interface ResolvedSignaturesResult {
  principalSigUrl?: string;
  adminName: string;
  adminTitle: string;
}

/**
 * Resolves verified administrative signature (Principal, School Owner, Registrar, or Authorized Admin)
 * strictly for connected school admins, prioritizing active digital signatures.
 * If isPaying is false, signatures are intentionally omitted (dash only) per non-paying tier rules.
 */
export async function resolveDigitalSignatures(school: unknown, isPaying: boolean = true): Promise<ResolvedSignaturesResult> {
  const schoolObj = (school || {}) as {
    id?: string;
    schoolId?: string;
    principalName?: string;
    primarySignature?: string;
    signatureUrl?: string;
    admins?: Array<{
      id?: string;
      adminId?: string;
      role?: string;
      admin?: { id?: string; name?: string; role?: string };
    }>;
  };

  // If user/school is not paying, do not include digital signature
  if (!isPaying) {
    return {
      principalSigUrl: undefined,
      adminName: schoolObj.principalName || "Head of Institution",
      adminTitle: "Principal / Head of Institution",
    };
  }

  let primarySig = schoolObj.primarySignature || schoolObj.signatureUrl;
  let adminName = schoolObj.principalName || 'Principal / Head of Institution';
  let adminTitle = 'Principal / Head of Institution';

  try {
    const schoolId = schoolObj.id || schoolObj.schoolId;
    let schoolAdmins: Array<{ id: string; name: string; role: string }> = [];
    if (schoolId) {
      try {
        const teamRes = await apiClient.get('/admin/team', { params: { schoolId } });
        if (teamRes.data?.data && Array.isArray(teamRes.data.data)) {
          schoolAdmins = teamRes.data.data.map((a: { id: string; name?: string; role?: string; adminRole?: string }) => ({
            id: String(a.id),
            name: String(a.name || 'School Administrator'),
            role: String(a.role || a.adminRole || ''),
          }));
        }
      } catch { }
    }

    if (Array.isArray(schoolObj.admins)) {
      schoolObj.admins.forEach((sa) => {
        const adminObj = sa.admin;
        const uid = String(sa.adminId || adminObj?.id || sa.id || '');
        if (uid && !schoolAdmins.some((a) => a.id === uid)) {
          schoolAdmins.push({
            id: uid,
            name: String(adminObj?.name || 'School Administrator'),
            role: String(sa.role || adminObj?.role || ''),
          });
        }
      });
    }

    const isPrincipal = (r: string) => r === 'PRINCIPAL' || (r.includes('PRINCIPAL') && !r.includes('VICE'));
    const isVP = (r: string) => r === 'VICE_PRINCIPAL' || r.includes('VICE');
    const isOwner = (r: string) => r === 'SCHOOL_OWNER' || r.includes('OWNER') || r.includes('PROPRIETOR');
    const isRegistrar = (r: string) => r === 'REGISTRAR' || r.includes('REGISTRAR');

    const adminUserIds = schoolAdmins.map((a) => a.id).filter(Boolean);
    const candidateIds = Array.from(new Set([...adminUserIds, 'admin-system']));

    const sigsMap = await signatureService.getSignaturesByUserIds(candidateIds);

    const getSigForId = (id?: string) => {
      if (!id) return null;
      const s = sigsMap[id];
      if (s && (s.signedUrl || (s as { dataUrl?: string }).dataUrl) && s.isActive !== false) {
        return s;
      }
      return null;
    };

    const principals = schoolAdmins.filter((a) => isPrincipal(a.role.toUpperCase()));
    const vps = schoolAdmins.filter((a) => isVP(a.role.toUpperCase()));
    const owners = schoolAdmins.filter((a) => isOwner(a.role.toUpperCase()));
    const registrars = schoolAdmins.filter((a) => isRegistrar(a.role.toUpperCase()));

    const pWithSig = principals.find((a) => !!getSigForId(a.id));
    const oWithSig = owners.find((a) => !!getSigForId(a.id));
    const vpWithSig = vps.find((a) => !!getSigForId(a.id));
    const rWithSig = registrars.find((a) => !!getSigForId(a.id));

    const matchedAdmin =
      pWithSig || oWithSig || vpWithSig || rWithSig || principals[0] || owners[0] || vps[0] || registrars[0];

    if (matchedAdmin) {
      adminName = matchedAdmin.name;
      const r = matchedAdmin.role.toUpperCase();
      if (isPrincipal(r)) adminTitle = 'Principal / Head of Institution';
      else if (isOwner(r)) adminTitle = 'Proprietor / School Director';
      else if (isVP(r)) adminTitle = 'Vice Principal (Academic)';
      else if (isRegistrar(r)) adminTitle = 'Registrar / Academic Office';

      const foundSig = getSigForId(matchedAdmin.id);
      if (foundSig?.signedUrl) {
        primarySig = foundSig.signedUrl;
      }
    }

    if (!primarySig) {
      const adminRecord = await signatureService.getActiveSignature('admin-system');
      if (adminRecord?.signedUrl) {
        primarySig = adminRecord.signedUrl;
      }
    }
  } catch { }

  return {
    principalSigUrl: primarySig,
    adminName,
    adminTitle,
  };
}

