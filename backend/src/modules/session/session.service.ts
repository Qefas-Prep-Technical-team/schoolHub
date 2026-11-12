import prisma from "../../config/database";
import { LinkEntityType, Term } from "@prisma/client";
import { hasActiveSchoolLink } from "../academic/academic.permissions";

const mapSessionStatus = (session: any) => {
  if (session.isActive) return "ACTIVE";
  if (session.isClosed) return "ARCHIVED";
  return "INACTIVE";
};

const normalizeTermEnum = (raw?: string | null): Term | undefined => {
  if (!raw) return undefined;
  const upper = raw.trim().toUpperCase();
  if (upper === "FIRST" || upper === "FIRST TERM" || upper === "TERM 1" || upper === "1ST TERM") return Term.FIRST;
  if (upper === "SECOND" || upper === "SECOND TERM" || upper === "TERM 2" || upper === "2ND TERM") return Term.SECOND;
  if (upper === "THIRD" || upper === "THIRD TERM" || upper === "TERM 3" || upper === "3RD TERM") return Term.THIRD;
  return undefined;
};

const resolveCurrentTermFromDates = (
  termDates?: { term: string; startDate: string | Date; endDate: string | Date }[],
  explicitTerm?: string | null
): Term | undefined => {
  const normalizedExplicit = normalizeTermEnum(explicitTerm);
  if (normalizedExplicit) return normalizedExplicit;

  if (!Array.isArray(termDates) || termDates.length === 0) return undefined;

  const now = new Date();
  // 1. Check if current date falls inside any configured term period
  for (const td of termDates) {
    if (!td.startDate || !td.endDate) continue;
    const start = new Date(td.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(td.endDate);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end) {
      const matched = normalizeTermEnum(td.term);
      if (matched) return matched;
    }
  }

  // 2. If only one term has dates configured, treat it as the active term
  if (termDates.length === 1) {
    return normalizeTermEnum(termDates[0].term);
  }

  // 3. Otherwise, find the most recent term whose startDate has already passed
  const order: Record<string, number> = { FIRST: 1, SECOND: 2, THIRD: 3 };
  const sorted = [...termDates]
    .filter((td) => td.startDate && td.endDate)
    .sort((a, b) => (order[a.term] || 0) - (order[b.term] || 0));

  let latestStarted: Term | undefined;
  for (const td of sorted) {
    const start = new Date(td.startDate);
    start.setHours(0, 0, 0, 0);
    if (now >= start) {
      latestStarted = normalizeTermEnum(td.term) || latestStarted;
    }
  }

  return latestStarted || normalizeTermEnum(sorted[0]?.term);
};

export const createSessionService = async ({
  adminId,
  schoolId,
  name,
  startDate,
  endDate,
  isActive = true, // Default to true as requested
  currentTerm,
  termDates,
}: {
  adminId: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  currentTerm?: string;
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

  const resolvedTerm = resolveCurrentTermFromDates(termDates, currentTerm) || Term.FIRST;

  const session = await prisma.session.create({
    data: {
      schoolId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      currentTerm: resolvedTerm,
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

  return sessions.map(s => {
    const dynamicTerm =
      s.termPeriods && s.termPeriods.length > 0
        ? resolveCurrentTermFromDates(s.termPeriods as any, null) || s.currentTerm
        : s.currentTerm;
    return {
      ...s,
      currentTerm: dynamicTerm,
      status: mapSessionStatus(s),
    };
  });
};

export const getActiveSessionService = async (schoolId: string) => {
  const session = await prisma.session.findFirst({
    where: { schoolId, isActive: true, isClosed: false },
    include: {
      termPeriods: true,
    },
  });
  if (!session) return null;
  const dynamicTerm =
    session.termPeriods && session.termPeriods.length > 0
      ? resolveCurrentTermFromDates(session.termPeriods as any, null) || session.currentTerm
      : session.currentTerm;
  return {
    ...session,
    currentTerm: dynamicTerm,
  };
};

export const updateSessionService = async (
  id: string,
  adminId: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    currentTerm?: string;
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

  const resolvedTerm = resolveCurrentTermFromDates(data.termDates, data.currentTerm);

  const updatedSession = await prisma.session.update({
    where: { id },
    data: {
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      isActive: data.isActive,
      currentTerm: resolvedTerm,
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
