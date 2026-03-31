import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/database";
import { generateUniqueCode } from "../../utils/code-generator";
import {
  loginUser,
  sendPasswordResetEmail,
  sendVerificationEmail,
  googleAuthService,
} from "./auth.service";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "@services/authService";
import jwt from "jsonwebtoken";
import { AdminRole, UserRole } from "@prisma/client";
import { getIO } from "../../socket";

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

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: schoolName,
          subdomain: normalizedSubdomain,
          schoolEmail: email,
          tenantId,
          schoolCode,
        },
      });

      const admin = await tx.admin.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          adminCode,
          tenantIds: [tenantId],
          defaultTenantId: tenantId,
        },
      });

      await tx.schoolAdmin.create({
        data: {
          schoolId: school.id,
          adminId: admin.id,
          role: AdminRole.SCHOOL_OWNER,
        },
      });

      return { school, admin };
    });

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
    if (error?.code === "P2002" && error?.meta?.target?.includes("subdomain")) {
      return res.status(409).json({
        success: false,
        message: "Subdomain already taken. Please choose another.",
      });
    }

    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, schoolCode, studentCode, isIndependent } = req.body;

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

    const teacherCode = await generateUniqueCode(prisma, "teacher", fullName);
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          role: UserRole.TEACHER,
          tenantIds: schoolToConnect ? [schoolToConnect.tenantId] : [],
          defaultTenantId: schoolToConnect ? schoolToConnect.tenantId : "default-tenant-id",
          teacherCode,
          schoolId: schoolToConnect ? schoolToConnect.id : null,
        },
      });

      if (schoolToConnect) {
        await tx.linkRequest.create({
          data: {
            linkType: "SCHOOL_TEACHER",
            requesterType: "TEACHER",
            requesterId: teacher.id,
            requesterCode: teacher.teacherCode,
            targetType: "SCHOOL",
            targetId: schoolToConnect.id,
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
            requesterCode: teacher.teacherCode,
            targetType: "STUDENT",
            targetId: studentToConnect.id,
            targetCode: studentToConnect.studentCode,
            status: "PENDING",
            note: "I would like to connect with you",
            schoolId: studentToConnect.schoolId,
          },
        });
      }

      return { teacher, studentToConnect };
    });

    if (schoolToConnect) {
      getIO().to(`user:${schoolToConnect.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A new teacher has requested to connect",
      });
    }

    if (result.studentToConnect) {
      getIO().to(`user:${result.studentToConnect.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A teacher has requested to connect with you",
      });
    }

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
          tenantIds: result.teacher.tenantIds,
          teacherCode: result.teacher.teacherCode,
        },
        userRole: result.teacher.role,
      },
    });
  } catch (error: any) {
    console.error("Register Teacher Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create student
      const student = await tx.student.create({
        data: {
          name: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          studentCode,
          role: UserRole.STUDENT,
          tenantIds: school ? [school.tenantId] : [],
          defaultTenantId: school ? school.tenantId : "default-tenant-id",
          schoolId: school ? school.id : null,
        },
      });

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
            targetCode: parent.parentCode,
            status: "PENDING",
            note,
          },
        });
      }

      return student;
    });

    const io = getIO();
    if (school) {
      io.to(`user:${school.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A new student has requested to connect",
      });
    }
    if (teacher) {
      io.to(`user:${teacher.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A student has requested to connect with you",
      });
    }
    if (parent) {
      io.to(`user:${parent.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "Your child has registered and requested a link",
      });
    }

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
        message: "Your registration is complete. We've sent connection requests to the specified school/teacher/parent.",
      },
    });
  } catch (error: any) {
    console.error("Register Student Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
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

    const result = await prisma.$transaction(async (tx: any) => {
      const parent = await tx.parent.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: UserRole.PARENT,
          parentCode,
        },
      });

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
            requesterCode: parent.parentCode,
            targetType: "STUDENT",
            targetId: student.id,
            targetCode: student.studentCode,
            status: "PENDING",
            note: "I have registered as your parent",
          },
        });

        studentData = student;
      }

      return { parent, link: linkResult, studentData };
    });

    if (result.studentData) {
      getIO().to(`user:${result.studentData.id}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        message: "A parent has registered and requested to link with your account",
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
    console.error("Parent registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error. Please try again.",
    });
  }
};
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const requestVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email and user type are required",
      });
    }

    // Validate userType using UserRole enum
    if (!Object.values(UserRole).includes(userType as UserRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    // Delete old unused codes for same email and userType
    await prisma.verificationCode.deleteMany({
      where: { email, userType: userType as UserRole, used: false },
    });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save code WITH userType
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        userType: userType as UserRole, // FIXED: Use enum
        expiresAt,
      },
    });
    const testEmail = process.env.TEST_EMAIL;
    console.log(testEmail, "test email");
    const resendTest = process.env.RESEND_TEST === "true" || false; // default to false if not set
    const mainEmail = resendTest ? testEmail : email;
    // Send email via Resend
    const result = await sendVerificationEmail(mainEmail, code);
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
    console.error("Error requesting verification code:", error);
    return res.status(500).json({ success: false, message: "Server error" });
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
    const { email, password, userType } = req.body;
    console.log("Login attempt:", { email, userType });

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and user type required",
      });
    }

    if (!Object.values(UserRole).includes(userType as UserRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    let user: any;

    // Fetch user based on type
    switch (userType) {
      case UserRole.ADMIN:
        user = await prisma.admin.findUnique({
          where: { email },
          include: { schoolAdmins: { include: { school: true } } },
        });
        break;
      case UserRole.TEACHER:
        console.log("Fetching teacher with email:", email);
        user = await prisma.teacher.findUnique({
          where: { email },
          include: { school: true },
        });
        console.log("Fetched teacher:", user);
        break;
      case UserRole.STUDENT:
        console.log("Fetching student with email:", email);
        user = await prisma.student.findUnique({
          where: { email },
          // include: { school: true },
        });
        break;
      case UserRole.PARENT:
        user = await prisma.parent.findUnique({
          where: { email },
          include: {
            children: {
              include: {
                student: true,
              },
            },
          },
        });
        break;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ success: false, message: "Email not verified" });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res
        .status(404)
        .json({ success: false, message: "Password incorrect" });
    }

    // ===== Set defaultTenantId if missing =====
    if (
      user.defaultTenantId === "default-tenant-id" &&
      user.tenantIds &&
      user.tenantIds.length > 0
    ) {
      user.defaultTenantId = user.tenantIds[0];
      // Persist the update to DB
      switch (userType) {
        case UserRole.ADMIN:
          await prisma.admin.update({
            where: { id: user.id },
            data: { defaultTenantId: user.defaultTenantId },
          });
          break;
        case UserRole.TEACHER:
          await prisma.teacher.update({
            where: { id: user.id },
            data: { defaultTenantId: user.defaultTenantId },
          });
          break;
        case UserRole.STUDENT:
          await prisma.student.update({
            where: { id: user.id },
            data: { defaultTenantId: user.defaultTenantId },
          });
          break;
        case UserRole.PARENT:
          await prisma.parent.update({
            where: { id: user.id },
            data: { defaultTenantId: user.defaultTenantId },
          });
          break;
      }
    }
    // ========================================

    const accessToken = generateAccessToken(user.id, userType);
    const refreshToken = await generateRefreshToken(user.id, userType);

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

    console.log(user.defaultTenantId);

    if (userType === UserRole.ADMIN) {
      const schools = user.schoolAdmins.map((sa: any) => ({
        schoolId: sa.school.id,
        schoolName: sa.school.name,
        schoolCode: sa.school.schoolCode,
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
          schools,
          defaultTenantId: user.defaultTenantId,
        },
        userRole: user.role,
        accessToken,
      };
    } else if (userType === UserRole.TEACHER) {
      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teacherCode: user.teacherCode,
          school: user.school,
          defaultTenantId: user.defaultTenantId,
        },
        userRole: user.role,
        accessToken,
      };
    } else if (userType === UserRole.STUDENT) {
      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentCode: user.studentCode,
          school: user.school,

          defaultTenantId: user.defaultTenantId,
        },
        userRole: user.role,
        accessToken,
      };
    } else if (userType === UserRole.PARENT) {
      responseData = {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          defaultTenantId: user.defaultTenantId,
        },
        children: user.children?.map((child: any) => ({
          studentId: child.student.id,
          studentName: child.student.name,
          studentCode: child.student.studentCode,
          linkStatus: child.status,
        })),
        userRole: user.role,
        accessToken,
      };
    }

    return res.status(200).json({ success: true, message, data: responseData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// VERIFY EMAIL CODE
// =========================
export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code, userType } = req.body;
    console.log("Verifying code for:", { email, userType, code });

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
      where: { email },
    });
    console.log("Existing codes for this email and type:", check);
    const found = await prisma.verificationCode.findFirst({
      where: { email, code, userType: userType as UserRole, used: false },
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

    switch (userType) {
      case UserRole.ADMIN:
        user = await prisma.admin.findUnique({
          where: { email },
          include: { schoolAdmins: { include: { school: true } } },
        });

        if (!user)
          return res
            .status(404)
            .json({ success: false, message: "Admin not found" });

        isSchoolOwner = user.schoolAdmins.some(
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER,
        );

        user = await prisma.admin.update({
          where: { email },
          data: {
            verified: true,
            status: isSchoolOwner ? "APPROVED" : "PENDING",
          },
          include: { schoolAdmins: { include: { school: true } } },
        });

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
        user = await prisma.teacher.update({
          where: { email },
          data: { verified: true },
        });
        return res.status(200).json({
          success: true,
          message: "Teacher verified successfully!",
          userRole: userType,
          code: user.teacherCode,
          data: { teacher: user },
        });

      case UserRole.STUDENT:
        user = await prisma.student.update({
          where: { email },
          data: { verified: true },
        });
        return res.status(200).json({
          success: true,
          message: "Student verified successfully!",
          userRole: userType,
          code: user.studentCode,
          data: { student: user },
        });

      case UserRole.PARENT:
        user = await prisma.parent.update({
          where: { email },
          data: { verified: true },
        });
        return res.status(200).json({
          success: true,
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
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
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
      },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
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
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ====================
// reset password
// ====================

// Add to your auth.controller.ts

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

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
    const resetCode = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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
    await sendPasswordResetEmail(mainEmail, resetCode);

    return res.status(200).json({
      success: true,
      message: `If an account with the email ${email}exists, a reset link has been sent.`,
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
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
    console.error("Reset token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    console.error("Complete password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
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
    console.error("Reset token validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken, userRole } = req.body;

    if (!idToken || !userRole) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token and User Role are required",
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
          studentCode: user.studentCode || undefined,
          parentCode: user.parentCode || undefined,
        },
        token,
        userRole: user.role,
      },
    });
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return res.status(error.message.includes("Token") ? 401 : 500).json({
      success: false,
      message: error.message || "Google Authentication failed",
    });
  }
};
