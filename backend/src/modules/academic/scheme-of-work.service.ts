import prisma from "../../config/database";

export const getSubjectSchemesService = async (subjectId: string) => {
  return prisma.schemeOfWork.findMany({
    where: { subjectId },
    orderBy: [
      { term: "asc" },
      { week: "asc" }
    ]
  });
};

export const createSchemeEntryService = async (data: {
  subjectId: string;
  term?: number;
  week: number;
  topic: string;
  objectives?: string;
  resources?: string;
}) => {
  return prisma.schemeOfWork.create({
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
  return prisma.schemeOfWork.update({
    where: { id },
    data
  });
};

export const deleteSchemeEntryService = async (id: string) => {
  return prisma.schemeOfWork.delete({
    where: { id }
  });
};

export const bulkSyncSchemeService = async (subjectId: string, entries: any[]) => {
  // Simple strategy: Delete all and replace if they don't have IDs, or sync properly
  // For now, let's allow individual CRUD from the UI as it's cleaner.
  // But for the SubjectModal bulk edit, we might need this.
  
  await prisma.$transaction([
    prisma.schemeOfWork.deleteMany({ where: { subjectId } }),
    prisma.schemeOfWork.createMany({
      data: entries.map(e => ({
        subjectId,
        term: e.term || 1,
        week: e.week,
        topic: e.topic,
        objectives: e.objectives,
        resources: e.resources,
        isCompleted: e.isCompleted || false
      }))
    })
  ]);
  
  return getSubjectSchemesService(subjectId);
};
