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

  const deduction = data.type === 'DANGER' ? 10 : 5;
  const profile = await prisma.studentBehaviourProfile.findUnique({
    where: { studentId: data.studentId }
  });

  if (profile) {
    await prisma.studentBehaviourProfile.update({
      where: { studentId: data.studentId },
      data: { conductScore: Math.max(0, profile.conductScore - deduction) }
    });
  } else {
    await prisma.studentBehaviourProfile.create({
      data: {
        studentId: data.studentId,
        conductScore: Math.max(0, 100 - deduction)
      }
    });
  }


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

    // Notify Parents via Email and Live Notification
    for (const link of studentWithParents.parentLinks) {
      if (link.parent?.email) {
        const alertColor = data.type === 'DANGER' ? '#ef4444' : '#f59e0b';
        const emailTemplate = `
          <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: ${alertColor}; padding: 32px 24px; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Behaviour Alert</h2>
            </div>
            <div style="padding: 40px 32px;">
              <p style="color: #334155; font-size: 16px; margin: 0 0 24px 0;">Dear <strong>${link.parent.fullName || 'Parent'}</strong>,</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                A new <strong style="color: ${alertColor}; font-weight: 700;">${data.type}</strong> behaviour alert has been logged for your child, <strong style="color: #0f172a;">${studentWithParents.name}</strong>.
              </p>
              
              <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid ${alertColor}; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                <h3 style="color: #0f172a; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">${data.title}</h3>
                ${data.description ? `<p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">${data.description}</p>` : ''}
              </div>

              <p style="color: #475569; font-size: 15px; margin: 0 0 32px 0; line-height: 1.6;">
                Please log in to the School Hub to review this alert in detail and track your child's conduct history.
              </p>
              
              <div style="text-align: center;">
                <a href="https://qefashub.flexitistudio.com" style="display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">View Dashboard</a>
              </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0; font-weight: 500;">This is an automated notification from Qefas Hub.</p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 8px 0 0 0;">Please do not reply directly to this email.</p>
            </div>
          </div>
        `;

        await MailService.sendSchoolEmail({
          schoolId,
          to: link.parent.email,
          subject: `Important: Behaviour Alert for ${studentWithParents.name}`,
          body: emailTemplate,
          type: "GENERAL_ALERT" as any,
        });
      }

      await createNotification({
        recipientType: "PARENT",
        recipientId: link.parentId,
        type: "GENERAL",
        title: `Behaviour Alert for ${studentWithParents.name}`,
        message: `A new behaviour alert (${data.type}) has been logged: ${data.title}`,
        meta: { priority: data.type === "DANGER" ? "CRITICAL" : "HIGH" }
      }).catch(err => console.error(`Failed to notify parent ${link.parentId}:`, err));
    }

    // Live Notification for Student
    await createNotification({
      recipientType: "STUDENT",
      recipientId: studentWithParents.id,
      type: "GENERAL",
      title: `Behaviour Alert`,
      message: `A new behaviour alert (${data.type}) has been logged: ${data.title}`,
      meta: { priority: data.type === "DANGER" ? "CRITICAL" : "HIGH" }
    }).catch(err => console.error(`Failed to notify student ${studentWithParents.id}:`, err));

    // Live Notification for Class Teachers
    const alertClass = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { teachers: true }
    });

    if (alertClass) {
      for (const ct of alertClass.teachers) {
        await createNotification({
          recipientType: "TEACHER",
          recipientId: ct.teacherId,
          type: "GENERAL",
          title: `Behaviour Alert: ${studentWithParents.name}`,
          message: `A new behaviour alert (${data.type}) has been logged in your class (${alertClass.name}): ${data.title}`,
          meta: { priority: data.type === "DANGER" ? "CRITICAL" : "HIGH" }
        }).catch(err => console.error(`Failed to notify teacher ${ct.teacherId}:`, err));
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
  const originalAlert = await prisma.behaviourAlert.findUnique({ where: { id: alertId } });

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

  if (originalAlert && data.type && originalAlert.type !== data.type) {
    const profile = await prisma.studentBehaviourProfile.findUnique({ where: { studentId: updated.studentId } });
    if (profile) {
      const originalDeduction = originalAlert.type === 'DANGER' ? 10 : 5;
      const newDeduction = data.type === 'DANGER' ? 10 : 5;
      const diff = originalDeduction - newDeduction;
      
      await prisma.studentBehaviourProfile.update({
        where: { studentId: updated.studentId },
        data: { conductScore: Math.min(100, Math.max(0, profile.conductScore + diff)) }
      });
    }
  }
  
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
  const alert = await prisma.behaviourAlert.findUnique({ where: { id: alertId } });
  if (alert) {
    const profile = await prisma.studentBehaviourProfile.findUnique({ where: { studentId: alert.studentId } });
    if (profile) {
      const deduction = alert.type === 'DANGER' ? 10 : 5;
      await prisma.studentBehaviourProfile.update({
        where: { studentId: alert.studentId },
        data: { conductScore: Math.min(100, profile.conductScore + deduction) }
      });
    }
  }

  return await prisma.behaviourAlert.delete({
    where: { id: alertId },
  });
};
