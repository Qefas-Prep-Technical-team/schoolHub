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
              teachers: { include: { teacher: true } },
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
              teachers: { include: { teacher: true } },
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
    c.class.teachers.forEach((ct: any) => {
      if (ct.teacherId) teacherIds.add(ct.teacherId);
    });
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
      behaviourProfile: true,
      classes: {
        include: {
          class: {
            include: {
              subjects: true,
            },
          },
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

export const updateStudentProfileService = async (studentId: string, data: {
  name?: string;
  email?: string;
  gender?: any;
  dateOfBirth?: string | Date;
  profileImage?: string;
  bannerImage?: string;
}) => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.gender) updateData.gender = data.gender;
  if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
  if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
  if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage;

  return prisma.student.update({
    where: { id: studentId },
    data: updateData,
    include: {
      department: true,
      school: true,
      classes: {
        include: {
          class: true,
        },
      },
    },
  });
};

export const requestEmailUpdateService = async (studentId: string, newEmail: string) => {
  // Check if email is already taken
  const existingUser = await prisma.student.findUnique({ where: { email: newEmail } });
  if (existingUser) {
    throw new Error("This email is already registered with another account");
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // @ts-ignore - pendingEmail fields added to schema but prisma generate not run
  await prisma.student.update({
    where: { id: studentId },
    data: {
      pendingEmail: newEmail,
      emailVerificationCode: code,
      emailVerificationExpiry: expiry,
    },
  });

  return code;
};

export const verifyEmailUpdateService = async (studentId: string, code: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new Error("Student not found");
  
  const s = student as any;

  if (s.emailVerificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  if (new Date() > new Date(s.emailVerificationExpiry)) {
    throw new Error("Verification code has expired");
  }

  if (!s.pendingEmail) {
    throw new Error("No pending email update found");
  }

  return prisma.student.update({
    where: { id: studentId },
    data: {
      email: s.pendingEmail,
      // @ts-ignore - fields exist in schema
      pendingEmail: null,
      emailVerificationCode: null,
      emailVerificationExpiry: null,
    },
  });
};

export const getStudentAttendanceService = async (studentId: string, query?: { startDate?: string; endDate?: string }) => {
  const whereClause: any = { studentId };

  if (query?.startDate || query?.endDate) {
    whereClause.date = {};
    if (query.startDate) whereClause.date.gte = new Date(query.startDate);
    if (query.endDate) whereClause.date.lte = new Date(query.endDate);
  }

  return prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'asc' },
    include: {
      class: {
        select: { id: true, name: true }
      }
    }
  });
};

export const updateStudentAttendanceService = async (studentId: string, data: { date: string; status: string; note?: string }) => {
  // Find the student's primary class
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { classes: true }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const primaryClass = student.classes[0];
  if (!primaryClass) {
    throw new Error("Student is not assigned to any class. Cannot log attendance.");
  }

  const classId = primaryClass.classId;
  const attendanceDate = new Date(data.date);

  // Check if a record exists to use upsert properly with the unique constraint
  // The unique constraint is @@unique([classId, studentId, date])
  return prisma.attendance.upsert({
    where: {
      classId_studentId_date: {
        classId,
        studentId,
        date: attendanceDate,
      }
    },
    update: {
      status: data.status,
      note: data.note,
    },
    create: {
      classId,
      studentId,
      date: attendanceDate,
      status: data.status,
      note: data.note,
    }
  });
};
