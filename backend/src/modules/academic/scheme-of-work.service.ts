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
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
    select: { schoolId: true }
  });

  if (!subject || !subject.schoolId) throw new Error("Subject not found or not associated with a school");

  return prisma.schemeOfWork.create({
    data: {
      ...data,
      term: data.term ?? 1,
      schoolId: subject.schoolId
    }

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
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { schoolId: true }
  });

  if (!subject) throw new Error("Subject not found");
  const schoolId = subject.schoolId as string;
  if (!schoolId) throw new Error("Subject is not associated with a school");

  await prisma.$transaction([
    prisma.schemeOfWork.deleteMany({ where: { subjectId } }),
    prisma.schemeOfWork.createMany({

      data: entries.map(e => ({
        title: e.title || `Week ${e.week} - ${e.topic}`,
        tenantId: e.tenantId,
        classId: e.classId,
        subjectId,
        schoolId,
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
