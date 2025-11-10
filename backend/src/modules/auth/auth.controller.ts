import { Request, Response } from "express";

import { SchoolModel } from "../school/school.model";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { AdminModel } from "modules/admin/admin.model";

export const registerSchool = async (req: Request, res: Response) => {
  try {
    const { schoolName, adminName, email, password, subdomain } = req.body;

    // Check if email already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Create unique tenant ID for the new school
    const tenantId = uuidv4();

    // Create new school
    const newSchool = await SchoolModel.create({
      name: schoolName,
      subdomain: subdomain || schoolName.toLowerCase().replace(/\s+/g, "-"),
      schoolEmail: email,
      tenantId,
      admins: [],
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await AdminModel.create({
      name: adminName,
      email,
      password: hashedPassword,
      role: "superadmin",
      tenantIds: [tenantId],
    });

    // Link admin to school
    newSchool.admins.push(newAdmin._id);
    await newSchool.save();

    return res.status(201).json({
      success: true,
      message: "School and admin registered successfully",
      data: {
        school: {
          name: newSchool.name,
          tenantId: newSchool.tenantId,
          subdomain: newSchool.subdomain,
        },
        admin: {
          name: newAdmin.name,
          email: newAdmin.email,
        },
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
