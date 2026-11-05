import prisma, { withRetry } from "../../../config/database";
import { resolveSchoolId } from "./school-access.service";

const LANDING_FIELDS = [
  "heroTitle",
  "heroSubtitle",
  "heroImage",
  "aboutTitle",
  "aboutText",
  "aboutImage",
  "primaryColor",
  "features",
  "testimonials",
  "gallery",
  "contactInfo",
  "customPages",
] as const;

export const getSchoolLandingPageService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error("School not found");

  return withRetry(
    () =>
      prisma.schoolLandingPage.upsert({
        where: { schoolId: resolvedId },
        update: {},
        create: {
          schoolId: resolvedId,
        },
      }),
    "school.getSchoolLandingPageService",
  );
};

export const getSchoolLandingPageBySubdomainService = async (
  subdomain: string,
) => {
  const school = await withRetry(
    () =>
      prisma.school.findUnique({
        where: { subdomain },
      }),
    "school.getSchoolLandingPageBySubdomainService.findSchool",
  );
  if (!school) return null;

  const landingPage = await withRetry(
    () =>
      prisma.schoolLandingPage.upsert({
        where: { schoolId: school.id },
        update: {},
        create: {
          schoolId: school.id,
        },
      }),
    "school.getSchoolLandingPageBySubdomainService.upsert",
  );

  return {
    landingPage,
    schoolName: school.name,
    schoolLogo: school.logo,
    schoolMotto: school.motto,
  };
};

export const updateSchoolLandingPageService = async (
  schoolId: string,
  data: Record<string, unknown>,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error("School not found");

  if (data.isDraft === true) {
    const currentData = await withRetry(
      () =>
        prisma.schoolLandingPage.findUnique({
          where: { schoolId: resolvedId },
        }),
      "school.updateSchoolLandingPageService.findCurrent",
    );
    const existingDraft =
      (currentData?.draftData as Record<string, unknown>) || {};
    const newDraftData: Record<string, unknown> = { ...existingDraft };

    for (const field of LANDING_FIELDS) {
      if (data[field] !== undefined) {
        newDraftData[field] = data[field];
      }
    }

    return withRetry(
      () =>
        prisma.schoolLandingPage.upsert({
          where: { schoolId: resolvedId },
          update: { draftData: newDraftData as never },
          create: {
            schoolId: resolvedId,
            draftData: newDraftData as never,
          },
        }),
      "school.updateSchoolLandingPageService.upsertDraft",
    );
  }

  const updateData: Record<string, unknown> = { draftData: null };
  for (const field of LANDING_FIELDS) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  return withRetry(
    () =>
      prisma.schoolLandingPage.upsert({
        where: { schoolId: resolvedId },
        update: updateData as never,
        create: {
          schoolId: resolvedId,
          ...(updateData as Record<string, never>),
        },
      }),
    "school.updateSchoolLandingPageService.publish",
  );
};

