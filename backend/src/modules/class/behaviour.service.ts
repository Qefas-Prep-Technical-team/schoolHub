import prisma from "../../config/database";
import { BehaviourType } from "@prisma/client";
import { MailService } from "../notification/mail.service";
import { createNotification } from "../notification/notification.service";

export const getClassBehaviourAlertsService = async (classId: string, studentId?: string) => {
  return await prisma.behaviourAlert.findMany({
    where: {
      classId,
      ...(studentId ? { studentId } : {}),
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const createBehaviourAlertService = async (data: {
  type: BehaviourType;
  title: string;
  description?: string;
  studentId: string;
  reportedById: string;
  classId: string;
}) => {
  const newAlert = await prisma.behaviourAlert.create({
    data,
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Fetch full student details with parent links for notifications
  const studentWithParents = await prisma.student.findUnique({
    where: { id: data.studentId },
    include: {
      parentLinks: { include: { parent: true } },
      school: true,
    }
  });

  if (studentWithParents) {
    const schoolId = studentWithParents.schoolId || "default";

    // Notify Parents via Email
    for (const link of studentWithParents.parentLinks) {
      if (link.parent?.email) {
        await MailService.sendSchoolEmail({
          schoolId,
          to: link.parent.email,
          subject: `Behaviour Alert: ${studentWithParents.name}`,
          body: `<p>Dear ${link.parent.fullName},</p><p>A new behaviour alert (${data.type}) has been logged for your child, ${studentWithParents.name}.</p><p><strong>Alert:</strong> ${data.title}</p><p>Please review your child's profile on the school hub for more details.</p>`,
          type: "GENERAL_ALERT" as any,
        });
      }
    }

    // Notify School Admins on the dashboard
    await createNotification({
      recipientType: "SCHOOL",
      recipientId: schoolId,
      type: "GENERAL",
      title: `Behaviour Alert: ${studentWithParents.name}`,
      message: `A new behaviour alert (${data.type}) has been logged. Title: ${data.title}`,
      meta: { priority: data.type === "DANGER" ? "CRITICAL" : "HIGH" }
    });
  }

  return newAlert;
};

export const updateBehaviourAlertService = async (
  alertId: string,
  data: {
    type?: BehaviourType;
    title?: string;
    description?: string;
  }
) => {
  return await prisma.behaviourAlert.update({
    where: { id: alertId },
    data,
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteBehaviourAlertService = async (alertId: string) => {
  return await prisma.behaviourAlert.delete({
    where: { id: alertId },
  });
};
