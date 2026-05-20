import prisma from "../../config/database";
import { UpdateBehaviourProfileInput } from "./behaviourProfile.schema";
import { MailService } from "../notification/mail.service";
import { createNotification } from "../notification/notification.service";

export const getStudentBehaviourProfileService = async (studentId: string) => {
  let profile = await prisma.studentBehaviourProfile.findUnique({
    where: { studentId },
  });

  if (!profile) {
    // If it doesn't exist, create it with default values of 100 score and empty strengths
    profile = await prisma.studentBehaviourProfile.create({
      data: {
        studentId,
        conductScore: 100,
        strengths: [],
      },
    });
  }

  return profile;
};

export const upsertStudentBehaviourProfileService = async (
  studentId: string,
  data: UpdateBehaviourProfileInput
) => {
  const oldProfile = await prisma.studentBehaviourProfile.findUnique({
    where: { studentId },
  });

  const profile = await prisma.studentBehaviourProfile.upsert({
    where: { studentId },
    update: {
      ...(data.conductScore !== undefined ? { conductScore: data.conductScore } : {}),
      ...(data.strengths !== undefined ? { strengths: data.strengths as any } : {}),
    },
    create: {
      studentId,
      conductScore: data.conductScore ?? 100,
      strengths: (data.strengths as any) ?? [],
    },
  });

  const oldStrengths = (oldProfile?.strengths as any[]) || [];
  const newStrengths = (data.strengths as any[]) || [];

  if (newStrengths.length > oldStrengths.length) {
    // New strength added
    const studentWithParents = await prisma.student.findUnique({
      where: { id: studentId },
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
            subject: `New Core Strength: ${studentWithParents.name}`,
            body: `<p>Dear ${link.parent.fullName},</p><p>A new core strength has been added to your child's profile (${studentWithParents.name}).</p><p>Please log in to the school hub to view their updated behaviour profile.</p>`,
            type: "GENERAL_ALERT" as any,
          });
        }
      }

      // Notify School Admins on dashboard
      await createNotification({
        recipientType: "SCHOOL",
        recipientId: schoolId,
        type: "GENERAL",
        title: `Core Strength Added: ${studentWithParents.name}`,
        message: `A new core strength was added to ${studentWithParents.name}'s behaviour profile.`,
        meta: { priority: "NORMAL" }
      });
    }
  }

  return profile;
};
