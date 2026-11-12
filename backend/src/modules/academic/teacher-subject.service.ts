import prisma from "../../config/database";
import { LinkEntityType } from "@prisma/client";
import { hasActiveSchoolLink } from "./academic.permissions";
import { createNotification } from "../notification/notification.service";
import { resolveInitiatorIdentity } from "../notification/services/notification-sender.util";

export const assignTeacherToSubjectService = async ({
  adminId,
  teacherId,
  subjectId,
  schoolId,
}: {
  adminId: string;
  teacherId: string;
  subjectId: string;
  schoolId: string;
}) => {
  const allowed = await hasActiveSchoolLink({
    userId: adminId,
    userType: LinkEntityType.ADMIN,
    schoolId,
  });

  if (!allowed) {
    throw new Error("You are not linked to this school");
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

  if (!teacher) throw new Error("Teacher not found");
  if (!subject || subject.isArchived) throw new Error("Subject not found");

  if (subject.schoolId !== schoolId) {
    throw new Error("Subject does not belong to this school");
  }

  const assignment = await prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId_schoolId: {
        teacherId,
        subjectId,
        schoolId,
      },
    },
    update: {},
    create: {
      teacherId,
      subjectId,
      schoolId,
    },
  });

  const initiator = await resolveInitiatorIdentity({
    userId: adminId,
    userType: "ADMIN",
    schoolId,
  });
  const byLine = initiator
    ? ` by ${initiator.senderName} (${initiator.senderRole})`
    : "";

  await createNotification({
    recipientType: "TEACHER",
    recipientId: teacherId,
    senderType: initiator?.senderType || "ADMIN",
    senderId: initiator?.senderId || adminId,
    type: "ACADEMIC",
    title: "Subject Assignment",
    message: `You have been assigned to teach ${subject.name}${byLine}.`,
    link: `/dashboard/teacher/subjects/${subject.id}`,
    meta: {
      subjectId: subject.id,
      subjectName: subject.name,
      schoolId,
      ...(initiator
        ? {
          senderName: initiator.senderName,
          senderRole: initiator.senderRole,
          adminName: initiator.senderName,
        }
        : {}),
    },
  });

  return assignment;
};

export const getTeacherSubjectsService = async ({
  teacherId,
  schoolId,
}: {
  teacherId: string;
  schoolId?: string;
}) => {
  return prisma.teacherSubject.findMany({
    where: {
      teacherId,
      ...(schoolId ? { schoolId } : {}),
    },
    include: {
      subject: true,
      school: true,
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
