import prisma from "../../config/database";
import { BehaviourType } from "@prisma/client";
import { MailService } from "../notification/mail.service";
import { createNotification } from "../notification/notification.service";

export const getClassBehaviourAlertsService = async (classId: string, studentId?: string) => {
  const alerts = await prisma.behaviourAlert.findMany({
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  if (alerts.length === 0) return [];

  const reporterIds = [...new Set(alerts.map(a => a.reportedById))];

  const admins = await prisma.admin.findMany({
    where: { id: { in: reporterIds } },
  });
  
  const teachers = await prisma.teacher.findMany({
    where: { id: { in: reporterIds } },
  });

  const reporterMap = new Map<string, string>();
  admins.forEach(a => reporterMap.set(a.id, (a as any).fullName || a.name || 'Admin'));
  teachers.forEach(t => reporterMap.set(t.id, (t as any).fullName || t.name || 'Teacher'));

  return alerts.map(alert => ({
    ...alert,
    reporter: { name: reporterMap.get(alert.reportedById) || 'Staff Member' }
  }));
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

  let reporterName = 'Staff Member';
  const admin: any = await prisma.admin.findUnique({ where: { id: data.reportedById } });
  if (admin) {
    reporterName = admin.fullName || admin.name || 'Admin';
  } else {
    const teacher: any = await prisma.teacher.findUnique({ where: { id: data.reportedById } });
    if (teacher) reporterName = teacher.fullName || teacher.name || 'Teacher';
  }

  return { ...newAlert, reporter: { name: reporterName } };
};

export const updateBehaviourAlertService = async (
  alertId: string,
  data: {
    type?: BehaviourType;
    title?: string;
    description?: string;
  }
) => {
  const updated = await prisma.behaviourAlert.update({
    where: { id: alertId },
    data,
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  let reporterName = 'Staff Member';
  const admin: any = await prisma.admin.findUnique({ where: { id: updated.reportedById } });
  if (admin) {
    reporterName = admin.fullName || admin.name || 'Admin';
  } else {
    const teacher: any = await prisma.teacher.findUnique({ where: { id: updated.reportedById } });
    if (teacher) reporterName = teacher.fullName || teacher.name || 'Teacher';
  }

  return { ...updated, reporter: { name: reporterName } };
};

export const deleteBehaviourAlertService = async (alertId: string) => {
  return await prisma.behaviourAlert.delete({
    where: { id: alertId },
  });
};
