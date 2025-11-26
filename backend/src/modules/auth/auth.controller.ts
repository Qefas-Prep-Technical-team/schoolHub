import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/database";
import { loginUser, sendVerificationEmail } from "./auth.service";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "@services/authService";
import jwt from "jsonwebtoken";
import { AdminRole, UserRole } from "generated/prisma";

export const registerSchool = async (req: Request, res: Response) => {
  try {
    const { schoolName, adminName, email, password, subdomain } = req.body;

    if (!schoolName || !adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if admin email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Generate unique tenantId
    const generateSixDigit = () =>
      Math.floor(100000 + Math.random() * 900000).toString();

    let tenantId: string | undefined;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateSixDigit();
      const exists = await prisma.school.findFirst({
        where: { tenantId: candidate },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create school
      const school = await tx.school.create({
        data: {
          name: schoolName,
          subdomain: subdomain || schoolName.toLowerCase().replace(/\s+/g, "-"),
          schoolEmail: email,
          tenantId,
        },
      });

      // Create admin user
      const admin = await tx.admin.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: UserRole.ADMIN, // FIXED: Use enum
          tenantIds: [tenantId],
        },
      });

      // Create school admin relationship
      await tx.schoolAdmin.create({
        data: {
          schoolId: school.id,
          adminId: admin.id,
          role: AdminRole.SCHOOL_OWNER, // FIXED: Use enum
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
        },
        admin: {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
          role: result.admin.role, // RETURN ROLE
        },
        userRole: result.admin.role, // ADDED: Explicit role for redirection
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, tenantId } = req.body;

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

    // Check if email exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Verify school if tenantId is provided
    let schoolToConnect = null;
    let schoolId = null;

    if (tenantId) {
      schoolToConnect = await prisma.school.findFirst({
        where: { tenantId },
      });

      if (!schoolToConnect) {
        return res.status(404).json({
          success: false,
          message: "Invalid Tenant ID. School not found",
        });
      }
      schoolId = schoolToConnect.id;
    }

    // Generate unique teacher code
    const generateTeacherCode = () => {
      const random = Math.floor(100000 + Math.random() * 900000);
      return `tch-${random}`;
    };

    let teacherCode = generateTeacherCode();
    let existingCode = await prisma.teacher.findFirst({
      where: { teacherCode },
    });

    while (existingCode) {
      teacherCode = generateTeacherCode();
      existingCode = await prisma.teacher.findFirst({
        where: { teacherCode },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: UserRole.TEACHER, // FIXED: Use enum
        tenantIds: tenantId ? [tenantId] : [],
        teacherCode,
        schoolId: schoolId,
      },
    });

    return res.status(201).json({
      success: true,
      message: tenantId
        ? "Teacher registered and connected to school successfully"
        : "Independent teacher account created successfully",
      data: {
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: teacher.role, // RETURN ROLE
          tenantIds: teacher.tenantIds,
          teacherCode: teacher.teacherCode,
        },
        userRole: teacher.role, // ADDED: Explicit role for redirection
      },
    });
  } catch (error: any) {
    console.error(error);
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
  tenantId?: string;
  teacherCode?: string;
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
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      tenantId,
      teacherCode,
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
    const studentCode = await ensureUniqueStudentCode();

    // If tenantId provided → verify school exists
    let school = null;
    let schoolId = null;
    if (tenantId) {
      school = await prisma.school.findFirst({
        where: { tenantId },
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School with this Tenant ID not found",
        });
      }
      schoolId = school.id;
    }

    // If teacherCode provided → verify teacher exists
    let teacher = null;
    if (teacherCode) {
      teacher = await prisma.teacher.findFirst({
        where: { teacherCode },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Invalid teacher code",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        studentCode,
        teacherCode: teacherCode || null,
        role: UserRole.STUDENT, // FIXED: Use enum
        tenantIds: tenantId ? [tenantId] : [],
        schoolId: schoolId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role, // RETURN ROLE
          studentCode: student.studentCode,
        },
        userRole: student.role, // ADDED: Explicit role for redirection
        message: "Save this student code to share with your parent for linking",
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
  res: Response
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

    // Check if parent email exists
    const existingParent = await prisma.parent.findUnique({
      where: { email },
    });

    if (existingParent) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create parent account
      const parent = await tx.parent.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: UserRole.PARENT, // FIXED: Use enum
        },
      });

      let linkResult = null;

      // If student code provided, create link
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
            status: "linked",
          },
        });
      }

      return { parent, link: linkResult };
    });

    const response: any = {
      success: true,
      message: "Parent account created successfully",
      data: {
        parent: {
          id: result.parent.id,
          fullName: result.parent.fullName,
          email: result.parent.email,
          role: result.parent.role, // RETURN ROLE
        },
        userRole: result.parent.role, // ADDED: Explicit role for redirection
      },
    };

    if (result.link) {
      response.data.linking = {
        status: "success",
        message: "Successfully linked to your child's account!",
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
      message: "Internal server error. Please try again.",
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

    // Send email via Resend
    await sendVerificationEmail(email, code);

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

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and user type required",
      });
    }

    // Validate userType
    if (!Object.values(UserRole).includes(userType as UserRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    let user: any;

    switch (userType) {
      case UserRole.ADMIN:
        user = await prisma.admin.findUnique({
          where: { email },
          include: {
            schoolAdmins: { include: { school: true } },
          },
        });
        break;
      case UserRole.TEACHER:
        user = await prisma.teacher.findUnique({ where: { email } });
        break;
      case UserRole.STUDENT:
        user = await prisma.student.findUnique({ where: { email } });
        break;
      case UserRole.PARENT:
        user = await prisma.parent.findUnique({ where: { email } });
        break;
    }

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.verified)
      return res
        .status(403)
        .json({ success: false, message: "Email not verified" });

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword)
      return res
        .status(404)
        .json({ success: false, message: "Password incorrect" });

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

    let responseData: any = {};
    let message = "Logged in successfully";

    if (userType === UserRole.ADMIN) {
      const schools = user.schoolAdmins.map((sa: any) => ({
        schoolId: sa.school.id,
        schoolName: sa.school.name,
        adminRole: sa.role,
        approved:
          sa.role === AdminRole.SCHOOL_OWNER || user.status === "APPROVED",
      }));

      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schools,
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

    if (!email || !code || !userType) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email, code, and user type are required",
        });
    }

    if (!Object.values(UserRole).includes(userType as UserRole)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type" });
    }

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
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER
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

        return res.status(200).json({
          success: true,
          message: isSchoolOwner
            ? "School owner verified and account approved!"
            : "Admin verified! Waiting for school owner approval.",
          userRole: userType,
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
      payload.userType
    );
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
