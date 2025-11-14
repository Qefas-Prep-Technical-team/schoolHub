import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/database";

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
