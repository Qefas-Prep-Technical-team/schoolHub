import prisma from "../../config/database";

export const getClassTimetableService = async (classId: string) => {
  return prisma.timetablePeriod.findMany({
    where: { classId },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: [
      { day: "asc" },
      { startTime: "asc" },
    ],
  });
};

export const upsertTimetablePeriodService = async (data: any) => {
  const { id, classId, day, startTime, endTime, subjectId, teacherId, room } = data;
  
  if (id) {
    return prisma.timetablePeriod.update({
      where: { id },
      data: {
        day,
        startTime,
        endTime,
        subjectId,
        teacherId,
        room,
      },
    });
  }
  
  return prisma.timetablePeriod.create({
    data: {
      classId,
      day,
      startTime,
      endTime,
      subjectId,
      teacherId,
      room,
    },
  });
};

export const deleteTimetablePeriodService = async (id: string) => {
  return prisma.timetablePeriod.delete({
    where: { id },
  });
};
