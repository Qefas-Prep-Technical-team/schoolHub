import prisma from "../../config/database";
import { LinkEntityType } from "@prisma/client";
import { hasActiveSchoolLink } from "../academic/academic.permissions";

export const createSessionService = async ({
  adminId,
  schoolId,
  name,
  startDate,
  endDate,
  isActive,
  termDates,
}: {
  adminId: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  termDates?: { term: string; startDate: string; endDate: string }[];
}) => {
  const allowed = await hasActiveSchoolLink({
    userId: adminId,
    userType: LinkEntityType.ADMIN,
    schoolId,
  });

  if (!allowed) throw new Error("You are not linked to this school");

  if (isActive) {
    await prisma.session.updateMany({
      where: { schoolId, isActive: true },
      data: { isActive: false },
    });
  }

  return prisma.session.create({
    data: {
      schoolId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: !!isActive,
      termPeriods: termDates ? {
        create: termDates.map((td) => ({
          term: td.term as any,
          startDate: new Date(td.startDate),
          endDate: new Date(td.endDate),
        })),
      } : undefined,
    },
    include: {
      termPeriods: true,
    },
  });
};

export const getSessionsService = async (schoolId?: string) => {
  return prisma.session.findMany({
    where: schoolId ? { schoolId } : {},
    include: {
      termPeriods: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getActiveSessionService = async (schoolId: string) => {
  return prisma.session.findFirst({
    where: { schoolId, isActive: true, isClosed: false },
  });
};
