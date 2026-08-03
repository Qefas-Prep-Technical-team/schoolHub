import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma, { withRetry } from "../../config/database";
import {
  generateUniqueCode,
  generateRandomSixDigit,
} from "../../utils/code-generator";
import {
  loginUser,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendSetupCompleteEmail,
  googleAuthService,
} from "./auth.service";
import { SchoolSubscriptionService } from "../subscription/school-subscription.service";
import { UserSubscriptionService } from "../subscription/user-subscription.service";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "@services/authService";
import jwt from "jsonwebtoken";
import { AdminRole, UserRole, PlanScope } from "@prisma/client";
import { getIO } from "../../socket";
import { createNotification } from "../notification/notification.service";
import UAParser from "ua-parser-js";
import {
  enforceStudentLimit,
  enforceTeacherLimit,
} from "../subscription/quota.helpers";
import { handleError } from "../../utils/error-handler";

// Simple slugify helper (no extra package)
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphen
    .replace(/-+/g, "-"); // collapse multiple hyphens

export const registerSchool = async (req: Request, res: Response) => {
  try {
    const { schoolName, adminName, email, password, subdomain } = req.body;

    if (!schoolName || !adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const rawSubdomain = subdomain?.trim() || schoolName;
    const normalizedSubdomain = slugify(rawSubdomain);

    if (!normalizedSubdomain) {
      return res.status(400).json({
        success: false,
        message: "Invalid subdomain or school name",
      });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingSchool = await prisma.school.findFirst({
      where: { subdomain: normalizedSubdomain },
      select: { id: true },
    });

    if (existingSchool) {
      return res.status(409).json({
        success: false,
        message: "Subdomain already taken. Please choose another.",
      });
    }

    const generateSixDigit = () =>
      Math.floor(100000 + Math.random() * 900000).toString();

    let tenantId: string | undefined;

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = "sch-" + generateSixDigit();
      const exists = await prisma.school.findFirst({
        where: { tenantId: candidate },
        select: { id: true },
      });

      if (!exists) {
        tenantId = candidate;
        break;
      }
    }

    if (!tenantId) {
      return res.status(500).json({
        success: false,
        message: "Could not generate unique tenantId, try again",
      });
    }

    const schoolCode = await generateUniqueCode(prisma, "school", schoolName);
    const adminCode = await generateUniqueCode(prisma, "admin", adminName);

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Fetch the default school FREE plan to share between school and admin
        const envPlanId = process.env.SCHOOL_FREE_PLAN;
        const freePlan = envPlanId
          ? await tx.subscriptionPlan.findUnique({ where: { id: envPlanId } })
          : await tx.subscriptionPlan.findFirst({
              where: {
                planScope: PlanScope.SCHOOL,
                type: "free",
                category: "schools",
              },
            });

        if (!freePlan) {
          throw new Error(
            envPlanId
              ? `Default school plan with ID ${envPlanId} (from SCHOOL_FREE_PLAN) not found.`
              : "Default FREE school plan not found in database.",
          );
        }

        // 2. Create the school record
        const school = await tx.school.create({
          data: {
            name: schoolName,
            subdomain: normalizedSubdomain,
            schoolEmail: email,
            tenantId,
            schoolCode,
          },
        });

        // 3. Create the school profile (settings)
        await tx.schoolSetting.create({
          data: {
            schoolId: school.id,
          },
        });

        // 4. Create the admin user
        const admin = await tx.admin.create({
          data: {
            name: adminName,
            email,
            password: hashedPassword,
            role: UserRole.ADMIN,
            adminCode,
            tenantId,
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });

        // 5. Link admin to school as owner
        await tx.schoolAdmin.create({
          data: {
            schoolId: school.id,
            adminId: admin.id,
            role: AdminRole.SCHOOL_OWNER,
          },
        });

        // 6. Subscription initialization is now deferred to the frontend /select-plan step
        // where the admin can choose between the FREE plan or a PAID plan.
        // await SchoolSubscriptionService.initializeFreePlan(school.id, tx, freePlan.id);
        // await UserSubscriptionService.initializeFreePlan(admin.id, UserRole.ADMIN, tx, freePlan.id);

        return { school, admin };
      },
      {
        timeout: 20000, // 20 seconds to handle multi-step registration
      },
    );

    return res.status(201).json({
      success: true,
      message: "School and admin registered successfully",
      data: {
        school: {
          name: result.school.name,
          tenantId: result.school.tenantId,
          subdomain: result.school.subdomain,
          schoolCode: result.school.schoolCode,
        },
        admin: {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
          role: result.admin.role,
          adminCode: result.admin.adminCode,
        },
        userRole: result.admin.role,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.registerSchool");
  }
};

export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      schoolCode,
      studentCode,
      classCode,
      isIndependent,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, and Password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let schoolToConnect = null;
    let studentToConnect = null;

    if (schoolCode && !isIndependent) {
      schoolToConnect = await prisma.school.findFirst({
        where: { schoolCode },
      });

      if (!schoolToConnect) {
        return res.status(404).json({
          success: false,
          message: "Invalid School Code. School not found",
        });
      }

      await enforceTeacherLimit(schoolToConnect.id);
    }

    if (studentCode) {
      studentToConnect = await prisma.student.findFirst({
        where: { studentCode: studentCode.trim() },
      });

      if (!studentToConnect) {
        return res.status(404).json({
          success: false,
          message: "Invalid Student Code. Student not found",
        });
      }
    }

    let classToConnect = null;
    if (classCode) {
      classToConnect = await prisma.class.findFirst({
        where: { classCode },
      });

      if (!classToConnect) {
        return res.status(404).json({
          success: false,
          message: "Invalid Class Code. Class not found",
        });
      }
    }

    const teacherCode = await generateUniqueCode(prisma, "teacher", fullName);
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(
      async (tx) => {
        const teacher = await tx.teacher.create({
          data: {
            name: fullName,
            email,
            password: hashedPassword,
            role: UserRole.TEACHER,
            tenantId: schoolToConnect
              ? schoolToConnect.tenantId
              : "default-tenant-id",
            teacherCode,
            isClaimed: true,
            primarySchoolId: schoolToConnect ? schoolToConnect.id : null,
            activeSchoolId: schoolToConnect ? schoolToConnect.id : null,
            isIndependent: !!isIndependent,
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });

        await UserSubscriptionService.initializeFreePlan(
          teacher.id,
          UserRole.TEACHER,
          tx,
        );

        if (schoolToConnect) {
          await tx.linkRequest.create({
            data: {
              linkType: "SCHOOL_TEACHER",
              requesterType: "TEACHER",
              requesterId: teacher.id,
              requesterTeacherId: teacher.id,
              requesterCode: teacher.teacherCode,
              targetType: "SCHOOL",
              targetId: schoolToConnect.id,
              targetSchoolId: schoolToConnect.id,
              schoolId: schoolToConnect.id,
              targetCode: schoolToConnect.schoolCode,
              status: "PENDING",
              note: "i would like to connect with you",
            },
          });
        }

        if (studentToConnect) {
          await tx.linkRequest.create({
            data: {
              linkType: "TEACHER_STUDENT",
              requesterType: "TEACHER",
              requesterId: teacher.id,
              requesterTeacherId: teacher.id,
              requesterCode: teacher.teacherCode,
              targetType: "STUDENT",
              targetId: studentToConnect.id,
              targetStudentId: studentToConnect.id,
              targetCode: studentToConnect.studentCode,
              status: "PENDING",
              note: "I would like to connect with you",
              schoolId: studentToConnect.schoolId,
            },
          });
        }

        if (classToConnect) {
          await tx.linkRequest.create({
            data: {
              linkType: "TEACHER_CLASS",
              requesterType: "TEACHER",
              requesterId: teacher.id,
              requesterTeacherId: teacher.id,
              requesterCode: teacher.teacherCode,
              targetType: "CLASS",
              targetId: classToConnect.id,
              classId: classToConnect.id,
              targetCode: classToConnect.classCode,
              status: "PENDING",
              note: "I would like to join this class",
              schoolId: classToConnect.schoolId,
            },
          });
        }

        return { teacher, studentToConnect, classToConnect };
      },
      { timeout: 20000 },
    );

    if (schoolToConnect) {
      getIO().to(`user:${schoolToConnect.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A new teacher has requested to connect",
      });

      await createNotification({
        recipientType: "SCHOOL",
        recipientId: schoolToConnect.id,
        senderType: "TEACHER",
        senderId: result.teacher.id,
        type: "LINK_REQUEST",
        title: "New Teacher Join Request",
        message: `${fullName} has requested to join your school as a teacher.`,
        meta: { teacherId: result.teacher.id, schoolCode },
      });
    }

    if (result.studentToConnect) {
      getIO().to(`user:${result.studentToConnect.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A teacher has requested to connect with you",
      });

      await createNotification({
        recipientType: "STUDENT",
        recipientId: result.studentToConnect.id,
        senderType: "TEACHER",
        senderId: result.teacher.id,
        type: "LINK_REQUEST",
        title: "Teacher Connection Request",
        message: `Teacher ${fullName} has requested to connect with you.`,
        meta: { teacherId: result.teacher.id, studentCode },
      });
    }

    if (classToConnect && classToConnect.schoolId) {
      getIO()
        .to(`user:${classToConnect.schoolId}`)
        .emit("link:updated", {
          type: "LINK_REQUEST_RECEIVED",
          message: `A new teacher has requested to join class ${classToConnect.name}`,
        });

      await createNotification({
        recipientType: "SCHOOL",
        recipientId: classToConnect.schoolId,
        senderType: "TEACHER",
        senderId: result.teacher.id,
        type: "LINK_REQUEST",
        title: "Class Join Request",
        message: `Teacher ${fullName} has requested to join class ${classToConnect.name}`,
        meta: { teacherId: result.teacher.id, classCode },
      });
    }

    // Always notify the teacher himself
    await createNotification({
      recipientType: "TEACHER",
      recipientId: result.teacher.id,
      type: "GENERAL",
      title: "Registration Successful",
      message: schoolToConnect
        ? `Your registration is complete and your request to join ${schoolToConnect.name} has been sent.`
        : "Your teacher registration was successful.",
    });

    return res.status(201).json({
      success: true,
      message: result.studentToConnect
        ? `Teacher registered and link requests sent to school and student ${result.studentToConnect.studentCode}`
        : schoolToConnect
          ? "Teacher registered and connection request sent successfully"
          : "Independent teacher account created successfully",
      data: {
        teacher: {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          role: result.teacher.role,
          tenantId: result.teacher.tenantId,
          teacherCode: result.teacher.teacherCode,
        },
        userRole: result.teacher.role,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.registerTeacher");
  }
};

interface RegisterStudentBody {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  schoolCode?: string;
  teacherCode?: string;
  parentCode?: string;
  classCode?: string;
}

const generateStudentCode = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `stu-${random}`;
};

const ensureUniqueStudentCode = async (): Promise<string> => {
  let studentCode = generateStudentCode();
  let attempts = 0;
  const maxAttempts = 10;

  let existingStudent = await prisma.student.findFirst({
    where: { studentCode },
  });

  while (existingStudent && attempts < maxAttempts) {
    studentCode = generateStudentCode();
    existingStudent = await prisma.student.findFirst({
      where: { studentCode },
    });
    attempts++;
  }

  if (existingStudent) {
    throw new Error("Could not generate unique student code");
  }

  return studentCode;
};

export const registerStudent = async (
  req: Request<{}, {}, RegisterStudentBody>,
  res: Response,
) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      schoolCode,
      teacherCode,
      parentCode,
      classCode,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields including confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if email exists
    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Generate unique student code
    const studentCode = await generateUniqueCode(prisma, "student", fullName);

    // Verify provided codes exist before proceeding
    let school = null;
    if (schoolCode) {
      school = await prisma.school.findFirst({
        where: { schoolCode },
      });
      if (!school) {
        return res.status(404).json({
          success: false,
          message: `School with code ${schoolCode} not found`,
        });
      }
    }

    let teacher = null;
    if (teacherCode) {
      teacher = await prisma.teacher.findFirst({
        where: { teacherCode },
      });
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: `Teacher with code ${teacherCode} not found`,
        });
      }
    }

    let parent = null;
    if (parentCode) {
      parent = await prisma.parent.findFirst({
        where: { parentCode },
      });
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: `Parent with code ${parentCode} not found`,
        });
      }
    }

    let classToConnect = null;
    if (classCode) {
      classToConnect = await prisma.class.findFirst({
        where: { classCode },
      });
      if (!classToConnect) {
        return res.status(404).json({
          success: false,
          message: `Class with code ${classCode} not found`,
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enforce quota if registering to a school
    if (school) {
      await enforceStudentLimit(school.id);
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Create student
        const student = await tx.student.create({
          data: {
            name: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            studentCode,
            role: UserRole.STUDENT,
            tenantId: school ? school.tenantId : "default-tenant-id",
            schoolId: school ? school.id : null,
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });

        await UserSubscriptionService.initializeFreePlan(
          student.id,
          UserRole.STUDENT,
          tx,
        );

        const note = "i would like to connect with you";

        // Auto-linking for School
        if (school) {
          await tx.linkRequest.create({
            data: {
              linkType: "SCHOOL_STUDENT",
              requesterType: "STUDENT",
              requesterId: student.id,
              requesterStudentId: student.id,
              requesterCode: student.studentCode,
              targetType: "SCHOOL",
              targetId: school.id,
              targetSchoolId: school.id,
              schoolId: school.id,
              targetCode: school.schoolCode,
              status: "PENDING",
              note,
            },
          });
        }

        // Auto-linking for Teacher
        if (teacher) {
          await tx.linkRequest.create({
            data: {
              linkType: "TEACHER_STUDENT",
              requesterType: "STUDENT",
              requesterId: student.id,
              requesterStudentId: student.id,
              requesterCode: student.studentCode,
              targetType: "TEACHER",
              targetId: teacher.id,
              targetTeacherId: teacher.id,
              targetCode: teacher.teacherCode,
              status: "PENDING",
              note,
            },
          });
        }

        // Auto-linking for Parent
        if (parent) {
          await tx.linkRequest.create({
            data: {
              linkType: "PARENT_STUDENT",
              requesterType: "STUDENT",
              requesterId: student.id,
              requesterStudentId: student.id,
              requesterCode: student.studentCode,
              targetType: "PARENT",
              targetId: parent.id,
              targetParentId: parent.id,
              targetCode: parent.parentCode,
              status: "PENDING",
              note,
            },
          });
        }

        // Auto-linking for Class
        if (classToConnect) {
          await tx.linkRequest.create({
            data: {
              linkType: "STUDENT_CLASS",
              requesterType: "STUDENT",
              requesterId: student.id,
              requesterStudentId: student.id,
              requesterCode: student.studentCode,
              targetType: "CLASS",
              targetId: classToConnect.id,
              classId: classToConnect.id,
              targetCode: classToConnect.classCode,
              status: "PENDING",
              note,
              schoolId: classToConnect.schoolId,
            },
          });
        }

        return student;
      },
      { timeout: 20000 },
    );

    const io = getIO();
    if (school) {
      io.to(`user:${school.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A new student has requested to connect",
      });

      try {
        await createNotification({
          recipientType: "SCHOOL",
          recipientId: school.id,
          senderType: "STUDENT",
          senderId: result.id,
          type: "LINK_REQUEST",
          title: "New Student Join Request",
          message: `${fullName} has requested to join your school.`,
          meta: { studentId: result.id, schoolCode },
        });
      } catch (notifError) {
        console.error("Failed to create school notification:", notifError);
      }
    }
    if (teacher) {
      io.to(`user:${teacher.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A student has requested to connect with you",
      });

      try {
        await createNotification({
          recipientType: "TEACHER",
          recipientId: teacher.id,
          senderType: "STUDENT",
          senderId: result.id,
          type: "LINK_REQUEST",
          title: "Student Connection Request",
          message: `Student ${fullName} has requested to connect with you.`,
          meta: { studentId: result.id, teacherCode },
        });
      } catch (notifError) {
        console.error("Failed to create teacher notification:", notifError);
      }
    }
    if (parent) {
      io.to(`user:${parent.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "Your child has registered and requested a link",
      });

      try {
        await createNotification({
          recipientType: "PARENT",
          recipientId: parent.id,
          senderType: "STUDENT",
          senderId: result.id,
          type: "LINK_REQUEST",
          title: "Child Connection Request",
          message: `Your child ${fullName} has registered and requested a connection.`,
          meta: { studentId: result.id, parentCode },
        });
      } catch (notifError) {
        console.error("Failed to create parent notification:", notifError);
      }
    }
    if (classToConnect && classToConnect.schoolId) {
      io.to(`user:${classToConnect.schoolId}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: `A new student has requested to join class ${classToConnect.name}`,
      });

      try {
        await createNotification({
          recipientType: "SCHOOL",
          recipientId: classToConnect.schoolId,
          senderType: "STUDENT",
          senderId: result.id,
          type: "LINK_REQUEST",
          title: "Class Join Request",
          message: `Student ${fullName} has requested to join class ${classToConnect.name}`,
          meta: { studentId: result.id, classCode },
        });
      } catch (notifError) {
        console.error("Failed to create class notification:", notifError);
      }
    }

    // Always notify the student himself
    await createNotification({
      recipientType: "STUDENT",
      recipientId: result.id,
      type: "GENERAL",
      title: "Registration Successful",
      message: school
        ? `Your registration is complete and your request to join ${school.name} has been sent.`
        : "Your student registration was successful.",
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully and link requests sent",
      data: {
        student: {
          id: result.id,
          name: result.name,
          email: result.email,
          role: result.role,
          studentCode: result.studentCode,
        },
        userRole: result.role,
        message:
          "Your registration is complete. We've sent connection requests to the specified school/teacher/parent.",
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.registerStudent");
  }
};

interface RegisterParentBody {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentCode?: string;
}

export const registerParent = async (
  req: Request<{}, {}, RegisterParentBody>,
  res: Response,
) => {
  try {
    const { fullName, email, password, confirmPassword, studentCode } =
      req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingParent = await prisma.parent.findUnique({
      where: { email },
    });

    if (existingParent) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const parentCode = await generateUniqueCode(prisma, "parent", fullName);

    const result = await prisma.$transaction(
      async (tx: any) => {
        const parent = await tx.parent.create({
          data: {
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: UserRole.PARENT,
            parentCode,
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });

        await UserSubscriptionService.initializeFreePlan(
          parent.id,
          UserRole.PARENT,
          tx,
        );

        let linkResult = null;
        let studentData = null;

        if (studentCode) {
          const student = await tx.student.findFirst({
            where: { studentCode: studentCode.trim() },
          });

          if (!student) {
            throw new Error("Invalid student code");
          }

          const existingLink = await tx.parentChildLink.findFirst({
            where: {
              parentId: parent.id,
              studentId: student.id,
            },
          });

          if (existingLink) {
            throw new Error("Link already exists");
          }

          linkResult = await tx.parentChildLink.create({
            data: {
              parentId: parent.id,
              studentId: student.id,
              studentCode: student.studentCode,
              status: "pending",
            },
          });

          // Also create a standard LinkRequest for the linking hub
          await tx.linkRequest.create({
            data: {
              linkType: "PARENT_STUDENT",
              requesterType: "PARENT",
              requesterId: parent.id,
              requesterParentId: parent.id,
              requesterCode: parent.parentCode,
              targetType: "STUDENT",
              targetId: student.id,
              targetStudentId: student.id,
              targetCode: student.studentCode,
              status: "PENDING",
              note: "I have registered as your parent",
            },
          });

          studentData = student;
        }

        return { parent, link: linkResult, studentData };
      },
      { timeout: 20000 },
    );

    if (result.studentData) {
      getIO().to(`user:${result.studentData.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message:
          "A parent has registered and requested to link with your account",
      });
    }

    const response: any = {
      success: true,
      message: result.studentData
        ? `Parent account created and link request sent to student ${result.studentData.studentCode}`
        : "Parent account created successfully",
      data: {
        parent: {
          id: result.parent.id,
          fullName: result.parent.fullName,
          email: result.parent.email,
          role: result.parent.role,
          parentCode: result.parent.parentCode,
        },
        userRole: result.parent.role,
      },
    };

    if (result.link) {
      response.data.linking = {
        status: "pending",
        message: "Link request sent successfully",
      };
    } else {
      response.data.linking = {
        message:
          "You can link to your child's account later using their student code.",
      };
    }

    return res.status(201).json(response);
  } catch (error: any) {
    return handleError(res, error, "auth.registerParent");
  }
};

export const requestVerificationCode = async (req: Request, res: Response) => {
  try {
    const { userType } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email and user type are required",
      });
    }

    // Normalize userType casing
    const normalizedRole = (userType as string)
      ?.toUpperCase()
      .trim() as UserRole;

    // Validate userType using UserRole enum
    if (!Object.values(UserRole).includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    // Delete old unused codes for same email and userType
    await prisma.verificationCode.deleteMany({
      where: { email, userType: normalizedRole, used: false },
    });

    const code = generateRandomSixDigit();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save code WITH userType
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        userType: normalizedRole,
        expiresAt,
      },
    });
    const testEmail = process.env.TEST_EMAIL;
    console.log(testEmail, "test email");
    const resendTest = process.env.RESEND_TEST === "true" || false; // default to false if not set
    const mainEmail = resendTest ? testEmail : email;

    // Detect if user exists to customize email content
    // Sequential check to avoid hitting connection limits (P1001)
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });
    const teacher = !admin
      ? await prisma.teacher.findUnique({
          where: { email },
          select: { id: true },
        })
      : null;
    const student =
      !admin && !teacher
        ? await prisma.student.findUnique({
            where: { email },
            select: { id: true },
          })
        : null;
    const parent =
      !admin && !teacher && !student
        ? await prisma.parent.findUnique({
            where: { email },
            select: { id: true },
          })
        : null;

    const userExists = !!(admin || teacher || student || parent);
    const emailType = userExists ? "confirmation" : "welcome";

    // Send email via Resend
    const result = await sendVerificationEmail(mainEmail, code, emailType);
    if (result.error) {
      // This will print the specific reason (e.g., "Missing required field", "Unauthorized")
      console.log("RESEND ERROR:", result.error);
    } else {
      console.log("RESEND SUCCESS:", result.data);
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to email",
    });
  } catch (error) {
    return handleError(res, error, "auth.requestVerificationCode");
  }
};

// controllers/auth.controller.ts - Single verifyEmailCode function
// export const verifyEmailCode = async (req: Request, res: Response) => {
//   try {
//     const { email, code, userType } = req.body;

//     if (!email || !code || !userType) {
//       return res.status(400).json({
//         success: false,
//         message: "Email, code and user type are required",
//       });
//     }

//     // Validate userType
//     if (!Object.values(UserRole).includes(userType as UserRole)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user type",
//       });
//     }

//     // Find the unused code WITH userType
//     const found = await prisma.verificationCode.findFirst({
//       where: {
//         email,
//         code,
//         userType: userType as UserRole,
//         used: false,
//       },
//     });

//     if (!found) {
//       return res.status(400).json({ success: false, message: "Invalid code" });
//     }

//     if (found.expiresAt < new Date()) {
//       return res.status(400).json({ success: false, message: "Code expired" });
//     }

//     // Mark code as used
//     await prisma.verificationCode.update({
//       where: { id: found.id },
//       data: { used: true },
//     });

//     // Handle all user types in one function
//     let user: any;
//     let isSchoolOwner = false;

//     switch (userType) {
//       case UserRole.ADMIN:
//         user = await prisma.admin.findUnique({
//           where: { email },
//           include: {
//             schoolAdmins: {
//               include: {
//                 school: true,
//               },
//             },
//           },
//         });

//         if (!user) {
//           return res.status(404).json({
//             success: false,
//             message: "Admin not found",
//           });
//         }

//         // Check if this admin is a SCHOOL_OWNER
//         isSchoolOwner = user.schoolAdmins.some(
//           (sa: { role: string }) => sa.role === AdminRole.SCHOOL_OWNER
//         );

//         // Update admin - auto-approve school owners
//         user = await prisma.admin.update({
//           where: { email },
//           data: {
//             verified: true,
//             status: isSchoolOwner ? "APPROVED" : "PENDING",
//           },
//           include: {
//             schoolAdmins: {
//               include: {
//                 school: true,
//               },
//             },
//           },
//         });
//         break;

//       case UserRole.TEACHER:
//         user = await prisma.teacher.findUnique({
//           where: { email },
//           include: {
//             school: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         });

//         if (!user) {
//           return res.status(404).json({
//             success: false,
//             message: "Teacher not found",
//           });
//         }

//         user = await prisma.teacher.update({
//           where: { email },
//           data: { verified: true },
//         });
//         break;

//       case UserRole.STUDENT:
//         user = await prisma.student.findUnique({
//           where: { email },
//           include: {
//             school: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         });

//         if (!user) {
//           return res.status(404).json({
//             success: false,
//             message: "Student not found",
//           });
//         }

//         user = await prisma.student.update({
//           where: { email },
//           data: { verified: true },
//         });
//         break;

//       case UserRole.PARENT:
//         user = await prisma.parent.findUnique({
//           where: { email },
//           include: {
//             children: {
//               include: {
//                 student: {
//                   select: {
//                     id: true,
//                     name: true,
//                     studentCode: true,
//                   },
//                 },
//               },
//             },
//           },
//         });

//         if (!user) {
//           return res.status(404).json({
//             success: false,
//             message: "Parent not found",
//           });
//         }

//         user = await prisma.parent.update({
//           where: { email },
//           data: { verified: true },
//         });
//         break;

//       default:
//         return res.status(400).json({
//           success: false,
//           message: "Invalid user type",
//         });
//     }

//     // Prepare response based on user type
//     let message = "";
//     let responseData: any = {};

//     switch (userType) {
//       case UserRole.ADMIN:
//         message = isSchoolOwner
//           ? "School owner email verified and account approved successfully! You can now access your dashboard."
//           : "Admin email verified successfully! Waiting for approval from school owner.";

//         responseData = {
//           admin: {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             status: user.status,
//             verified: user.verified,
//             isSchoolOwner: isSchoolOwner,
//           },
//           schools: user.schoolAdmins.map((sa: any) => ({
//             schoolId: sa.school.id,
//             schoolName: sa.school.name,
//             adminRole: sa.role,
//           })),
//         };
//         break;

//       case UserRole.TEACHER:
//         message = "Teacher email verified successfully! You can now log in.";
//         responseData = {
//           teacher: {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             verified: user.verified,
//             teacherCode: user.teacherCode,
//             school: user.school,
//           },
//         };
//         break;

//       case UserRole.STUDENT:
//         message = "Student email verified successfully! You can now log in.";
//         responseData = {
//           student: {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             verified: user.verified,
//             studentCode: user.studentCode,
//             school: user.school,
//           },
//         };
//         break;

//       case UserRole.PARENT:
//         message = "Parent email verified successfully! You can now log in.";
//         responseData = {
//           parent: {
//             id: user.id,
//             fullName: user.fullName,
//             email: user.email,
//             verified: user.verified,
//           },
//           children: user.children.map((child: any) => ({
//             studentId: child.student.id,
//             studentName: child.student.name,
//             studentCode: child.student.studentCode,
//             linkStatus: child.status,
//           })),
//         };
//         break;
//     }

//     return res.status(200).json({
//       success: true,
//       message,
//       userRole: userType,
//       data: responseData,
//     });
//   } catch (error) {
//     console.error("Error verifying code:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// ====================================
// login
// =======================================

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password, userType } = req.body;

//     if (!email || !password || !userType) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password  required",
//       });
//     }

//     // Validate userType
//     if (!Object.values(UserRole).includes(userType as UserRole)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user type",
//       });
//     }

//     let user: any;
//     switch (userType) {
//       case UserRole.ADMIN:
//         user = await prisma.admin.findUnique({ where: { email } });
//         break;
//       case UserRole.TEACHER:
//         user = await prisma.teacher.findUnique({ where: { email } });
//         break;
//       case UserRole.STUDENT:
//         user = await prisma.student.findUnique({ where: { email } });
//         break;
//       case UserRole.PARENT:
//         user = await prisma.parent.findUnique({ where: { email } });
//         break;
//       default:
//         return res.status(400).json({
//           success: false,
//           message: "email or password incorrect",
//         });
//     }

//     if (!user)
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });

//     if (!user.verified)
//       return res.status(403).json({
//         success: false,
//         message: "Email not verified",
//       });

//     const validPassword = await comparePassword(password, user.password);
//     if (!validPassword)
//       return res.status(404).json({
//         success: false,
//         message: "password incorrect",
//       });

//     const accessToken = generateAccessToken(user.id, userType);
//     const refreshToken = await generateRefreshToken(user.id, userType);

//     res.cookie("token", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Logged in successfully",
//       data: {
//         accessToken,
//         user: {
//           id: user.id,
//           email: user.email,
//           name: user.name || user.fullName,
//           role: user.role, // RETURN ROLE
//         },
//         userRole: user.role, // ADDED: Explicit role for redirection
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// =========================
// LOGIN
// =========================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, userType, preAuthToken } = req.body;

    if (!email || (!password && !preAuthToken) || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and user type are required",
      });
    }

    const normalizedUserType = (userType as string).toUpperCase().trim();

    if (!Object.values(UserRole).includes(normalizedUserType as UserRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    let user: any;
    let actualRole: UserRole = normalizedUserType as UserRole;

    const fetchUserWithRelations = async (role: UserRole, email: string) => {
      console.log(`Fetching user for role: ${role}, email: [${email}]`);
      switch (role) {
        case UserRole.ADMIN:
          return await prisma.admin.findUnique({
            where: { email },
            include: { schoolAdmins: { include: { school: true } } },
          });
        case UserRole.TEACHER: {
          const teacher = await prisma.teacher.findUnique({
            where: { email },
            include: {
              school: true,
              currentSchool: true,
              primarySchool: true,
            },
          });
          if (teacher) {
            console.log(
              `Found teacher for email: [${email}]. Normalizing school reference.`,
            );
            // Normalize school for compatibility with existing code
            (teacher as any).school =
              teacher.currentSchool ||
              teacher.primarySchool ||
              (teacher as any).school;
          } else {
            console.warn(`Teacher NOT found for email: [${email}]`);
          }
          return teacher;
        }
        case UserRole.STUDENT:
          return await prisma.student.findUnique({
            where: { email },
            include: { school: true },
          });
        case UserRole.PARENT:
          return await prisma.parent.findUnique({
            where: { email },
            include: {
              children: {
                include: {
                  student: true,
                },
              },
            },
          });
        default:
          return null;
      }
    };

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try fetching based on provided type
    user = await withRetry(
      () => fetchUserWithRelations(userType as UserRole, normalizedEmail),
      `auth.login.fetchUser[${userType}]`
    );

    if (!user) {
      console.error(
        `CRITICAL: Login failed. User NOT FOUND with role [${userType}] for email: [${normalizedEmail}]`,
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ success: false, message: "Email not verified" });
    }

    if (preAuthToken) {
      try {
        const payload = jwt.verify(preAuthToken, process.env.JWT_SECRET || "default_secret") as any;
        if (payload.userId !== user.id) {
          return res.status(401).json({ success: false, message: "Invalid preAuth token mismatch" });
        }
      } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired preAuth token" });
      }
    } else {
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
    }

    // Check if it's a student or teacher and if isClaimed is false
    if ((actualRole === UserRole.STUDENT || actualRole === UserRole.TEACHER) && user.isClaimed === false) {
      console.log(`Setting isClaimed to true for ${actualRole} user ${user.id}`);
      if (actualRole === UserRole.STUDENT) {
        await prisma.student.update({ where: { id: user.id }, data: { isClaimed: true } });
      } else if (actualRole === UserRole.TEACHER) {
        await prisma.teacher.update({ where: { id: user.id }, data: { isClaimed: true } });
      }
      user.isClaimed = true;
    }

    // ===== Set defaultTenantId if missing =====
    // Removed obsolete multi-tenant array fixing logic

    // ========================================

    // IMPORTANT: Generate token with ACTUAL role, not the one from the portal
    console.log("DEBUG: Generating tokens for user", user.id);
    const accessToken = generateAccessToken(user.id, actualRole);
    console.log("DEBUG: Access token generated");

    // Extract device information for tracking
    const userAgent = req.headers["user-agent"] || "";
    const UAParserClass = UAParser as any;
    const parser = new UAParserClass(userAgent);
    const result = parser.getResult();
    
    const deviceInfo = {
      deviceType: (req.headers["x-device-type"] as string) || result.device.type || "desktop",
      deviceModel: (req.headers["x-device-model"] as string) || result.device.model || result.browser.name || "Unknown Browser",
      osVersion: (req.headers["x-os-version"] as string) || (result.os.name ? `${result.os.name} ${result.os.version || ""}`.trim() : "Unknown OS"),
      ipAddress: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim() || "Unknown IP"
    };

    // Device Verification Check
    const isDeviceVerified = req.cookies?.deviceVerified === "true" || !!preAuthToken;
    if (!isDeviceVerified) {
      const validDevice = await prisma.refreshToken.findFirst({
        where: {
          userId: user.id,
          deviceModel: deviceInfo.deviceModel,
          isValid: true,
        },
      });

      if (!validDevice) {
        const generatedPreAuthToken = jwt.sign(
          { userId: user.id, userType: actualRole },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "15m" }
        );
        return res.status(403).json({
          success: false,
          message: "Unrecognized or revoked device detected. Verification required.",
          requiresVerification: true,
          preAuthToken: generatedPreAuthToken,
        });
      }
    }

    // Check if this device has ever been used by this user before
    const existingDeviceCount = await prisma.refreshToken.count({
      where: {
        userId: user.id,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
      },
    });

    if (existingDeviceCount === 0) {
      await createNotification({
        recipientType: actualRole as any,
        recipientId: user.id,
        type: "GENERAL",
        title: "New Device Login Detected",
        message: `We detected a new login to your account from a ${deviceInfo.deviceModel} on ${deviceInfo.osVersion}. If this wasn't you, please secure your account immediately by changing your password.`,
      });
    }

    const refreshToken = await generateRefreshToken(user.id, actualRole, deviceInfo);
    console.log("DEBUG: Refresh token generated and stored");

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ===== Build response data =====
    let responseData: any = {};
    let message = "Logged in successfully";

    if (actualRole === UserRole.ADMIN) {
      const schools = user.schoolAdmins.map((sa: any) => ({
        schoolId: sa.school?.id,
        schoolName: sa.school?.name,
        schoolCode: sa.school?.schoolCode,
        adminRole: sa.role,
        approved:
          sa.role === AdminRole.SCHOOL_OWNER || user.status === "APPROVED",
      }));
      const primarySchool = user.schoolAdmins[0]?.school || null;

      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminCode: user.adminCode,
          schoolCode: primarySchool?.schoolCode || null,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          schools,
          plan: primarySchool?.plan || user.plan,
          trialUsed: primarySchool?.trialUsed ?? user.trialUsed,
        },
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    } else if (actualRole === UserRole.TEACHER) {
      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teacherCode: user.teacherCode,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          school: user.school,
          plan: user.plan,
          trialUsed: user.trialUsed,
        },
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    } else if (actualRole === UserRole.STUDENT) {
      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentCode: user.studentCode,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          school: user.school,
          plan: user.plan,
          trialUsed: user.trialUsed,
        },
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    } else if (actualRole === UserRole.PARENT) {
      responseData = {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          parentCode: user.parentCode,
          plan: user.plan,
          trialUsed: user.trialUsed,
        },
        children: user.children?.map((child: any) => ({
          studentId: child.student.id,
          studentName: child.student.name,
          studentCode: child.student.studentCode,
          studentImage: child.student.profileImage,
          linkStatus: child.status,
        })),
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    }

    console.log("DEBUG: Login successful, sending response");
    try {
      const responseString = JSON.stringify({ success: true, message, data: responseData });
      console.log("DEBUG: Response serialized successfully. Size:", responseString.length);
    } catch (serializeErr) {
      console.error("DEBUG: Failed to serialize response:", serializeErr);
    }
    return res.status(200).json({ success: true, message, data: responseData });
  } catch (error) {
    return handleError(res, error, "auth.login");
  }
};

// =========================
// VERIFY EMAIL CODE
// =========================
export const verifyCheckoutCode = async (req: Request, res: Response) => {
  try {
    const { code, userType } = req.body;
    const rawEmail = req.body.email;
    const normalizedEmail = rawEmail?.toLowerCase().trim();
    const email = normalizedEmail;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and code are required" });
    }

    const normalizedRole = userType
      ?.toUpperCase()
      .trim() as UserRole;

    if (!Object.values(UserRole).includes(normalizedRole)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type" });
    }

    const found = await prisma.verificationCode.findFirst({
      where: { email: normalizedEmail, code, userType: normalizedRole, used: false },
    });

    if (!found)
      return res.status(400).json({ success: false, message: "Invalid code" });
    if (found.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "Code expired" });

    await prisma.verificationCode.update({
      where: { id: found.id },
      data: { used: true },
    });

    // Handle "Register them if not registered"
    let user: any;
    console.log(
      `Verifying checkout for role: ${normalizedRole}, email: [${email}]`,
    );

    // Check if user exists
    switch (normalizedRole) {
      case UserRole.ADMIN:
        user = await prisma.admin.findUnique({
          where: { email },
          include: {
            schoolAdmins: {
              include: {
                school: {
                  select: { id: true, name: true, plan: true, planId: true },
                },
              },
            },
          },
        });

        if (!user) {
          const result = await prisma.$transaction(async (tx) => {
            // 1. Generate standard tenantId (sch-XXXXXX)
            let tenantId: string | undefined;
            const generateSixDigit = () =>
              Math.floor(100000 + Math.random() * 900000).toString();

            for (let attempt = 0; attempt < 10; attempt++) {
              const candidate = "sch-" + generateSixDigit();
              const exists = await tx.school.findFirst({
                where: { tenantId: candidate },
                select: { id: true },
              });
              if (!exists) {
                tenantId = candidate;
                break;
              }
            }

            if (!tenantId) {
              throw new Error("Could not generate unique tenantId");
            }

            // 2. Generate standard codes using the standard utility
            const adminCode = await generateUniqueCode(
              tx as any,
              "admin",
              "School Owner",
            );
            const schoolCode = await generateUniqueCode(
              tx as any,
              "school",
              "My Institution",
            );

            const admin = await tx.admin.create({
              data: {
                email,
                name: "School Owner",
                role: UserRole.ADMIN,
                adminCode,
                verified: true,
                tenantId,
                status: "APPROVED",
              },
            });

            const school = await tx.school.create({
              data: {
                name: "My Institution",
                schoolEmail: email, // Requirement: Use admin's email as school email
                tenantId,
                schoolCode,
                registrationSource: "PRICING",
                profileCompleted: false,
              },
            });

            await tx.schoolSetting.create({
              data: { schoolId: school.id },
            });

            await tx.schoolAdmin.create({
              data: {
                adminId: admin.id,
                schoolId: school.id,
                role: "SCHOOL_OWNER",
              },
            });

            return { ...admin, schoolAdmins: [{ school }] };
          });
          user = result;
        }
        break;
      case UserRole.TEACHER:
        user = await prisma.teacher.findUnique({ where: { email } });
        if (!user) {
          const teacherCode = await generateUniqueCode(
            prisma,
            "teacher",
            "Teacher",
          );
          user = await prisma.teacher.create({
            data: {
              email,
              name: "Teacher",
              role: UserRole.TEACHER,
              teacherCode,
              verified: true,
            },
          });
        }
        break;
      case UserRole.STUDENT:
        user = await prisma.student.findUnique({ where: { email } });
        if (!user) {
          const studentCode = await generateUniqueCode(
            prisma,
            "student",
            "Student",
          );
          user = await prisma.student.create({
            data: {
              email,
              name: "Student",
              role: UserRole.STUDENT,
              studentCode,
              verified: true,
            },
          });
        }
        break;
      case UserRole.PARENT:
        user = await prisma.parent.findUnique({ where: { email } });
        if (!user) {
          const parentCode = await generateUniqueCode(
            prisma,
            "parent",
            "Parent",
          );
          user = await prisma.parent.create({
            data: {
              email,
              fullName: "Parent",
              role: UserRole.PARENT,
              parentCode,
              verified: true,
            },
          });
        }
        break;
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully for checkout.",
      userRole: normalizedRole,
      userId: user?.id,
      plan: user?.plan,
      trialUsed: user?.trialUsed,
    });
  } catch (error) {
    return handleError(res, error, "auth.verifyCheckoutCode");
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, plan: true, trialUsed: true },
    });
    if (admin)
      return res.status(200).json({
        success: true,
        exists: true,
        role: UserRole.ADMIN,
        plan: admin.plan,
        trialUsed: admin.trialUsed,
      });

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true, plan: true, trialUsed: true },
    });
    if (teacher)
      return res.status(200).json({
        success: true,
        exists: true,
        role: UserRole.TEACHER,
        plan: teacher.plan,
        trialUsed: teacher.trialUsed,
      });

    const student = await prisma.student.findUnique({
      where: { email },
      select: { id: true, plan: true, trialUsed: true },
    });
    if (student)
      return res.status(200).json({
        success: true,
        exists: true,
        role: UserRole.STUDENT,
        plan: student.plan,
        trialUsed: student.trialUsed,
      });

    const parent = await prisma.parent.findUnique({
      where: { email },
      select: { id: true, plan: true, trialUsed: true },
    });
    if (parent)
      return res.status(200).json({
        success: true,
        exists: true,
        role: UserRole.PARENT,
        plan: parent.plan,
        trialUsed: parent.trialUsed,
      });

    return res.status(200).json({ success: true, exists: false });
  } catch (error) {
    return handleError(res, error, "auth.checkEmail");
  }
};

export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code, userType } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    console.log("Verifying code for:", { email: normalizedEmail, userType, code });

    if (!email || !code || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and user type are required",
      });
    }

    if (!Object.values(UserRole).includes(userType as UserRole)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type" });
    }
    const check = await prisma.verificationCode.findMany({
      where: { email: normalizedEmail },
    });
    console.log("Existing codes for this email and type:", check);
    const found = await prisma.verificationCode.findFirst({
      where: { email: normalizedEmail, code, userType: userType as UserRole, used: false },
    });

    if (!found)
      return res.status(400).json({ success: false, message: "Invalid code" });
    if (found.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "Code expired" });

    await prisma.verificationCode.update({
      where: { id: found.id },
      data: { used: true },
    });

    let user: any;
    let isSchoolOwner = false;
    let isNewUser = false;

    // Set cookie to remember this device was just verified
    res.cookie("deviceVerified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    switch (userType) {
      case UserRole.ADMIN:
        user = await prisma.admin.findUnique({
          where: { email: normalizedEmail },
          include: { schoolAdmins: { include: { school: true } } },
        });

        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });

        isSchoolOwner = user.schoolAdmins.some(
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER,
        );
        isNewUser = !user.verified;

        user = await prisma.admin.update({
          where: { email: normalizedEmail },
          data: {
            verified: true,
            status: isSchoolOwner ? "APPROVED" : "PENDING",
          },
          include: { schoolAdmins: { include: { school: true } } },
        });

        // Initialize Admin Subscription upon verification
        await UserSubscriptionService.initializeFreePlan(
          user.id,
          UserRole.ADMIN,
        );

        // If School Owner, also initialize School Subscription
        const ownerAdmin = user.schoolAdmins.find(
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER,
        );
        if (ownerAdmin) {
          await SchoolSubscriptionService.initializeFreePlan(
            ownerAdmin.school.id,
          );
        }

        const schools = user.schoolAdmins.map((sa: any) => ({
          schoolId: sa.school.id,
          schoolName: sa.school.name,
          adminRole: sa.role,
          approved:
            sa.role === AdminRole.SCHOOL_OWNER || user.status === "APPROVED",
        }));
        const ownerSchool = user.schoolAdmins.find(
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER,
        );

        const schoolCode = ownerSchool?.school?.schoolCode || null;
        return res.status(200).json({
          success: true,
          isNewUser,
          message: isSchoolOwner
            ? "School owner verified and account approved!"
            : "Admin verified! Waiting for school owner approval.",
          userRole: userType,
          code: schoolCode,
          data: {
            admin: {
              id: user.id,
              name: user.name,
              email: user.email,
              status: user.status,
              verified: user.verified,
              isSchoolOwner,
            },
            schools,
          },
        });

      case UserRole.TEACHER:
        const oldTeacher = await prisma.teacher.findUnique({ where: { email: normalizedEmail } });
        if (oldTeacher) isNewUser = !oldTeacher.verified;
        user = await prisma.teacher.update({
          where: { email: normalizedEmail },
          data: { verified: true },
        });
        // Initialize Teacher Subscription upon verification
        await UserSubscriptionService.initializeFreePlan(
          user.id,
          UserRole.TEACHER,
        );
        return res.status(200).json({
          success: true,
          isNewUser,
          message: "Teacher verified successfully!",
          userRole: userType,
          code: user.teacherCode,
          data: { teacher: user },
        });

      case UserRole.STUDENT:
        const oldStudent = await prisma.student.findUnique({ where: { email: normalizedEmail } });
        if (oldStudent) isNewUser = !oldStudent.verified;
        user = await prisma.student.update({
          where: { email: normalizedEmail },
          data: { verified: true },
        });
        // Initialize Student Subscription upon verification
        await UserSubscriptionService.initializeFreePlan(
          user.id,
          UserRole.STUDENT,
        );
        return res.status(200).json({
          success: true,
          isNewUser,
          message: "Student verified successfully!",
          userRole: userType,
          code: user.studentCode,
          data: { student: user },
        });

      case UserRole.PARENT:
        const oldParent = await prisma.parent.findUnique({ where: { email: normalizedEmail } });
        if (oldParent) isNewUser = !oldParent.verified;
        user = await prisma.parent.update({
          where: { email: normalizedEmail },
          data: { verified: true },
        });
        // Initialize Parent Subscription upon verification
        await UserSubscriptionService.initializeFreePlan(
          user.id,
          UserRole.PARENT,
        );
        return res.status(200).json({
          success: true,
          isNewUser,
          message: "Parent verified successfully!",
          userRole: userType,
          code: user.parentCode,
          data: { parent: user },
        });

      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid user type" });
    }
  } catch (error) {
    return handleError(res, error, "auth.verifyEmailCode");
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res.status(401).json({
        success: false,
        message: "No refresh token",
      });

    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

    const dbToken = await prisma.refreshToken.findFirst({
      where: {
        token,
        userId: payload.userId,
        userType: payload.userType,
        isValid: true,
      },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      console.error("LOG ERROR: [refreshToken] dbToken missing, invalid, or expired for token", token);
      return res.status(401).json({
        success: false,
        message: "Invalid or revoked refresh token",
      });
    }

    const newAccessToken = generateAccessToken(
      payload.userId,
      payload.userType,
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return handleError(res, error, "auth.refreshToken");
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
      res.clearCookie("refreshToken");
    }
    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    return handleError(res, error, "auth.logout");
  }
};

// ====================
// reset password
// ====================

// Add to your auth.controller.ts

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log("Password reset request for email:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Find user across all types
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.teacher.findUnique({ where: { email } }),
      prisma.student.findUnique({ where: { email } }),
      prisma.parent.findUnique({ where: { email } }),
    ]);

    const user = admin || teacher || student || parent;

    // Don't reveal if email exists for security - return generic message
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }
    console.log(user, "user found for password reset");
    // Check if user is verified - provide specific feedback for unverified accounts
    if (!user.verified) {
      return res.status(400).json({
        success: false,
        message:
          "Please verify your email address before resetting your password. Check your inbox for the verification email ok.",
      });
    }

    // Determine user type
    let userType: UserRole;
    if (admin) userType = UserRole.ADMIN;
    else if (teacher) userType = UserRole.TEACHER;
    else if (student) userType = UserRole.STUDENT;
    else userType = UserRole.PARENT;

    // Generate reset token (6-digit code like your verification)
    const resetCode = generateRandomSixDigit();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    // Delete any existing reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        email,
        code: resetCode,
        userType,
        expiresAt,
      },
    });
    const testEmail = process.env.TEST_EMAIL;
    console.log(testEmail, "test email");
    const resendTest = process.env.RESEND_TEST === "true" || false; // default to false if not set
    const mainEmail = resendTest ? testEmail : email;
    // Send reset email
    const result = await sendPasswordResetEmail(mainEmail, resetCode);

    if (result.error) {
      console.log("RESEND PASSWORD RESET ERROR:", result.error);
      // In development/test mode, we might want to know if it failed
      if (resendTest) {
        console.error(
          "Failed to send reset email to test account:",
          result.error,
        );
      }
    } else {
      console.log("RESEND PASSWORD RESET SUCCESS:", result.data);
    }

    return res.status(200).json({
      success: true,
      message: `If an account with the email ${email} exists, a reset link has been sent.`,
    });
  } catch (error: any) {
    return handleError(res, error, "auth.requestPasswordReset");
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    // Find the valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        code: token,
        used: false,
      },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    // Mark token as verified
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { verified: true },
    });

    return res.status(200).json({
      success: true,
      message: "Reset token verified successfully",
      data: {
        email: resetRecord.email,
        userType: resetRecord.userType,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.verifyResetToken");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find and validate the reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        code: token,
        verified: true,
        used: false,
      },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password based on type
    let updatedUser: any;
    switch (resetRecord.userType) {
      case UserRole.ADMIN:
        updatedUser = await prisma.admin.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
      case UserRole.TEACHER:
        updatedUser = await prisma.teacher.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
      case UserRole.STUDENT:
        updatedUser = await prisma.student.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
      case UserRole.PARENT:
        updatedUser = await prisma.parent.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    // Delete any other reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: {
        email: resetRecord.email,
        used: false,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error: any) {
    return handleError(res, error, "auth.resetPassword");
  }
};

// Combined endpoint for the full reset flow
export const completePasswordReset = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find and validate the reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        code: token,
        used: false,
      },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    let updatedUser: any;
    switch (resetRecord.userType) {
      case UserRole.ADMIN:
        updatedUser = await prisma.admin.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
      case UserRole.TEACHER:
        updatedUser = await prisma.teacher.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
      case UserRole.STUDENT:
        updatedUser = await prisma.student.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
      case UserRole.PARENT:
        updatedUser = await prisma.parent.update({
          where: { email: resetRecord.email },
          data: { password: hashedPassword },
        });
        break;
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    // Clean up any other unused reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: {
        email: resetRecord.email,
        used: false,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error: any) {
    return handleError(res, error, "auth.completePasswordReset");
  }
};

// Check if reset token is valid (for the reset page)
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const tokenStr = Array.isArray(token) ? token[0] : (token as string);

    if (!tokenStr) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        code: tokenStr,
        used: false,
      },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reset token is valid",
      data: {
        email: resetRecord.email,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.validateResetToken");
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken, userRole } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required",
      });
    }

    const { user, token } = await googleAuthService(
      idToken,
      userRole as UserRole,
    );

    return res.status(200).json({
      success: true,
      message: "Google Authentication successful",
      data: {
        user: {
          id: user.id,
          name: user.name || user.fullName,
          email: user.email,
          role: user.role,
          adminCode: user.adminCode || undefined,
          teacherCode: user.teacherCode || undefined,
          studentCode: user.studentCode || undefined,
          parentCode: user.parentCode || undefined,
        },
        token,
        userRole: user.role,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.googleAuth");
  }
};

export const finalizeCheckoutSetup = async (req: Request, res: Response) => {
  try {
    const { userType, password, planId, billingCycle, acceptTerms } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    console.log("Finalizing account setup for:", { email, userType, planId });

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and user type are required",
      });
    }

    if (!acceptTerms) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions to continue.",
      });
    }

    const normalizedRole = (userType as string)
      ?.toUpperCase()
      .trim() as UserRole;

    if (!Object.values(UserRole).includes(normalizedRole)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Initial lookup to get user and relations
        let user: any;
        switch (normalizedRole) {
          case UserRole.ADMIN:
            user = await tx.admin.findUnique({
              where: { email },
              include: { schoolAdmins: { include: { school: true } } },
            });
            break;
          case UserRole.TEACHER:
            user = await tx.teacher.findUnique({ where: { email } });
            break;
          case UserRole.STUDENT:
            user = await tx.student.findUnique({ where: { email } });
            break;
          case UserRole.PARENT:
            user = await tx.parent.findUnique({ where: { email } });
            break;
        }

        if (!user) {
          throw new Error("User not found");
        }

        // 2. If it's an ADMIN and we have a planId
        if (normalizedRole === UserRole.ADMIN && planId) {
          // Resolve the actual plan UUID if planId is a type/name
          let actualPlanId = planId;
          const potentialPlan = await tx.subscriptionPlan.findFirst({
            where: {
              OR: [{ id: planId }, { type: planId.toLowerCase() }],
              planScope: PlanScope.SCHOOL,
              category: "schools",
            },
          });

          if (potentialPlan) {
            actualPlanId = potentialPlan.id;
          }

          // Find the school linked to this admin
          const school = user.schoolAdmins?.[0]?.school;

          if (school) {
            // Initialize School Subscription
            await SchoolSubscriptionService.initializeFreePlan(
              school.id,
              tx,
              actualPlanId,
            );

            // Initialize User Subscription
            await UserSubscriptionService.initializeFreePlan(
              user.id,
              UserRole.ADMIN,
              tx,
              actualPlanId,
            );

            // Update School metadata (billingCycle)
            await tx.school.update({
              where: { id: school.id },
              data: {
                billingCycle: billingCycle || "monthly",
                // Ensure name/id match what was initialized
                plan: potentialPlan?.name || school.plan,
                planId: actualPlanId,
              },
            });
          }
        }

        // 3. Final security and metadata update for the user
        const finalUpdateData = {
          password: hashedPassword,
          verified: true,
          billingCycle: billingCycle || "monthly",
          acceptedTerms: true,
          termsAcceptedAt: new Date(),
        };

        switch (normalizedRole) {
          case UserRole.ADMIN:
            user = await tx.admin.update({
              where: { id: user.id },
              data: finalUpdateData,
            });
            break;
          case UserRole.TEACHER:
            user = await tx.teacher.update({
              where: { id: user.id },
              data: finalUpdateData,
            });
            break;
          case UserRole.STUDENT:
            user = await tx.student.update({
              where: { id: user.id },
              data: finalUpdateData,
            });
            break;
          case UserRole.PARENT:
            user = await tx.parent.update({
              where: { id: user.id },
              data: finalUpdateData,
            });
            break;
        }

        return user;
      },
      {
        timeout: 30000, // Increase timeout to 30 seconds to prevent P2028
      },
    );

    // Send confirmation email
    await sendSetupCompleteEmail(email);

    return res.status(200).json({
      success: true,
      message: "Account setup finalized and confirmation email sent.",
    });
  } catch (error: any) {
    return handleError(res, error, "auth.finalizeCheckoutSetup");
  }
};

/**
 * @route   POST /api/v1/auth/claim-account
 * @desc    Claim a pre-registered account (Teacher or Student)
 * @access  Public
 */
export const claimAccount = async (req: Request, res: Response) => {
  try {
    const { token, type, password } = req.body;

    if (!token || !type || !password) {
      return res.status(400).json({
        success: false,
        message: "Token, type, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (type === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { invitationToken: token, isClaimed: false },
      });

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired claim token",
        });
      }

      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          password: hashedPassword,
          isClaimed: true,
          invitationToken: null,
          verified: true,
        },
      });

      // Send notification to school
      const schoolId = teacher.primarySchoolId || teacher.activeSchoolId || teacher.schoolId;
      if (schoolId) {
        try {
          await createNotification({
            recipientType: "SCHOOL",
            recipientId: schoolId,
            senderType: "TEACHER",
            senderId: teacher.id,
            type: "GENERAL",
            title: "Account Claimed",
            message: `Teacher ${teacher.name} has successfully claimed their account.`,
          });
        } catch (e) {
          console.error("Failed to send notification:", e);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Account claimed successfully",
      });
    } else if (type === "student") {
      const student = await prisma.student.findFirst({
        where: { invitationToken: token, isClaimed: false },
      });

      if (!student) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired claim token",
        });
      }

      await prisma.student.update({
        where: { id: student.id },
        data: {
          password: hashedPassword,
          isClaimed: true,
          invitationToken: null,
          verified: true,
        },
      });

      // Send notification to school
      if (student.schoolId) {
        try {
          await createNotification({
            recipientType: "SCHOOL",
            recipientId: student.schoolId,
            senderType: "STUDENT",
            senderId: student.id,
            type: "GENERAL",
            title: "Account Claimed",
            message: `Student ${student.name} has successfully claimed their account.`,
          });
        } catch (e) {
          console.error("Failed to send notification:", e);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Account claimed successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid account type",
      });
    }
  } catch (error: any) {
    return handleError(res, error, "auth.claimAccount");
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id: userId, userType } = req.user!;

    if (!userId || !userType) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let user;
    switch (userType) {
      case UserRole.STUDENT:
        user = await prisma.student.findUnique({ where: { id: userId } });
        break;
      case UserRole.TEACHER:
        user = await prisma.teacher.findUnique({ where: { id: userId } });
        break;
      case UserRole.ADMIN:
        user = await prisma.admin.findUnique({ where: { id: userId } });
        break;
      case UserRole.PARENT:
        user = await prisma.parent.findUnique({ where: { id: userId } });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid user role" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "You are using Google Login. You cannot change your password here.",
      });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateData = { password: hashedPassword };

    switch (userType) {
      case UserRole.STUDENT:
        await prisma.student.update({ where: { id: userId }, data: updateData });
        break;
      case UserRole.TEACHER:
        await prisma.teacher.update({ where: { id: userId }, data: updateData });
        break;
      case UserRole.ADMIN:
        await prisma.admin.update({ where: { id: userId }, data: updateData });
        break;
      case UserRole.PARENT:
        await prisma.parent.update({ where: { id: userId }, data: updateData });
        break;
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    return handleError(res, error, "auth.changePassword");
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const sessions = await prisma.refreshToken.findMany({
      where: { userId, isValid: true },
      select: {
        id: true,
        deviceType: true,
        deviceModel: true,
        osVersion: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: { lastActiveAt: "desc" },
      take: 50,
    });

    const currentToken = req.cookies.refreshToken;
    const currentSession = currentToken ? await prisma.refreshToken.findFirst({ where: { token: currentToken, userId } }) : null;

    const data = sessions.map(session => ({
      ...session,
      isCurrentDevice: currentSession?.id === session.id
    }));

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "auth.getUserSessions");
  }
};

export const revokeUserSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const session = await prisma.refreshToken.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    await prisma.refreshToken.update({
      where: { id },
      data: { isValid: false },
    });

    const currentToken = req.cookies.refreshToken;
    if (currentToken === session.token) {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
    }

    return res.status(200).json({ success: true, message: "Session revoked successfully" });
  } catch (error: any) {
    return handleError(res, error, "auth.revokeUserSession");
  }
};
