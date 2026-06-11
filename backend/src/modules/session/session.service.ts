import prisma from "../../config/database";
import { LinkEntityType } from "@prisma/client";
import { hasActiveSchoolLink } from "../academic/academic.permissions";

const mapSessionStatus = (session: any) => {
  if (session.isActive) return "ACTIVE";
  if (session.isClosed) return "ARCHIVED";
  return "INACTIVE";
};

export const createSessionService = async ({
  adminId,
  schoolId,
  name,
  startDate,
  endDate,
  isActive = true, // Default to true as requested
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

  const session = await prisma.session.create({
    data: {
      schoolId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
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

  return { ...session, status: mapSessionStatus(session) };
};

export const getSessionsService = async (schoolId?: string) => {
  const sessions = await prisma.session.findMany({
    where: schoolId ? { schoolId } : {},
    include: {
      termPeriods: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return sessions.map(s => ({ ...s, status: mapSessionStatus(s) }));
};

export const getActiveSessionService = async (schoolId: string) => {
  return prisma.session.findFirst({
    where: { schoolId, isActive: true, isClosed: false },
  });
};

export const updateSessionService = async (
  id: string,
  adminId: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    termDates?: { term: string; startDate: string; endDate: string }[];
  }
) => {
  const session = await prisma.session.findUnique({
    where: { id }
  });

  if (!session || !session.schoolId) throw new Error("Session not found");

  const allowed = await hasActiveSchoolLink({
    userId: adminId,
    userType: LinkEntityType.ADMIN,
    schoolId: session.schoolId,
  });

  if (!allowed) throw new Error("You are not linked to this school");

  if (data.isActive) {
    await prisma.session.updateMany({
      where: { schoolId: session.schoolId, isActive: true, NOT: { id } },
      data: { isActive: false },
    });
  }

  const updatedSession = await prisma.session.update({
    where: { id },
    data: {
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      isActive: data.isActive,
      termPeriods: data.termDates ? {
        deleteMany: {},
        create: data.termDates.map((td) => ({
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

  return { ...updatedSession, status: mapSessionStatus(updatedSession) };
};

export const archiveSessionService = async (id: string, adminId: string) => {
  const session = await prisma.session.findUnique({
    where: { id }
  });

  if (!session || !session.schoolId) throw new Error("Session not found");

  const allowed = await hasActiveSchoolLink({
    userId: adminId,
    userType: LinkEntityType.ADMIN,
    schoolId: session.schoolId,
  });

  if (!allowed) throw new Error("You are not linked to this school");

  const archivedSession = await prisma.session.update({
    where: { id },
    data: {
      isActive: false,
      isClosed: true,
    },
    include: {
      termPeriods: true,
    },
  });

  return { ...archivedSession, status: mapSessionStatus(archivedSession) };
};

export const deleteSessionService = async (id: string, adminId: string) => {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          exams: true,
          grades: true,
        }
      }
    }
  });

  if (!session || !session.schoolId) throw new Error("Session not found");

  const allowed = await hasActiveSchoolLink({
    userId: adminId,
    userType: LinkEntityType.ADMIN,
    schoolId: session.schoolId,
  });

  if (!allowed) throw new Error("You are not linked to this school");

  if (session._count.exams > 0 || session._count.grades > 0) {
    throw new Error("Cannot delete session with existing exams or grades. Archive it instead.");
  }

  return prisma.session.delete({
    where: { id },
  });
};
