import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/database";
import { loginUser, sendVerificationEmail } from "./auth.service";
import { comparePassword, generateAccessToken, generateRefreshToken } from "@services/authService";
import jwt from "jsonwebtoken";

export const registerSchool = async (req: Request, res: Response) => {
  try {
    const { schoolName, adminName, email, password, subdomain } = req.body;
    console.log("here")

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

    // Generate a unique 6-digit numeric tenantId (string)
    const generateSixDigit = () =>
      Math.floor(100000 + Math.random() * 900000).toString();

    let tenantId: string | undefined;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateSixDigit();
      const exists = await prisma.school.findFirst({ where: { tenantId: candidate } });
      if (!exists) {
        tenantId = candidate;
        break;
      }
    }

    if (!tenantId) {
      return res.status(500).json({ success: false, message: "Could not generate unique tenantId, try again" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: schoolName,
          subdomain:
            subdomain || schoolName.toLowerCase().replace(/\s+/g, "-"),
          schoolEmail: email,
          tenantId,
        },
      });

      const admin = await tx.admin.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: "superadmin",
          tenantIds: [tenantId], // ⭐ REQUIRED
          schools: {
            connect: { id: school.id },
          },
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
          name: result.admin.name,
          email: result.admin.email,
        },
      },
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Unique constraint failed (duplicate email or tenantId)",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


//  registration for teachers
export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, tenantId } = req.body;

    // Required fields
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
    }

    // Generate unique teacher code: "tch-123456"
    const generateTeacherCode = () => {
      const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
      return `tch-${random}`;
    };

    let teacherCode = generateTeacherCode();

    // Ensure teacherCode is unique
    let existingCode = await prisma.teacher.findFirst({
      where: { teacherCode },
    });

    // Regenerate until unique
    while (existingCode) {
      teacherCode = generateTeacherCode();
      existingCode = await prisma.teacher.findFirst({
        where: { teacherCode },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          role: tenantId ? "school_teacher" : "independent_teacher",
          tenantIds: tenantId ? [tenantId] : [],
          teacherCode,

          schools: tenantId
            ? {
                connect: { id: schoolToConnect!.id },
              }
            : undefined,
        },
      });

      return { teacher };
    });

    return res.status(201).json({
      success: true,
      message: tenantId
        ? "Teacher registered and connected to school successfully"
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
      },
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Unique constraint failed (duplicate email or teacher code)",
      });
    }

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

// Utility function to generate student code
const generateStudentCode = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `stu-${random}`;
};

// Ensure unique student code
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

export const registerStudent = async (req: Request<{}, {}, RegisterStudentBody>, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, tenantId, teacherCode } = req.body;

    // 1. Validate required fields
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

    // 2. Check if email exists
    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 3. Generate unique student code
    const studentCode = await ensureUniqueStudentCode();

    // 4. If tenantId provided → verify school exists
    let school = null;
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
    }

    // 5. If teacherCode provided → verify teacher exists
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

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create student with generated code
    const student = await prisma.$transaction(async (tx) => {
      return await tx.student.create({
        data: {
          name: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          studentCode, // Add the generated code
          teacherCode: teacherCode || null,
          tenantIds: tenantId ? { set: [tenantId] } : { set: [] },
          schools: school ? { connect: [{ id: school.id }] } : undefined,
          teachers: teacher ? { connect: [{ id: teacher.id }] } : undefined,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentCode: student.studentCode, // Return the code to student
        message: "Save this student code to share with your parent for linking",
      },
    });
  } catch (error: any) {
    console.error("Register Student Error:", error);

    if (error.message.includes("unique student code")) {
      return res.status(500).json({
        success: false,
        message: "Could not generate unique student code. Please try again.",
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email must be unique",
      });
    }

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
  studentCode?: string; // Changed from studentCodeOrEmail to studentCode only
}

export const registerParent = async (req: Request<{}, {}, RegisterParentBody>, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, studentCode } = req.body;

    // Validate required fields
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

    // Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create parent account
      const parent = await tx.parent.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });

      let linkResult = null;

      // If student code provided, create link
      if (studentCode) {
        // Verify student exists with this code
        const student = await tx.student.findFirst({
          where: { studentCode: studentCode.trim() },
        });

        if (!student) {
          throw new Error("Invalid student code");
        }

        // Check if link already exists
        const existingLink = await tx.parentChildLink.findFirst({
          where: {
            parentId: parent.id,
            studentCode: studentCode.trim(),
          },
        });

        if (existingLink) {
          throw new Error("Link already exists");
        }

        linkResult = await tx.parentChildLink.create({
          data: {
            parentId: parent.id,
            studentCode: studentCode.trim(),
            status: "linked", // Auto-link since we verified the code
          },
        });
      }

      return { parent, link: linkResult };
    });

    // Prepare response
    const response: any = {
      success: true,
      message: "Parent account created successfully",
      data: {
        parent: {
          id: result.parent.id,
          fullName: result.parent.fullName,
          email: result.parent.email,
        },
      },
    };

    // Add linking info if applicable
    if (result.link) {
      response.data.linking = {
        status: "success",
        message: "Successfully linked to your child's account!",
      };
    } else {
      response.data.linking = {
        message: "You can link to your child's account later using their student code.",
      };
    }

    return res.status(201).json(response);

  } catch (error: any) {
    console.error("Parent registration error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    if (error.message === "Invalid student code") {
      return res.status(400).json({
        success: false,
        message: "Invalid student code. Please check the code and try again.",
      });
    }

    if (error.message === "Link already exists") {
      return res.status(400).json({
        success: false,
        message: "This student is already linked to a parent account.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
};


// 🔹 Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();


// ==============================
// 1️⃣ Request Verification Code
// ==============================
export const requestVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Delete old unused codes for same email
    await prisma.verificationCode.deleteMany({
      where: { email, used: false },
    });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code
    await prisma.verificationCode.create({
      data: {
        email,
        code,
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


// ==============================
// 2️⃣ Verify Code & Update Verified Field
// ==============================
export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // 1️⃣ Find the unused code
    const found = await prisma.verificationCode.findFirst({
      where: { email, code, used: false },
    });

    if (!found) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    // 2️⃣ Check expiry
    if (found.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    // 3️⃣ Mark code as used
    await prisma.verificationCode.update({
      where: { id: found.id },
      data: { used: true },
    });

    // 4️⃣ Find the user
    const student = await prisma.student.findUnique({ where: { email } });
    if (student) {
      await prisma.student.update({
        where: { email },
        data: { verified: true },
      });
      return res.status(200).json({
        success: true,
        message: "Student email verified successfully",
      });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (teacher) {
      await prisma.teacher.update({
        where: { email },
        data: { verified: true },
      });
      return res.status(200).json({
        success: true,
        message: "Teacher email verified successfully",
      });
    }

    const parent = await prisma.parent.findUnique({ where: { email } });
    if (parent) {
      await prisma.parent.update({
        where: { email },
        data: { verified: true },
      });
      return res.status(200).json({
        success: true,
        message: "Parent email verified successfully",
      });
    }
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      await prisma.admin.update({
        where: { email },
        data: { verified: true },
      });
      return res.status(200).json({
        success: true,
        message: "Parent email verified successfully",
      });
    }

    // 5️⃣ Email does not belong to any known user
    return res.status(404).json({
      success: false,
      message: "No user found for this email",
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



// // =====================================================
// LOGIN Begins
// =======================================================

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, userType } = req.body;
console.log(email)
    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, message: "Email, password and userType required" });
    }

    // Find user dynamically
    let user: any;
    switch (userType) {
      case "ADMIN":
        user = await prisma.admin.findUnique({ where: { email } });
        break;
      case "TEACHER":
        user = await prisma.teacher.findUnique({ where: { email } });
        break;
      case "STUDENT":
        user = await prisma.student.findUnique({ where: { email } });
        break;
      case "PARENT":
        user = await prisma.parent.findUnique({ where: { email } });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid userType" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.verified) {
      return res.status(403).json({ success: false, message: "Email not verified" });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id, userType);
    const refreshToken = await generateRefreshToken(user.id, userType);

    // Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || null,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// src/controllers/auth.controller.ts (add below login function)
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

    const dbToken = await prisma.refreshToken.findFirst({
      where: { token, userId: payload.userId, userType: payload.userType },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(payload.userId, payload.userType);
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};


export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
      res.clearCookie("refreshToken");
    }
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
