import prisma from "../../config/database";

export const getSubjectSchemesService = async (subjectId: string) => {
  return (prisma as any).schemeOfWork.findMany({
    where: { subjectId },
    orderBy: [
      { term: "asc" },
      { week: "asc" }
    ]
  });
};

export const createSchemeEntryService = async (data: {
  title: string;
  tenantId: string;
  classId: string;
  subjectId: string;
  term?: number;
  week: number;
  topic: string;
  objectives?: string;
  resources?: string;
}) => {
  return (prisma as any).schemeOfWork.create({
    data
  });
};

export const updateSchemeEntryService = async (
  id: string,
  data: {
    term?: number;
    week?: number;
    topic?: string;
    objectives?: string;
    resources?: string;
    isCompleted?: boolean;
  }
) => {
  return (prisma as any).schemeOfWork.update({
    where: { id },
    data
  });
};

export const deleteSchemeEntryService = async (id: string) => {
  return (prisma as any).schemeOfWork.delete({
    where: { id }
  });
};

export const bulkSyncSchemeService = async (subjectId: string, entries: any[]) => {
  // Simple strategy: Delete all and replace if they don't have IDs, or sync properly
  // For now, let's allow individual CRUD from the UI as it's cleaner.
  // But for the SubjectModal bulk edit, we might need this.
  
  await (prisma as any).$transaction([
    (prisma as any).schemeOfWork.deleteMany({ where: { subjectId } }),
    (prisma as any).schemeOfWork.createMany({
      data: entries.map(e => ({
        title: e.title || `Week ${e.week} - ${e.topic}`,
        tenantId: e.tenantId,
        classId: e.classId,
        subjectId,
        term: e.term || 1,
        week: e.week,
        topic: e.topic,
        objectives: e.objectives,
        resources: e.resources,
        status: e.status || "DRAFT"
      }))
    })
  ]);
  
  return getSubjectSchemesService(subjectId);
};
