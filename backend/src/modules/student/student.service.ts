import prisma from "../../config/database";
import { LinkEntityType, UserRole } from "@prisma/client";
import { createNotification } from "../notification/notification.service";

export const pickDepartmentService = async ({
  studentId,
  departmentId,
  currentUserId,
  currentUserType,
}: {
  studentId: string;
  departmentId: string;
  currentUserId: string;
  currentUserType: UserRole;
}) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classes: {
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Restriction: Students can only pick it ONCE
  if (currentUserType === UserRole.STUDENT && student.departmentId) {
    if (student.departmentId !== departmentId) {
      throw new Error("Department already set. Only schools can change it now.");
    }
    return student; // No change needed if same
  }

  // Validate department exists and belongs to school
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  if (student.schoolId && department.schoolId && department.schoolId !== student.schoolId) {
    throw new Error("Invalid department for this school");
  }

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: { departmentId },
    include: { 
      department: true,
      school: true,
      classes: {
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
        },
      },
      parentLinks: {
        where: { status: "active" },
      }
    },
  });

  // SIDE EFFECTS: Notifications
  console.log(`Triggering notifications for department update: Student ${updatedStudent.name}, Dept ${department.name}`);

  // 1. Notify the Student
  await createNotification({
    recipientType: "STUDENT",
    recipientId: updatedStudent.id,
    senderType: currentUserType as any,
    senderId: currentUserId,
    type: "GENERAL",
    title: "Department Updated",
    message: `Your department has been successfully updated to ${department.name}`,
    meta: { studentId: updatedStudent.id, departmentId },
  }).catch(err => console.error("Failed to notify student:", err));

  // 2. Notify Linked School (Admins)
  if (updatedStudent.schoolId) {
    const schoolAdmins = await prisma.schoolAdmin.findMany({
      where: { schoolId: updatedStudent.schoolId, active: true },
    });

    for (const admin of schoolAdmins) {
      if (admin.adminId === currentUserId) continue; // Don't notify the person who made the change
      
      await createNotification({
        recipientType: "ADMIN",
        recipientId: admin.adminId,
        senderType: currentUserType as any,
        senderId: currentUserId,
        type: "GENERAL",
        title: "Student Department Updated",
        message: `${updatedStudent.name}'s department was updated to ${department.name}`,
        meta: { studentId: updatedStudent.id, departmentId },
      }).catch(err => console.error(`Failed to notify admin ${admin.adminId}:`, err));
    }
  }

  // 3. Notify Parent
  for (const link of updatedStudent.parentLinks) {
    await createNotification({
      recipientType: "PARENT",
      recipientId: link.parentId,
      senderType: currentUserType as any,
      senderId: currentUserId,
      type: "GENERAL",
      title: "Child's Department Updated",
      message: `${updatedStudent.name}'s department has been updated to ${department.name}`,
      meta: { studentId: updatedStudent.id, departmentId },
    }).catch(err => console.error(`Failed to notify parent ${link.parentId}:`, err));
  }

  // 4. Notify Teachers
  const teacherIds = new Set<string>();
  updatedStudent.classes.forEach((c) => {
    if (c.class.teacherId) teacherIds.add(c.class.teacherId);
  });

  for (const teacherId of teacherIds) {
    await createNotification({
      recipientType: "TEACHER",
      recipientId: teacherId,
      senderType: currentUserType as any,
      senderId: currentUserId,
      type: "GENERAL",
      title: "Student Department Updated",
      message: `Student ${updatedStudent.name} in your class has updated their department to ${department.name}`,
      meta: { studentId: updatedStudent.id, departmentId },
    }).catch(err => console.error(`Failed to notify teacher ${teacherId}:`, err));
  }

  return updatedStudent;
};

export const getStudentProfileService = async (studentId: string) => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: true,
      school: true,
      classes: {
        include: {
          class: true,
        },
      },
      parentLinks: {
        include: {
          parent: true,
        },
      },
    },
  });
};
