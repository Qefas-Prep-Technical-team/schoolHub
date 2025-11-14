import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

export const registerSchool = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  try {
    const { schoolName, adminName, email, password, subdomain } = req.body;
    if (!schoolName || !adminName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    // Check if admin email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    // Generate unique tenantId
    const tenantId = uuidv4();
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create school and superadmin in a single transaction
    const result = await prisma.$transaction(async (prisma: any) => {
      const school = await prisma.school.create({
        data: {
          name: schoolName,
          subdomain: subdomain || schoolName.toLowerCase().replace(/\s+/g, "-"),
          schoolEmail: email,
          tenantId,
        },
      });
      const admin = await prisma.admin.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: "superadmin",
          schools: { connect: { id: school.id } }, // Link admin to school
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
      return res
        .status(400)
        .json({ success: false, message: "Unique constraint failed" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
