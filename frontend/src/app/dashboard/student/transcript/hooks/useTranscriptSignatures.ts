import { useMemo } from "react";
import {
  useSignaturesByUserIds,
  useActiveSignature,
} from "@/lib/api/hooks/useSignature";
import {
  PublishedResultGroup,
  SignatureSlotInfo,
} from "../types/transcript.types";

export function useTranscriptSignatures(
  schoolProfile: Record<string, unknown> | null | undefined,
  school: Record<string, unknown> | null | undefined,
  schoolName: string,
  results: PublishedResultGroup[],
): {
  principalSlot: SignatureSlotInfo;
  registrarSlot: SignatureSlotInfo;
} {
  // Extract leadership from schoolProfile.admins without calling /admin/team (prevents 403 for students)
  const schoolAdmins = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      role?: string;
      adminRole?: string;
    }> = [];
    const seen = new Set<string>();
    const profileAdmins =
      (schoolProfile?.admins as Array<Record<string, unknown>>) ||
      (school?.admins as Array<Record<string, unknown>>) ||
      [];

    if (Array.isArray(profileAdmins)) {
      profileAdmins.forEach((sa) => {
        const adminObj = sa.admin as Record<string, unknown> | undefined;
        const uid = String(sa.adminId || adminObj?.id || sa.id || "");
        if (uid && !seen.has(uid)) {
          seen.add(uid);
          list.push({
            id: uid,
            name: String(adminObj?.name || sa.name || "School Administrator"),
            role: String(sa.role || adminObj?.role || ""),
            adminRole: String(sa.role || adminObj?.role || ""),
          });
        }
      });
    }
    return list;
  }, [schoolProfile, school]);

  const approvalInfo = useMemo(() => {
    for (const g of results) {
      const gRec = g as unknown as Record<string, unknown>;
      const app =
        (gRec.approval as Record<string, unknown> | undefined) ||
        ((gRec.paperLinks as Record<string, unknown> | undefined)?.approval as
          | Record<string, unknown>
          | undefined);
      if (app && app.status === "APPROVED") return app;
      for (const s of g.subjectResults || []) {
        const sRec = s as unknown as Record<string, unknown>;
        const sApp =
          (sRec.approval as Record<string, unknown> | undefined) ||
          ((sRec.paperLinks as Record<string, unknown> | undefined)?.approval as
            | Record<string, unknown>
            | undefined);
        if (sApp && sApp.status === "APPROVED") return sApp;
      }
    }
    return null;
  }, [results]);

  const candidateUserIds = useMemo(() => {
    const ids = new Set<string>(["admin-system"]);
    schoolAdmins.forEach((a) => {
      if (a.id) ids.add(String(a.id));
    });
    if (approvalInfo?.approvedById) ids.add(String(approvalInfo.approvedById));
    if (approvalInfo?.requestedById)
      ids.add(String(approvalInfo.requestedById));
    return Array.from(ids);
  }, [schoolAdmins, approvalInfo]);

  const { data: signaturesMap = {} } = useSignaturesByUserIds(candidateUserIds);
  const { data: systemAdminSignature } = useActiveSignature("admin-system");

  return useMemo(() => {
    const getSigForId = (id?: string) => {
      if (!id) return null;
      const sig = signaturesMap[id];
      if (
        sig &&
        (sig.signedUrl || (sig as unknown as Record<string, unknown>).dataUrl) &&
        sig.isActive !== false
      ) {
        return sig;
      }
      return null;
    };

    const getAnyAvailableSignature = () => {
      if (
        systemAdminSignature &&
        (systemAdminSignature.signedUrl ||
          (systemAdminSignature as unknown as Record<string, unknown>).dataUrl) &&
        systemAdminSignature.isActive !== false
      ) {
        return systemAdminSignature;
      }
      for (const sig of Object.values(signaturesMap)) {
        if (
          sig &&
          (sig.signedUrl ||
            (sig as unknown as Record<string, unknown>).dataUrl) &&
          sig.isActive !== false
        ) {
          return sig;
        }
      }
      return null;
    };

    const isPrincipal = (r: string) =>
      r === "PRINCIPAL" || (r.includes("PRINCIPAL") && !r.includes("VICE"));
    const isVicePrincipal = (r: string) =>
      r === "VICE_PRINCIPAL" || r.includes("VICE");
    const isOwner = (r: string) =>
      r === "SCHOOL_OWNER" || r.includes("OWNER") || r.includes("PROPRIETOR");

    const principals = schoolAdmins.filter((a) =>
      isPrincipal(String(a.adminRole || a.role || "").toUpperCase()),
    );
    const vps = schoolAdmins.filter((a) =>
      isVicePrincipal(String(a.adminRole || a.role || "").toUpperCase()),
    );
    const owners = schoolAdmins.filter((a) =>
      isOwner(String(a.adminRole || a.role || "").toUpperCase()),
    );
    const registrars = schoolAdmins.filter((a) =>
      String(a.adminRole || a.role || "").toUpperCase().includes("REGISTRAR"),
    );

    const chosenHead = principals.find((a) => !!getSigForId(a.id)) ||
      vps.find((a) => !!getSigForId(a.id)) ||
      owners.find((a) => !!getSigForId(a.id)) ||
      principals[0] ||
      vps[0] ||
      owners[0] || {
      id: "head",
      name: "Principal / Head of Institution",
      adminRole: "PRINCIPAL",
    };

    const anyAvailableSig = getAnyAvailableSignature();
    const chosenSig = getSigForId(chosenHead.id);
    let headSigUrl =
      chosenSig?.signedUrl || anyAvailableSig?.signedUrl || undefined;
    if (!headSigUrl && approvalInfo?.signature) {
      headSigUrl = String(approvalInfo.signature)
        .replace(/\s*\([^)]*\)$/, "")
        .trim();
    }
    if (!headSigUrl) {
      headSigUrl = chosenHead.name || "Principal / Head of Institution";
    }

    const isHeadImg = Boolean(
      headSigUrl &&
      (headSigUrl.startsWith("data:") ||
        headSigUrl.startsWith("blob:") ||
        headSigUrl.startsWith("http") ||
        headSigUrl.startsWith("/")),
    );

    const roleUpper = String(
      chosenHead.adminRole || (chosenHead as { role?: string }).role || "",
    ).toUpperCase();
    const headTitle = isPrincipal(roleUpper)
      ? "Principal / Head of Institution"
      : isVicePrincipal(roleUpper)
        ? "Vice Principal / Academic Director"
        : isOwner(roleUpper)
          ? "School Owner / Proprietor"
          : "Principal / Head of Institution";

    const chosenReg = registrars.find((a) => !!getSigForId(a.id)) ||
      registrars[0] || { id: "reg", name: "Office of the Registrar" };
    const regSig = getSigForId(chosenReg.id);
    const regSigUrl =
      regSig?.signedUrl || (chosenSig ? anyAvailableSig?.signedUrl : undefined);
    const isRegImg = Boolean(
      regSigUrl &&
      (regSigUrl.startsWith("data:") ||
        regSigUrl.startsWith("blob:") ||
        regSigUrl.startsWith("http") ||
        regSigUrl.startsWith("/")),
    );

    return {
      principalSlot: {
        roleTitle: headTitle,
        subtitle: `${chosenHead.name} • ${schoolName}`,
        signatureUrl: headSigUrl,
        adminName: chosenHead.name,
        isImage: isHeadImg,
      },
      registrarSlot: {
        roleTitle: "Registrar / Academic Director",
        subtitle: `${chosenReg.name} • Office of Academic Records`,
        signatureUrl: regSigUrl,
        adminName: chosenReg.name,
        isImage: isRegImg,
      },
    };
  }, [
    schoolAdmins,
    signaturesMap,
    systemAdminSignature,
    approvalInfo,
    schoolName,
  ]);
}

