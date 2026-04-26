import jwt from "jsonwebtoken";
import prisma from "../../../config/database";
import { hashPassword, comparePassword } from "../../../services/authService";

const getPlatformSecret = () => {
  const secret = process.env.JWT_PLATFORM_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_PLATFORM_SECRET not set in environment");
  return secret;
};

export const generateStaffToken = (staff: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { 
      staffId: staff.id, 
      email: staff.email, 
      role: staff.role,
      isPlatformStaff: true 
    }, 
    getPlatformSecret(), 
    { expiresIn: "8h" }
  );
};

export const verifyStaffToken = (token: string) => {
  return jwt.verify(token, getPlatformSecret());
};

export { hashPassword, comparePassword };
