import prisma from "../../config/database";

export const getClassTimetableService = async (classId: string, termPeriodId?: string) => {
  const whereClause: any = { classId };
  if (termPeriodId) {
    whereClause.termPeriodId = termPeriodId;
  }

  return prisma.timetablePeriod.findMany({
    where: whereClause,
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
  const { id, classId, day, startTime, endTime, subjectId, teacherId, room, termPeriodId, isBreak, breakLabel } = data;
  
  if (id) {
    return prisma.timetablePeriod.update({
      where: { id },
      data: {
        day,
        startTime,
        endTime,
        subjectId: isBreak ? null : subjectId || null,
        teacherId: isBreak ? null : teacherId || null,
        room: isBreak ? null : room || null,
        isBreak: !!isBreak,
        breakLabel: isBreak ? breakLabel || "Recess / Break" : null,
        termPeriodId: termPeriodId || null,
      },
    });
  }
  
  return prisma.timetablePeriod.create({
    data: {
      classId,
      day,
      startTime,
      endTime,
      subjectId: isBreak ? null : subjectId || null,
      teacherId: isBreak ? null : teacherId || null,
      room: isBreak ? null : room || null,
      isBreak: !!isBreak,
      breakLabel: isBreak ? breakLabel || "Recess / Break" : null,
      termPeriodId: termPeriodId || null,
    },
  });
};

export const deleteTimetablePeriodService = async (id: string) => {
  return prisma.timetablePeriod.delete({
    where: { id },
  });
};

export const getTeacherTimetableService = async (teacherId: string) => {
  return prisma.timetablePeriod.findMany({
    where: { teacherId },
    include: {
      subject: true,
      class: true,
    },
    orderBy: [
      { day: "asc" },
      { startTime: "asc" },
    ],
  });
};

export const replicateTimetableService = async (
  classId: string,
  sourceTermPeriodId: string,
  targetTermPeriodId: string
) => {
  const sourcePeriods = await prisma.timetablePeriod.findMany({
    where: { classId, termPeriodId: sourceTermPeriodId }
  });

  if (sourcePeriods.length === 0) {
    throw new Error("No timetable periods found to replicate in the source term");
  }

  return prisma.$transaction(async (tx) => {
    // Delete existing periods in target term period
    await tx.timetablePeriod.deleteMany({
      where: { classId, termPeriodId: targetTermPeriodId }
    });

    // Create target records
    const newPeriods = sourcePeriods.map(sp => ({
      classId: sp.classId,
      day: sp.day,
      startTime: sp.startTime,
      endTime: sp.endTime,
      subjectId: sp.subjectId,
      teacherId: sp.teacherId,
      room: sp.room,
      isBreak: sp.isBreak,
      breakLabel: sp.breakLabel,
      termPeriodId: targetTermPeriodId
    }));

    await tx.timetablePeriod.createMany({
      data: newPeriods
    });

    return tx.timetablePeriod.findMany({
      where: { classId, termPeriodId: targetTermPeriodId },
      include: {
        subject: true,
        teacher: true
      }
    });
  });
};

export const autoGenerateTimetableService = async (classId: string, termPeriodId: string) => {
  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      subjects: {
        include: {
          subject: {
            include: {
              teacher: true
            }
          }
        }
      }
    }
  });

  if (!classObj) {
    throw new Error("Class not found");
  }

  const schoolId = classObj.schoolId;

  let availableSubjects: any[] = [];
  if (schoolId) {
    availableSubjects = await prisma.subject.findMany({
      where: { schoolId, isArchived: false },
      include: { teacher: true }
    });
  }

  // Fallback to class subjects if school-wide subjects are empty
  if (availableSubjects.length === 0 && classObj.subjects.length > 0) {
    availableSubjects = classObj.subjects.map((cs: any) => cs.subject);
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const templateSlots = [
    { startTime: "07:30", endTime: "08:00", isBreak: true, breakLabel: "Assembly" },
    { startTime: "08:00", endTime: "09:00", isBreak: false, breakLabel: null },
    { startTime: "09:00", endTime: "10:00", isBreak: false, breakLabel: null },
    { startTime: "10:00", endTime: "11:00", isBreak: false, breakLabel: null },
    { startTime: "11:00", endTime: "11:30", isBreak: true, breakLabel: "Recess" },
    { startTime: "11:30", endTime: "12:30", isBreak: false, breakLabel: null },
    { startTime: "12:30", endTime: "13:30", isBreak: true, breakLabel: "Lunch Break" },
    { startTime: "13:30", endTime: "14:30", isBreak: false, breakLabel: null },
    { startTime: "14:30", endTime: "15:30", isBreak: false, breakLabel: null },
  ];

  const newPeriods: any[] = [];
  let subjectIndex = 0;

  for (const day of days) {
    for (const slot of templateSlots) {
      if (slot.isBreak) {
        newPeriods.push({
          classId,
          day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBreak: true,
          breakLabel: slot.breakLabel,
          subjectId: null,
          teacherId: null,
          room: null,
          termPeriodId
        });
      } else {
        let subjectId: string | null = null;
        let teacherId: string | null = null;
        let room: string | null = null;

        if (availableSubjects.length > 0) {
          const currentSubject = availableSubjects[subjectIndex % availableSubjects.length];
          subjectId = currentSubject.id;
          teacherId = currentSubject.teacherId || null;
          room = currentSubject.room || "Room " + (Math.floor(Math.random() * 5) + 101);
          subjectIndex++;
        }

        newPeriods.push({
          classId,
          day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBreak: false,
          breakLabel: null,
          subjectId,
          teacherId,
          room,
          termPeriodId
        });
      }
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.timetablePeriod.deleteMany({
      where: { classId, termPeriodId }
    });

    await tx.timetablePeriod.createMany({
      data: newPeriods
    });

    return tx.timetablePeriod.findMany({
      where: { classId, termPeriodId },
      include: {
        subject: true,
        teacher: true
      },
      orderBy: [
        { day: "asc" },
        { startTime: "asc" }
      ]
    });
  });
};
