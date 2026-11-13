import prisma, { withRetry } from "../../../config/database";
import { Prisma } from "@prisma/client";
import { resolveSchoolId } from "./school-access.service";

const SAFE_SCHOOL_PROFILE_SELECT = {
  id: true,
  name: true,
  subdomain: true,
  tenantId: true,
  schoolCode: true,
  address: true,
  phone: true,
  schoolEmail: true,
  motto: true,
  logo: true,
  foundedYear: true,
  principal: true,
  schoolType: true,
  website: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  bannerImage: true,
  favicon: true,
  mapLocation: true,
  operatingHours: true,
  socialLinks: true,
  plan: true,
  subscriptionStatus: true,
  subscriptionEnd: true,
  isTrialActive: true,
  trialEndsAt: true,
  billingCycle: true,
  profileCompleted: true,
  levels: true,
  gradingSystem: true,
  admins: {
    where: { active: true },
    select: {
      id: true,
      role: true,
      active: true,
      createdAt: true,
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
          bannerImage: true,
          verified: true,
        },
      },
    },
  },
  sessions: {
    orderBy: [{ isActive: "desc" as const }, { startDate: "desc" as const }],
    take: 1,
    include: { termPeriods: true },
  },
  subscriptionPlan: {
    select: {
      id: true,
      name: true,
      features: true,
    },
  },
} satisfies Prisma.SchoolSelect;

export interface UpdateSchoolProfileInput {
  name?: string;
  motto?: string | null;
  description?: string | null;
  logo?: string | null;
  bannerImage?: string | null;
  favicon?: string | null;
  schoolEmail?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  foundedYear?: number | string | null;
  principal?: string | null;
  schoolType?: string | null;
  socialLinks?: Prisma.InputJsonValue;
  operatingHours?: string | null;
  mapLocation?: string | null;
  levels?: string[];
  gradingSystem?: Prisma.InputJsonValue;
  profileCompleted?: boolean;
}

export const getSchoolProfileService = async (
  schoolId: string,
  includeLeadership = true,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return null;

  const profile = await withRetry(
    () =>
      prisma.school.findUnique({
        where: { id: resolvedId },
        select: SAFE_SCHOOL_PROFILE_SELECT,
      }),
    "school.getSchoolProfileService",
  );

  if (!profile) return null;

  if (!includeLeadership) {
    return {
      ...profile,
      admins: profile.admins.map((sa) => ({
        id: sa.id,
        role: sa.role,
        active: sa.active,
        admin: {
          id: sa.admin.id,
          name: sa.admin.name,
          role: sa.admin.role,
          profileImage: sa.admin.profileImage,
          verified: sa.admin.verified,
        },
      })),
    };
  }

  return profile;
};

export const updateSchoolProfileService = async (
  schoolId: string,
  data: UpdateSchoolProfileInput,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error("School not found");

  const updatePayload: Prisma.SchoolUpdateInput = {};

  if (data.name !== undefined && String(data.name).trim()) {
    updatePayload.name = String(data.name).trim();
  }
  if (data.motto !== undefined) updatePayload.motto = data.motto ? String(data.motto) : null;
  if (data.description !== undefined)
    updatePayload.description = data.description ? String(data.description) : null;
  if (data.logo !== undefined) updatePayload.logo = data.logo ? String(data.logo) : null;
  if (data.bannerImage !== undefined)
    updatePayload.bannerImage = data.bannerImage ? String(data.bannerImage) : null;
  if (data.favicon !== undefined)
    updatePayload.favicon = data.favicon ? String(data.favicon) : null;
  if (data.schoolEmail !== undefined)
    updatePayload.schoolEmail = data.schoolEmail ? String(data.schoolEmail).trim() : null;
  if (data.phone !== undefined) updatePayload.phone = data.phone ? String(data.phone) : null;
  if (data.website !== undefined)
    updatePayload.website = data.website ? String(data.website) : null;
  if (data.address !== undefined)
    updatePayload.address = data.address ? String(data.address) : null;
  if (data.foundedYear !== undefined) {
    const parsedYear = Number(data.foundedYear);
    if (!isNaN(parsedYear) && parsedYear >= 1800 && parsedYear <= 2100) {
      updatePayload.foundedYear = parsedYear;
    }
  }
  if (data.principal !== undefined)
    updatePayload.principal = data.principal ? String(data.principal) : null;
  if (data.schoolType !== undefined)
    updatePayload.schoolType = data.schoolType ? String(data.schoolType) : null;
  if (data.socialLinks !== undefined) updatePayload.socialLinks = data.socialLinks;
  if (data.operatingHours !== undefined)
    updatePayload.operatingHours = data.operatingHours ? String(data.operatingHours) : null;
  if (data.mapLocation !== undefined)
    updatePayload.mapLocation = data.mapLocation ? String(data.mapLocation) : null;
  if (Array.isArray(data.levels)) {
    updatePayload.levels = data.levels.map((l) => String(l).trim()).filter(Boolean);
  }
  if (data.gradingSystem !== undefined) updatePayload.gradingSystem = data.gradingSystem;
  if (data.profileCompleted !== undefined)
    updatePayload.profileCompleted = Boolean(data.profileCompleted);

  return withRetry(
    () =>
      prisma.school.update({
        where: { id: resolvedId },
        data: updatePayload,
        select: SAFE_SCHOOL_PROFILE_SELECT,
      }),
    "school.updateSchoolProfileService",
  );
};

export const getSchoolSettingsService = async (schoolId: string) => {
  // Personal/unlinked tenant placeholders never map to a School row — return null instead of a 500.
  if (!schoolId || schoolId === "default-tenant-id" || schoolId === "personal") {
    return null;
  }
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) {
    return null;
  }

  const existing = await withRetry(
    () => prisma.schoolSetting.findUnique({ where: { schoolId: resolvedId } }),
    "school.getSchoolSettingsService.findSettings",
  );
  if (existing) return existing;

  return withRetry(
    () => prisma.schoolSetting.create({ data: { schoolId: resolvedId } }),
    "school.getSchoolSettingsService.createSettings",
  );
};

export interface UpdateSchoolSettingsInput {
  showComingSoon?: boolean;
  themeColor?: string;
  defaultSession?: string | null;
  defaultTerm?: string | null;
  enableEmailNotifications?: boolean;
  enablePushNotifications?: boolean;
  enableMaintenanceMode?: boolean;
  allowTeacherDigitalSignature?: boolean;
  lockSettings?: boolean;
  transcriptFee?: number | string;
}

export const updateSchoolSettingsService = async (
  schoolId: string,
  data: UpdateSchoolSettingsInput,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) {
    throw new Error(`Cannot update settings: school not found for ID "${schoolId}".`);
  }

  const updatePayload: Prisma.SchoolSettingUpdateInput = {};
  if (data.showComingSoon !== undefined) updatePayload.showComingSoon = !!data.showComingSoon;
  if (data.themeColor !== undefined) updatePayload.themeColor = String(data.themeColor);
  if (data.defaultSession !== undefined) updatePayload.defaultSession = data.defaultSession || null;
  if (data.defaultTerm !== undefined) updatePayload.defaultTerm = (data.defaultTerm as never) || null;
  if (data.enableEmailNotifications !== undefined)
    updatePayload.enableEmailNotifications = !!data.enableEmailNotifications;
  if (data.enablePushNotifications !== undefined)
    updatePayload.enablePushNotifications = !!data.enablePushNotifications;
  if (data.enableMaintenanceMode !== undefined)
    updatePayload.enableMaintenanceMode = !!data.enableMaintenanceMode;
  if (data.allowTeacherDigitalSignature !== undefined)
    updatePayload.allowTeacherDigitalSignature = !!data.allowTeacherDigitalSignature;
  if (data.lockSettings !== undefined) updatePayload.lockSettings = !!data.lockSettings;
  if (data.transcriptFee !== undefined) {
    const feeNum = parseFloat(String(data.transcriptFee));
    if (!isNaN(feeNum) && feeNum >= 0) updatePayload.transcriptFee = feeNum;
  }

  return withRetry(
    async () => {
      const updatedSettings = await prisma.schoolSetting.update({
        where: { schoolId: resolvedId },
        data: updatePayload,
      });

      // Keep the school's active Session.currentTerm synchronized when defaultTerm is updated in Settings
      if (data.defaultTerm) {
        const rawTerm = String(data.defaultTerm).trim().toUpperCase();
        const mappedTerm =
          rawTerm === "FIRST" || rawTerm === "FIRST TERM" || rawTerm === "TERM 1" || rawTerm === "1ST TERM"
            ? "FIRST"
            : rawTerm === "SECOND" || rawTerm === "SECOND TERM" || rawTerm === "TERM 2" || rawTerm === "2ND TERM"
              ? "SECOND"
              : rawTerm === "THIRD" || rawTerm === "THIRD TERM" || rawTerm === "TERM 3" || rawTerm === "3RD TERM"
                ? "THIRD"
                : null;

        if (mappedTerm) {
          await prisma.session.updateMany({
            where: {
              schoolId: resolvedId,
              ...(data.defaultSession ? { name: data.defaultSession } : { isActive: true }),
            },
            data: { currentTerm: mappedTerm },
          });
        }
      }

      return updatedSettings;
    },
    "school.updateSchoolSettingsService.update",
  );
};
